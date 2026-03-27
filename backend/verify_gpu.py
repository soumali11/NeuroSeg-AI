# ─────────────────────────────────────────────────────────────────────────────
# NeuroSegAI — GPU Verification Script
# Run this first to confirm CUDA is working before anything else.
# Usage: python verify_gpu.py
# ─────────────────────────────────────────────────────────────────────────────

import sys

print("=" * 55)
print("  NeuroSegAI — GPU Verification")
print("=" * 55)

try:
    import torch
    print(f"  PyTorch version  : {torch.__version__}")
    print(f"  CUDA available   : {torch.cuda.is_available()}")

    if torch.cuda.is_available():
        props = torch.cuda.get_device_properties(0)
        vram  = props.total_memory // 1024**3
        print(f"  GPU Name         : {props.name}")
        print(f"  VRAM             : {vram} GB")
        print(f"  CUDA version     : {torch.version.cuda}")
        print("=" * 55)
        if vram < 4:
            print("  ⚠️  WARNING: Less than 4GB VRAM detected.")
            print("     Set roi_size=(64,64,64) in inference.py")
        elif vram < 8:
            print("  ⚠️  NOTE: 4-6GB VRAM. Set roi_size=(96,96,96)")
            print("     in inference.py if you get OOM errors.")
        else:
            print("  ✅ GPU is ready. Default roi_size=(128,128,128) is fine.")
    else:
        print("=" * 55)
        print("  ❌ CUDA not available!")
        print("  Fix: Reinstall PyTorch with CUDA support:")
        print("  pip install torch torchvision torchaudio")
        print("       --index-url https://download.pytorch.org/whl/cu118")
        sys.exit(1)

except ImportError:
    print("  ❌ PyTorch not installed!")
    print("  Fix: pip install torch torchvision torchaudio")
    print("       --index-url https://download.pytorch.org/whl/cu118")
    sys.exit(1)

print()
try:
    import nibabel
    print(f"  ✅ nibabel       : {nibabel.__version__}")
except ImportError:
    print("  ❌ nibabel missing → pip install nibabel")

try:
    import monai
    print(f"  ✅ MONAI         : {monai.__version__}")
except ImportError:
    print("  ❌ MONAI missing  → pip install monai[all]")

try:
    import fastapi
    print(f"  ✅ FastAPI        : {fastapi.__version__}")
except ImportError:
    print("  ❌ FastAPI missing → pip install fastapi uvicorn[standard]")

try:
    import sqlalchemy
    print(f"  ✅ SQLAlchemy     : {sqlalchemy.__version__}")
except ImportError:
    print("  ❌ SQLAlchemy missing → pip install sqlalchemy")

print("=" * 55)
print("  All checks complete.")
print("=" * 55)
