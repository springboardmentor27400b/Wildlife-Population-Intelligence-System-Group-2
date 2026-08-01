import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.auth.security import create_access_token


def test_e2e_image_upload_and_static_serving():
    print("=" * 80)
    print("E2E AUDIT & VERIFICATION: STAGE 1 ANNOTATED IMAGE & STAGE 2 BBOX CROP")
    print("=" * 80)

    client = TestClient(app)

    # 1. Generate a synthetic test image
    test_img = np.zeros((400, 500, 3), dtype=np.uint8)
    # Draw a test zebra / elephant shape
    cv2.rectangle(test_img, (50, 50), (450, 350), (200, 200, 200), -1)
    cv2.putText(test_img, "Zebra Sample", (70, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
    
    test_img_path = Path("test_e2e_sample.jpg")
    cv2.imwrite(str(test_img_path), test_img)

    token = create_access_token({"sub": "admin@example.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    try:
        with open(test_img_path, "rb") as f:
            res = client.post("/api/ai/image/upload", files={"file": ("test_e2e_sample.jpg", f, "image/jpeg")}, headers=headers)

        assert res.status_code == 200, f"Upload failed with status {res.status_code}: {res.text}"
        data = res.json()

        annotated_url = data.get("annotated_image_path")
        crop_url = data.get("crop_image_path")

        print(f"API Returned species: {data.get('species')} ({data.get('scientific_name')})")
        print(f"API Returned annotated_image_path: {annotated_url}")
        print(f"API Returned crop_image_path:      {crop_url}")

        assert annotated_url is not None, "annotated_image_path is missing"
        assert crop_url is not None, "crop_image_path is missing"

        # 2. Test HTTP GET to static mounted uploads endpoints
        res_ann = client.get(annotated_url)
        print(f"HTTP GET {annotated_url} -> Status: {res_ann.status_code}, Length: {len(res_ann.content)} bytes")
        assert res_ann.status_code == 200, f"Static serving failed for annotated image URL {annotated_url}"
        assert len(res_ann.content) > 0, "Annotated image content is empty"

        res_crop = client.get(crop_url)
        print(f"HTTP GET {crop_url} -> Status: {res_crop.status_code}, Length: {len(res_crop.content)} bytes")
        assert res_crop.status_code == 200, f"Static serving failed for crop image URL {crop_url}"
        assert len(res_crop.content) > 0, "Crop image content is empty"

        print("=" * 80)
        print("SUCCESS: BOTH ANNOTATED IMAGE & STAGE 2 CROP IMAGE ARE SERVED WITH HTTP 200 OK!")
        print("=" * 80)
    finally:
        if test_img_path.exists():
            test_img_path.unlink()


if __name__ == "__main__":
    test_e2e_image_upload_and_static_serving()
