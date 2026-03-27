import nibabel as nib
import numpy as np
import os

os.makedirs("dummy_scans", exist_ok=True)
print("Generating fake 3D MRI scans for API testing...")

# We use a small 64x64x64 3D cube so it uploads and processes super fast!
for mod in ["flair", "t1w", "t1ce", "t2w"]:
    fake_data = np.random.rand(64, 64, 64).astype(np.float32)
    fake_img = nib.Nifti1Image(fake_data, np.eye(4))
    
    file_path = f"dummy_scans/{mod}.nii.gz"
    nib.save(fake_img, file_path)
    print(f"✅ Created: {file_path}")

print("🎉 Done! You now have 4 files to test your API.")