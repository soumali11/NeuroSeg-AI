import os
import shutil
from monai.bundle import download

print("🚀 Initializing MONAI Model Zoo Downloader...")

# Define the exact folder where the backend expects the weights
weights_dir = os.path.join("app", "ml_pipeline", "weights")
os.makedirs(weights_dir, exist_ok=True)

print("⏳ Downloading 'brats_mri_segmentation' bundle (This may take 1-3 minutes depending on wifi)...")

try:
    # 1. Download the official bundle
    download(name="brats_mri_segmentation", bundle_dir=weights_dir)
    
    # 2. Locate the specific .pt file inside the downloaded bundle
    bundle_model_path = os.path.join(weights_dir, "brats_mri_segmentation", "models", "model.pt")
    final_model_path = os.path.join(weights_dir, "model.pt")
    
    # 3. Move the .pt file to the exact spot inference.py is looking for it
    if os.path.exists(bundle_model_path):
        # If an old one exists, remove it first to avoid errors
        if os.path.exists(final_model_path):
            os.remove(final_model_path)
            
        shutil.move(bundle_model_path, final_model_path)
        print(f"✅ SUCCESS: Model extracted and saved to {final_model_path}")
        
        # 4. Clean up the extra bundle files we don't need for inference
        shutil.rmtree(os.path.join(weights_dir, "brats_mri_segmentation"))
        print("🧹 Cleaned up temporary files. You are ready to run the AI!")
    else:
        print(f"⚠️ Warning: Downloaded, but couldn't find the model at {bundle_model_path}")
        
except Exception as e:
    print(f"❌ Error downloading model: {e}")