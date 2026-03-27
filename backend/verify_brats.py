# ─────────────────────────────────────────────────────────────────────────────
# NeuroSegAI — BraTS 2020 Data Verification Script
# Run this to confirm your BraTS dataset is readable and correctly structured.
# Usage: python verify_brats.py
# ─────────────────────────────────────────────────────────────────────────────

import os
import sys

# ── EDIT THIS to your BraTS 2020 root folder ─────────────────────────────────
BRATS_ROOT = r"C:\Users\Shour\Desktop\BraTS2020_TrainingData"
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 55)
print("  NeuroSegAI — BraTS 2020 Data Verification")
print("=" * 55)

if not os.path.exists(BRATS_ROOT):
    print(f"❌ Path not found: {BRATS_ROOT}")
    print("   Update BRATS_ROOT in this script.")
    sys.exit(1)

patients = sorted([
    d for d in os.listdir(BRATS_ROOT)
    if os.path.isdir(os.path.join(BRATS_ROOT, d))
])

print(f"  Found {len(patients)} patient folders\n")

MODALITIES = ["flair", "t1", "t1ce", "t2", "seg"]
errors = 0

# Check first 5 patients
for patient in patients[:5]:
    patient_dir = os.path.join(BRATS_ROOT, patient)
    print(f"  Checking: {patient}")
    for mod in MODALITIES:
        fname = f"{patient}_{mod}.nii.gz"
        fpath = os.path.join(patient_dir, fname)
        exists = os.path.exists(fpath)
        status = "✅" if exists else "❌"
        print(f"    {status} {fname}")
        if not exists:
            errors += 1
    print()

print("=" * 55)

if errors == 0:
    print("  ✅ All checks passed! BraTS data is valid.")
    print(f"  Total patients available: {len(patients)}")
    print()

    # Load one scan to verify nibabel works
    try:
        import nibabel as nib
        sample_patient = patients[0]
        sample_path = os.path.join(
            BRATS_ROOT, sample_patient,
            f"{sample_patient}_flair.nii.gz"
        )
        img = nib.load(sample_path)
        print(f"  Sample scan shape  : {img.shape}")
        print(f"  Sample voxel size  : {img.header.get_zooms()}")
        print("  ✅ nibabel can read the files correctly!")
    except Exception as e:
        print(f"  ❌ nibabel read failed: {e}")
else:
    print(f"  ❌ {errors} files missing. Check your BraTS folder structure.")

print("=" * 55)
