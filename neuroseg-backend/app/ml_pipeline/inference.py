import os
import torch
import numpy as np
import nibabel as nib
from monai.networks.nets import SegResNet
from monai.inferers import SlidingWindowInferer
from monai.transforms import Compose, LoadImaged, EnsureChannelFirstd, Orientationd, ToTensord

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- THE ARCHITECTURE FIX IS HERE ---
model = SegResNet(
    spatial_dims=3,
    in_channels=4,      
    out_channels=3,     
    init_filters=16,    # <--- This matches the 16-channel pre-trained weights!
    dropout_prob=0.2,   
).to(DEVICE)
# ------------------------------------

WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "weights", "model.pt")
if os.path.exists(WEIGHTS_PATH):
    model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))
    print("✅ Pre-trained MONAI weights loaded successfully!")
else:
    print("⚠️ Weights missing!")

model.eval()

# The 6GB VRAM Savior (Sliding Window)
inferer = SlidingWindowInferer(roi_size=(96, 96, 96), sw_batch_size=1, overlap=0.25)

def run_segmentation(file_paths: dict):
    print("🧠 AI is processing the 3D scans...")
    data_dict = {"image": [
        file_paths["flair"], file_paths["t1w"], 
        file_paths["t1ce"], file_paths["t2w"]
    ]}

    transforms = Compose([
        LoadImaged(keys=["image"]),
        EnsureChannelFirstd(keys=["image"]),
        Orientationd(keys=["image"], axcodes="RAS"),
        ToTensord(keys=["image"]),
    ])

    input_data = transforms(data_dict)
    input_tensor = input_data["image"].unsqueeze(0).to(DEVICE)

    # Run AI Prediction
    with torch.no_grad():
        with torch.cuda.amp.autocast():
            output_tensor = inferer(input_tensor, model)
            
    predicted_mask = torch.argmax(output_tensor, dim=1).squeeze().cpu().numpy()

    # Math: Calculate Volume in cm³ (Assuming 1x1x1 mm voxels)
    core_voxels = np.sum(predicted_mask == 1)
    edema_voxels = np.sum(predicted_mask == 2)

    core_volume_cm3 = round((core_voxels * 1.0) / 1000, 2)
    edema_volume_cm3 = round((edema_voxels * 1.0) / 1000, 2)

    # Triage Logic
    urgency_score = "Routine"
    if core_volume_cm3 > 30.0:
        urgency_score = "CRITICAL EMERGENCY"
    elif core_volume_cm3 > 15.0:
        urgency_score = "Urgent"

    return {
        "core_volume_cm3": core_volume_cm3,
        "edema_volume_cm3": edema_volume_cm3,
        "urgency_score": urgency_score
    }