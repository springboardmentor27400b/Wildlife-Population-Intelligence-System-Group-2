import io
import os
import sys
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("DATABASE_URL", f"sqlite:///./test_wildlife_{uuid.uuid4().hex}.db")

from app.main import app, seed_demo_data
from app.services.model_manager import model_manager, ModelManager
from app.services.storage_service import save_upload, UPLOAD_ROOT
from app.services.ai_service import classify_species

client = TestClient(app)


def create_dummy_image_bytes() -> bytes:
    """Helper to create a small valid JPEG byte buffer."""
    try:
        from PIL import Image
        img = Image.new("RGB", (640, 480), color=(100, 200, 100))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()
    except ImportError:
        return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C"


def test_model_manager_singleton_and_device():
    m1 = ModelManager()
    m2 = ModelManager()
    assert m1 is m2
    assert m1.device in ("cuda", "cpu")


def test_resnet50_stage2_classifier_loaded():
    """Verify PyTorch ResNet50 Stage 2 Wildlife Classifier is initialized."""
    m = ModelManager()
    m.ensure_models()
    assert m._classifier_model is not None


def test_species_taxonomy_mappings():
    """Verify taxonomy mappings for Wolf, Rhinoceros, Zebra, Elephant, Lion, Tiger, Leopard, Giraffe."""
    seed_demo_data()  # Seed the taxonomy database explicitly for the test context
    wolf = classify_species("gray wolf")
    assert wolf["common_name"] == "Gray Wolf"
    assert wolf["scientific_name"] == "Canis lupus"
    assert wolf["family"] == "Canidae"

    rhino = classify_species("white rhinoceros")
    assert rhino["common_name"] == "White Rhinoceros"
    assert rhino["scientific_name"] == "Ceratotherium simum"
    assert rhino["family"] == "Rhinocerotidae"

    zebra = classify_species("plains zebra")
    assert zebra["common_name"] == "Plains Zebra"
    assert zebra["scientific_name"] == "Equus quagga"
    assert zebra["family"] == "Equidae"

    elephant = classify_species("african elephant")
    assert elephant["scientific_name"] == "Loxodonta africana"
    assert elephant["family"] == "Elephantidae"

    lion = classify_species("african lion")
    assert lion["scientific_name"] == "Panthera leo"

    tiger = classify_species("bengal tiger")
    assert tiger["scientific_name"] == "Panthera tigris tigris"

    leopard = classify_species("leopard")
    assert leopard["scientific_name"] == "Panthera pardus"

    giraffe = classify_species("masai giraffe")
    assert giraffe["scientific_name"] == "Giraffa camelopardalis tippelskirchi"


def test_api_image_upload_yolo_endpoint():
    payload = {
        "full_name": "YOLO Tester",
        "email": f"yolo-{uuid.uuid4().hex[:8]}@example.com",
        "password": "yolopassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    image_bytes = create_dummy_image_bytes()
    files = {"file": ("elephant.jpg", image_bytes, "image/jpeg")}
    response = client.post(
        "/api/ai/image/upload",
        files=files,
        data={"location": "Serengeti National Park"},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "species" in data
    assert "confidence" in data
    assert "bounding_box" in data
    assert "annotated_image_path" in data
    assert "crop_image_path" in data
    assert "prediction_time" in data
    assert data["location"] == "Serengeti National Park"


def test_unsupported_file_type_rejection():
    payload = {
        "full_name": "YOLO Tester 2",
        "email": f"yolo2-{uuid.uuid4().hex[:8]}@example.com",
        "password": "yolopassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    token = reg_res.json()["access_token"]

    files = {"file": ("document.pdf", b"pdf content", "application/pdf")}
    response = client.post(
        "/api/ai/image/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "Unsupported image format" in response.json()["detail"]
