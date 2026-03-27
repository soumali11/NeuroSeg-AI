import os
import shutil
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.ml_pipeline.inference import run_inference

# Load environment variables
load_dotenv()

router = APIRouter()

# ── NO-HARDCODE SETUP ─────────────────────────────────────────────────────────
TEMP_DIR = os.getenv("TEMP_UPLOAD_DIR", "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)
DATA_DIR = os.getenv("BRATS_DATA_DIR")

# ── POST: Analyze a new scan ──────────────────────────────────────────────────
@router.post("/analyze")
async def analyze_scan(
    patient_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not (file.filename.endswith(".nii") or file.filename.endswith(".nii.gz")):
        raise HTTPException(status_code=400, detail="Only .nii or .nii.gz files accepted")

    file_path = os.path.join(TEMP_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = run_inference(file_path)

        scan = models.ScanResult(
            patient_name           = patient_name,
            filename               = file.filename,
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
        if os.path.exists(file_path):
            os.remove(file_path)


# ── GET: All results ──────────────────────────────────────────────────────────
@router.get("/results")
def get_all_results(db: Session = Depends(get_db)):
    return db.query(models.ScanResult)\
             .order_by(models.ScanResult.created_at.desc())\
             .all()


# ── GET: Single result ────────────────────────────────────────────────────────
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


# ── GET: Auto-Fetch Available Patients (For Frontend Dropdown) ────────────────
@router.get("/patients")
def get_available_patients():
    """Scans the BraTS directory and returns a list of patient folders."""
    if not DATA_DIR or not os.path.exists(DATA_DIR):
        return {"error": "Dataset path not found. Please check your .env file."}
    
    try:
        patients = [
            folder for folder in os.listdir(DATA_DIR) 
            if os.path.isdir(os.path.join(DATA_DIR, folder)) and "BraTS" in folder
        ]
        return {"patients": sorted(patients)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))