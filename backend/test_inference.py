# ─────────────────────────────────────────────────────────────────────────────
# NeuroSegAI — Standalone Inference Test Script
# Run this BEFORE starting the full server to verify the AI pipeline works.
#
# Usage:
#   1. Edit BRATS_PATIENT_PATH below to point to any patient folder
#   2. Run: python test_inference.py
# ─────────────────────────────────────────────────────────────────────────────

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# ── EDIT THIS PATH to your BraTS 2020 patient folder ─────────────────────────
BRATS_PATIENT_PATH = r"C:\Users\Shour\Desktop\BraTS2020_TrainingData\MICCAI_BraTS2020_TrainingData\BraTS20_Training_001"
PATIENT_ID         = "BraTS20_Training_001"
# ─────────────────────────────────────────────────────────────────────────────

test_file = os.path.join(BRATS_PATIENT_PATH, f"{PATIENT_ID}_flair.nii.gz")

if not os.path.exists(test_file):
    print(f"❌ File not found: {test_file}")
    print("   Please update BRATS_PATIENT_PATH in this script.")
    sys.exit(1)

print("=" * 55)
print("  NeuroSegAI — Inference Test")
print("=" * 55)
print(f"  Patient : {PATIENT_ID}")
print(f"  File    : {os.path.basename(test_file)}")
print("=" * 55)

from app.ml_pipeline.inference import run_inference

print("\n⏳ Running inference (first run downloads weights ~200MB)...\n")

result = run_inference(test_file)

print("\n" + "=" * 55)
print("  RESULTS")
print("=" * 55)
print(f"  Whole Tumor Volume   : {result['whole_tumor_volume']} cm³")
print(f"  Tumor Core Volume    : {result['tumor_core_volume']} cm³")
print(f"  Enhancing Volume     : {result['enhancing_tumor_volume']} cm³")
print(f"  Urgency Score        : {result['urgency_score']}")
print("=" * 55)
print("\n✅ Inference test passed! You can now start the full server.\n")
