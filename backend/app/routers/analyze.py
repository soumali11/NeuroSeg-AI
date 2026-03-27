import os
import shutil
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.ml_pipeline.inference import run_inference
from typing import List

# Load environment variables
load_dotenv()

router = APIRouter()

# ── NO-HARDCODE SETUP ─────────────────────────────────────────────────────────
TEMP_DIR = os.getenv("TEMP_UPLOAD_DIR", "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)
DATA_DIR = os.getenv("BRATS_DATA_DIR")

# ── POST: Analyze a new scan (NOW ACCEPTS MULTIPLE FILES) ─────────────────────
@router.post("/analyze")
async def analyze_scan(
    patient_name: str = Form(...),
    files: List[UploadFile] = File(...), # <--- Changed to List[UploadFile]
    db: Session = Depends(get_db)
):
    # Create a unique temporary folder for this specific patient's 4 scans
    patient_temp_dir = os.path.join(TEMP_DIR, patient_name)
    os.makedirs(patient_temp_dir, exist_ok=True)

    try:
        # Loop through and save all 4 modalities into the temp folder
        for f in files:
            if not (f.filename.endswith(".nii") or f.filename.endswith(".nii.gz")):
                raise HTTPException(status_code=400, detail=f"Invalid file: {f.filename}. Only .nii or .nii.gz accepted")
            
            file_path = os.path.join(patient_temp_dir, f.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(f.file, buffer)

        # Pass the entire FOLDER path to the AI inference pipeline
        result = run_inference(patient_temp_dir)

        # Save the result to the database
        scan = models.ScanResult(
            patient_name           = patient_name,
            filename               = "4 Modalities (.nii)", # Updated to reflect multiple files
            whole_tumor_volume     = result["whole_tumor_volume"],
            tumor_core_volume      = result["tumor_core_volume"],
            enhancing_tumor_volume = result["enhancing_tumor_volume"],
            urgency_score          = result["urgency_score"],
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        result["id"] = scan.id
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up: Delete the temporary patient folder and all files inside it
        if os.path.exists(patient_temp_dir):
            shutil.rmtree(patient_temp_dir)


# ── GET: All results (optionally filtered by patient_name) ────────────────────
@router.get("/results")
def get_all_results(patient_name: str = None, db: Session = Depends(get_db)):
    query = db.query(models.ScanResult)
    if patient_name:
        query = query.filter(models.ScanResult.patient_name == patient_name)
    return query.order_by(models.ScanResult.created_at.desc()).all()


# ── GET: Single result by numeric ID ─────────────────────────────────────────
@router.get("/results/{scan_id}")
def get_result(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.ScanResult)\
             .filter(models.ScanResult.id == scan_id)\
             .first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


# ── DELETE: Remove a result ───────────────────────────────────────────────────
@router.delete("/results/{scan_id}")
def delete_result(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.ScanResult)\
             .filter(models.ScanResult.id == scan_id)\
             .first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    db.delete(scan)
    db.commit()
    return {"message": "Deleted successfully"}


# ── GET: Patient Dropdown List ────────────────────────────────────────────────
@router.get("/patients")
async def get_patients():
    # Read from environment variable — set BRATS_DATA_DIR in your .env file
    data_dir = os.getenv("BRATS_DATA_DIR", "")

    if not data_dir:
        return {"error": "BRATS_DATA_DIR environment variable is not set. Add it to your .env file."}

    try:
        if not os.path.exists(data_dir):
            return {"error": f"Could not find path: {data_dir}. Check your BRATS_DATA_DIR value."}

        patients = [f for f in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, f))]
        return {"patients": patients}
    except Exception as e:
        return {"error": str(e)}