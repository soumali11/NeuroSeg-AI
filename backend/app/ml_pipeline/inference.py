# ─────────────────────────────────────────────────────────────────────────────
# NeuroSegAI — MONAI Inference Engine
# Model  : brats_mri_segmentation (MONAI Model Zoo pretrained)
# Input  : 4-modality BraTS NIfTI file (flair, t1, t1ce, t2)
# Output : Tumor volumes in cm³ + Surgical urgency score
# ─────────────────────────────────────────────────────────────────────────────

import os
import numpy as np
import torch

from monai.transforms import (
    Compose,
    LoadImaged,
    EnsureChannelFirstd,
    EnsureTyped,
    Spacingd,
    Orientationd,
    NormalizeIntensityd,
    CropForegroundd,
)
from monai.inferers import sliding_window_inference
from monai.bundle import ConfigParser, load
from monai.data import MetaTensor

# ── Config ────────────────────────────────────────────────────────────────────
WEIGHTS_DIR = "app/ml_pipeline/weights/brats_mri_segmentation"
DEVICE      = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"[NeuroSegAI] Device : {DEVICE}")
if torch.cuda.is_available():
    vram = torch.cuda.get_device_properties(0).total_memory // 1024**3
    print(f"[NeuroSegAI] GPU    : {torch.cuda.get_device_name(0)} ({vram} GB VRAM)")

# ── Download pretrained weights if not already present ───────────────────────
def download_weights():
    model_path = os.path.join(WEIGHTS_DIR, "models", "model.pt")
    if not os.path.exists(model_path):
        print("[NeuroSegAI] Weights not found. Downloading from MONAI Model Zoo...")
        load(
            name="brats_mri_segmentation",
            bundle_dir="app/ml_pipeline/weights/"
        )
        print("[NeuroSegAI] ✅ Weights downloaded successfully!")
    else:
        print("[NeuroSegAI] ✅ Weights already present. Skipping download.")

# ── Load model into GPU/CPU memory ───────────────────────────────────────────
def load_model():
    download_weights()

    parser = ConfigParser()
    parser.read_config(os.path.join(WEIGHTS_DIR, "configs", "inference.json"))

    model = parser.get_parsed_content("network")
    weights_path = os.path.join(WEIGHTS_DIR, "models", "model.pt")

    checkpoint = torch.load(weights_path, map_location=DEVICE)

    # Handle both raw state_dict and wrapped checkpoint formats
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.to(DEVICE)
    model.eval()
    print("[NeuroSegAI] ✅ Model loaded and ready!")
    return model

# Load once at startup — stays in GPU memory for all subsequent requests
MODEL = load_model()

# ── Preprocessing pipeline ────────────────────────────────────────────────────
def get_transforms():
    return Compose([
        LoadImaged(keys=["image"]),
        EnsureChannelFirstd(keys=["image"]),
        EnsureTyped(keys=["image"], dtype=torch.float32),
        Orientationd(keys=["image"], axcodes="RAS"),
        Spacingd(
            keys=["image"],
            pixdim=(1.0, 1.0, 1.0),
            mode="bilinear"
        ),
        NormalizeIntensityd(
            keys=["image"],
            nonzero=True,       # Only normalise brain (non-zero) voxels
            channel_wise=True   # Each MRI modality normalised independently
        ),
        CropForegroundd(
            keys=["image"],
            source_key="image",
            allow_smaller=True
        ),
    ])

# ── Surgical Urgency Triage Logic ─────────────────────────────────────────────
def calculate_urgency(whole_vol: float, enhancing_vol: float) -> str:
    if enhancing_vol > 10.0:
        return "CRITICAL EMERGENCY"
    elif enhancing_vol > 5.0 or whole_vol > 50.0:
        return "PRIORITY"
    else:
        return "ROUTINE"

# ── Main inference function ───────────────────────────────────────────────────
def run_inference(input_path: str) -> dict:
    transforms = get_transforms()

    # 1. Check if input_path is a directory containing 4 files (from web app)
    if os.path.isdir(input_path):
        files = os.listdir(input_path)
        
        # Safely identify the 4 required modalities based on their filenames
        flair = next((f for f in files if "flair" in f.lower()), None)
        t1ce  = next((f for f in files if "t1ce" in f.lower() or "t1c" in f.lower()), None)
        t1    = next((f for f in files if "t1" in f.lower() and "t1ce" not in f.lower() and "t1c" not in f.lower()), None)
        t2    = next((f for f in files if "t2" in f.lower()), None)

        if not all([flair, t1ce, t1, t2]):
            raise ValueError(f"Missing one or more modalities. Found: FLAIR={flair}, T1c={t1ce}, T1={t1}, T2={t2}")

        # BraTS Model Standard Channel Order: 0:FLAIR, 1:T1ce, 2:T1, 3:T2
        image_paths = [
            os.path.join(input_path, flair),
            os.path.join(input_path, t1ce),
            os.path.join(input_path, t1),
            os.path.join(input_path, t2)
        ]
        
        # MONAI will automatically stack these 4 paths into a 4-channel tensor!
        data = transforms({"image": image_paths})
    else:
        # Fallback for the single-file test script
        data = transforms({"image": input_path})

    image = data["image"]

    # ── Ensure correct tensor type ────────────────────────────────────────────
    if isinstance(image, MetaTensor):
        image_tensor = image.as_tensor()
    else:
        image_tensor = torch.as_tensor(image)

    # Safety catch: EnsureChannelFirstd sometimes adds an extra batch dim when loading lists
    if len(image_tensor.shape) == 5 and image_tensor.shape[0] == 1:
        image_tensor = image_tensor.squeeze(0)

    # ── Handle channel count ──────────────────────────────────────────────────
    num_channels = image_tensor.shape[0]

    if num_channels == 1:
        print("[NeuroSegAI] Warning: Single channel detected. Duplicating to 4 channels.")
        image_tensor = image_tensor.repeat(4, 1, 1, 1)
    elif num_channels < 4:
        padding = image_tensor[:1].repeat(4 - num_channels, 1, 1, 1)
        image_tensor = torch.cat([image_tensor, padding], dim=0)
        print(f"[NeuroSegAI] Warning: {num_channels} channels found. Padded to 4.")
    elif num_channels > 4:
        image_tensor = image_tensor[:4]
        print(f"[NeuroSegAI] Warning: {num_channels} channels found. Trimmed to 4.")

    # Add batch dimension → shape becomes (1, 4, H, W, D)
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)

    print(f"[NeuroSegAI] Input tensor shape: {image_tensor.shape}")

    # ── Sliding window inference ──────────────────────────────────────────────
    with torch.no_grad():
        output = sliding_window_inference(
            inputs        = image_tensor,
            roi_size      = (128, 128, 128),
            sw_batch_size = 1,
            predictor     = MODEL,
            overlap       = 0.5,
        )

    # ── Parse segmentation mask ───────────────────────────────────────────────
    pred_mask = torch.argmax(output, dim=1).squeeze(0).cpu().numpy()

    # ── Volume calculation ────────────────────────────────────────────────────
    voxel_size_cm3 = 0.001

    whole_vol     = round(float(np.sum(pred_mask > 0))  * voxel_size_cm3, 2)
    core_vol      = round(float(np.sum(pred_mask == 1)) * voxel_size_cm3, 2)
    enhancing_vol = round(float(np.sum(pred_mask == 3)) * voxel_size_cm3, 2)

    urgency = calculate_urgency(whole_vol, enhancing_vol)

    print(f"[NeuroSegAI] Whole: {whole_vol} cm³ | Core: {core_vol} cm³ | Enhancing: {enhancing_vol} cm³ | → {urgency}")

    return {
        "whole_tumor_volume"    : whole_vol,
        "tumor_core_volume"     : core_vol,
        "enhancing_tumor_volume": enhancing_vol,
        "urgency_score"         : urgency,
    }