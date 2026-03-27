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
# BraTS 2020 standard preprocessing:
#   1. Resample to 1mm³ isotropic voxels
#   2. Reorient to RAS standard
#   3. Normalise intensity per modality (mean/std of non-zero voxels)
#   4. Crop black borders to reduce input size

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
    """
    Surgical urgency classification based on tumor volumes (cm³).
    Thresholds based on clinical neuro-oncology literature.

    CRITICAL EMERGENCY : Enhancing tumor > 10 cm³ → Immediate surgery
    PRIORITY           : Enhancing > 5 cm³ or Whole > 50 cm³ → Soon
    ROUTINE            : Below thresholds → Schedule normally
    """
    if enhancing_vol > 10.0:
        return "CRITICAL EMERGENCY"
    elif enhancing_vol > 5.0 or whole_vol > 50.0:
        return "PRIORITY"
    else:
        return "ROUTINE"

# ── Main inference function ───────────────────────────────────────────────────
def run_inference(file_path: str) -> dict:
    """
    Runs full 3D segmentation on a NIfTI MRI scan using the
    pretrained MONAI brats_mri_segmentation model.

    The model expects 4 input channels (flair, t1, t1ce, t2).
    If a single-channel file is uploaded, it is duplicated across
    all 4 channels as a graceful fallback.

    Args:
        file_path (str): Path to the .nii or .nii.gz file

    Returns:
        dict: {
            whole_tumor_volume     : float (cm³),
            tumor_core_volume      : float (cm³),
            enhancing_tumor_volume : float (cm³),
            urgency_score          : str
        }
    """
    transforms = get_transforms()

    # Load and preprocess the scan
    data = transforms({"image": file_path})
    image = data["image"]

    # ── Ensure correct tensor type ────────────────────────────────────────────
    if isinstance(image, MetaTensor):
        image_tensor = image.as_tensor()
    else:
        image_tensor = torch.as_tensor(image)

    # ── Handle channel count ──────────────────────────────────────────────────
    # Model strictly needs 4 channels (one per MRI modality)
    num_channels = image_tensor.shape[0]

    if num_channels == 1:
        # Single modality — duplicate to simulate 4 channels
        print("[NeuroSegAI] Warning: Single channel detected. Duplicating to 4 channels.")
        image_tensor = image_tensor.repeat(4, 1, 1, 1)
    elif num_channels < 4:
        # Pad missing channels by repeating the first channel
        padding = image_tensor[:1].repeat(4 - num_channels, 1, 1, 1)
        image_tensor = torch.cat([image_tensor, padding], dim=0)
        print(f"[NeuroSegAI] Warning: {num_channels} channels found. Padded to 4.")
    elif num_channels > 4:
        # Trim to first 4 channels
        image_tensor = image_tensor[:4]
        print(f"[NeuroSegAI] Warning: {num_channels} channels found. Trimmed to 4.")

    # Add batch dimension → shape becomes (1, 4, H, W, D)
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)

    print(f"[NeuroSegAI] Input tensor shape: {image_tensor.shape}")

    # ── Sliding window inference ──────────────────────────────────────────────
    # Chops the 3D brain into overlapping 128³ patches
    # Runs model on each patch → stitches results back together
    # overlap=0.5 gives smoother boundary predictions
    #
    # ⚠️  OOM Error? Reduce roi_size to (96, 96, 96) below

    with torch.no_grad():
        output = sliding_window_inference(
            inputs        = image_tensor,
            roi_size      = (128, 128, 128),
            sw_batch_size = 1,
            predictor     = MODEL,
            overlap       = 0.5,
        )

    # ── Parse segmentation mask ───────────────────────────────────────────────
    # Output: (1, 4, H, W, D) — 4 class probability maps
    # After argmax each voxel gets one label:
    #   0 = Background / Normal brain
    #   1 = Necrotic core (NCR/NET)
    #   2 = Peritumoral edema (whole tumor region)
    #   3 = Enhancing tumor (most aggressive, active growth)

    pred_mask = torch.argmax(output, dim=1).squeeze(0).cpu().numpy()

    # ── Volume calculation ────────────────────────────────────────────────────
    # After resampling to 1mm³ spacing:
    #   1 voxel = 1 mm³ = 0.001 cm³
    # So: volume_cm3 = voxel_count × 0.001

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
