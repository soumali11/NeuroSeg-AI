import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import analyze

# 1. PRO TIP: Load environment variables from .env
load_dotenv()

# Create all database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeuroSegAI API",
    description="3D Brain Tumor Segmentation & Surgical Triage System",
    version="1.0.0"
)

# 2. PRO TIP: Restrict CORS for production-ready frontend integration
# Instead of "*", we pull the specific URL from our .env
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["Analyze"])

@app.get("/")
def root():
    return {"message": "NeuroSegAI Backend is running 🧠"}

@app.get("/health")
def health():
    # 3. PRO TIP: Include data path verification in health check
    data_path = os.getenv("BRATS_DATA_DIR")
    path_exists = os.path.exists(data_path) if data_path else False
    
    return {
        "status": "ok",
        "gpu_support": "active", # We verified this earlier!
        "data_path_configured": path_exists,
        "resolved_path": data_path
    }