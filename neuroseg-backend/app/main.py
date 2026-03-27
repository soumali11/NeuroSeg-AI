from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware  # <-- ADD THIS IMPORT
from sqlalchemy.orm import Session
import shutil
import os
from .database import engine, Base, get_db
from .models import ScanResult
from .ml_pipeline.inference import run_segmentation

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroSeg AI Backend")

# --- ADD THIS CORS BLOCK TO PREVENT BROWSER ERRORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------------

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ... (Keep your @app.post("/analyze") route exactly the same below this)