import os
import pytest
from io import BytesIO
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.services.ai import model_loader, image_engine, inference_service

# Set up test DB engine
engine = create_engine(settings.DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    app.dependency_overrides[get_db] = lambda: session
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="function")
def client(db_session):
    return TestClient(app)

@pytest.fixture(scope="function")
def researcher_headers(client):
    # Register and login a researcher user
    email = "researcher_ai_test@park.org"
    password = "securepassword"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Researcher Tester",
        "role": "Researcher"
    })
    res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def sample_image_path():
    # Resolve workspace root sample image path
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "2de806c2-abdb-4707-bffe-f6396b7b68db.jpg")),
        os.path.abspath(os.path.join(os.getcwd(), "2de806c2-abdb-4707-bffe-f6396b7b68db.jpg")),
        "2de806c2-abdb-4707-bffe-f6396b7b68db.jpg"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("Could not find sample image for testing")

def test_model_loader_singleton():
    """
    Verifies that models are loaded and cached, returning the same references.
    """
    det1 = model_loader.get_detection_model()
    det2 = model_loader.get_detection_model()
    assert det1 is det2, "Detection model loaded multiple times!"

    class1 = model_loader.get_classification_model()
    class2 = model_loader.get_classification_model()
    assert class1 is class2, "Classification model loaded multiple times!"

def test_image_validation():
    """
    Verifies that image engine validation raises appropriate exceptions.
    """
    # 1. Non-existent file
    with pytest.raises(ValueError, match="does not exist"):
        image_engine.validate_image("non_existent_file.jpg")

    # 2. Unsupported format
    invalid_format_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_sample.txt"))
    with open(invalid_format_path, "w") as f:
        f.write("dummy text")
    try:
        with pytest.raises(ValueError, match="Unsupported image format"):
            image_engine.validate_image(invalid_format_path)
    finally:
        if os.path.exists(invalid_format_path):
            os.remove(invalid_format_path)

def test_image_inference_success(sample_image_path):
    """
    Verifies that image inference executes correctly and returns expected structure.
    """
    det_model = model_loader.get_detection_model()
    class_model = model_loader.get_classification_model()
    class_transforms = model_loader.get_classification_transforms()
    class_labels = model_loader.get_classification_labels()
    device = model_loader.get_device()

    results = image_engine.run_image_inference(
        image_path=sample_image_path,
        det_model=det_model,
        class_model=class_model,
        class_transforms=class_transforms,
        class_labels=class_labels,
        device=device
    )

    assert "detected_species" in results
    assert "confidence" in results
    assert "top5_predictions" in results
    assert "bounding_boxes" in results
    assert "inference_time_ms" in results
    assert "model_name" in results
    assert "model_version" in results
    assert "prediction_timestamp" in results

    # Assert structured contents
    assert len(results["top5_predictions"]) == 5
    assert isinstance(results["confidence"], float)
    assert isinstance(results["detected_species"], str)
    assert isinstance(results["bounding_boxes"], list)

def test_inference_service_local_pipeline(sample_image_path):
    """
    Verifies that the inference service pipeline runs correctly on local files.
    """
    results = inference_service.run_image_inference_pipeline(sample_image_path)
    assert "detected_species" in results
    assert len(results["top5_predictions"]) == 5
    assert "image_quality" in results
    q = results["image_quality"]
    assert "overall_score" in q
    assert "overall_rating" in q
    assert "blur_score" in q
    assert "blur_status" in q
    assert "brightness_value" in q
    assert "brightness_status" in q
    assert "resolution" in q
    assert "resolution_status" in q
    assert "contrast_status" in q
    assert "noise_status" in q

def test_image_quality_analysis(sample_image_path):
    """
    Verifies the image quality analysis service on the sample image.
    """
    from app.services.ai.image_quality_service import analyze_image_quality
    quality = analyze_image_quality(sample_image_path)
    
    assert 0 <= quality["overall_score"] <= 100
    assert quality["overall_rating"] in ["Excellent", "Good", "Acceptable", "Poor"]
    assert 0 <= quality["blur_score"] <= 100
    assert quality["blur_status"] in ["Good", "Acceptable", "Blurry"]
    assert 0 <= quality["brightness_value"] <= 255
    assert quality["brightness_status"] in ["Too Dark", "Good", "Acceptable", "Overexposed"]
    assert "x" in quality["resolution"]
    assert quality["resolution_status"] in ["Acceptable", "Too Low"]
    assert quality["contrast_status"] in ["Low", "Normal", "High"]
    assert quality["noise_status"] in ["Low", "Moderate", "High"]

def test_endpoint_image_analyze_flow(client, researcher_headers, sample_image_path):
    """
    Verifies the end-to-end flow:
    1. Upload an image to GridFS
    2. Get media ID
    3. Run POST /api/ai/image/analyze
    4. Confirm structured JSON output matches expectations
    """
    # Read the real sample image file
    with open(sample_image_path, "rb") as img_file:
        img_bytes = img_file.read()

    # 1. Upload the real image
    upload_res = client.post(
        "/api/observations/upload",
        files=[("files", ("test_image.jpg", BytesIO(img_bytes), "image/jpeg"))],
        headers=researcher_headers
    )
    assert upload_res.status_code == 201
    urls = upload_res.json()["urls"]
    assert len(urls) == 1
    storage_path = urls[0]

    # 2. Find the media_id via list_uploaded_media
    media_list_res = client.get("/api/observations/media", headers=researcher_headers)
    assert media_list_res.status_code == 200
    media_list = media_list_res.json()
    
    media_id = None
    for item in media_list:
        if item.get("storage_path") == storage_path:
            media_id = item.get("_id")
            break

    assert media_id is not None, f"Could not find uploaded media for path: {storage_path}"

    # 3. Analyze the image
    analyze_res = client.post(
        "/api/ai/image/analyze",
        json={"media_id": media_id},
        headers=researcher_headers
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["detected_species"] is not None
    assert data["confidence"] > 0
    assert "top5_predictions" in data
    assert "bounding_boxes" in data
    assert data["media_id"] == media_id
    assert "image_quality" in data
    assert "overall_score" in data["image_quality"]
    assert "overall_rating" in data["image_quality"]
    assert "prediction_id" in data

    # Verify that it is stored in MongoDB predictions collection
    from app.core.database import mongo_db
    from bson.objectid import ObjectId
    pred_doc = mongo_db["predictions"].find_one({"_id": ObjectId(data["prediction_id"])})
    assert pred_doc is not None, "Image prediction document not persisted in MongoDB!"
    assert pred_doc["uploaded_media_id"] == media_id
    assert pred_doc["media_type"] == "image"
    assert pred_doc["primary_species"] == data["detected_species"]
    assert pred_doc["confidence"] == data["confidence"]
    assert pred_doc["number_of_animals_detected"] == len(data["bounding_boxes"])
    assert "image_quality" in pred_doc
    assert pred_doc["processing_status"] == "completed"

def test_endpoint_invalid_media_handling(client, researcher_headers):
    """
    Verifies that calling the endpoint with invalid or non-existent media IDs
    returns appropriate HTTP errors.
    """
    # 1. Invalid ObjectId format
    res_invalid_format = client.post(
        "/api/ai/image/analyze",
        json={"media_id": "not_an_object_id"},
        headers=researcher_headers
    )
    assert res_invalid_format.status_code == 400
    assert "invalid media id format" in res_invalid_format.json()["detail"].lower()

def test_endangered_species_detection_integration(sample_image_path):
    """
    Verifies that Endangered Species Detection (Stage 3) is present in the pipeline response
    and behaves gracefully without breaking Stage 1 or Stage 2 models.
    """
    from app.services.ai.endangered_species_service import predict_endangered_species
    res = predict_endangered_species(sample_image_path)
    assert "detected" in res
    assert "species_name" in res
    assert "confidence" in res
    assert "predictions" in res

    # Verify pipeline integration
    results = inference_service.run_image_inference_pipeline(sample_image_path)
    assert "endangered_species_detection" in results
    endangered = results["endangered_species_detection"]
    assert "detected" in endangered
    assert "species_name" in endangered
    assert "confidence" in endangered
    assert "predictions" in endangered


def test_endangered_species_threshold_filtering(monkeypatch, sample_image_path):
    """
    Verifies that detections with confidence <= 60% (0.60) report no endangered species detected,
    and only detections > 60% (0.60) are flagged as endangered.
    """
    from app.services.ai import endangered_species_service
    from unittest.mock import MagicMock

    # 1. Mock Roboflow response returning low confidence (<= 60%, e.g., 0.55 / Whale on shark)
    mock_low_conf_resp = MagicMock()
    mock_low_conf_resp.status_code = 200
    mock_low_conf_resp.json.return_value = {
        "predictions": [
            {"class": "Whale", "confidence": 0.55, "x": 100, "y": 100, "width": 50, "height": 50}
        ]
    }

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: mock_low_conf_resp)
    monkeypatch.setattr("os.getenv", lambda key, default=None: "mock_api_key")

    res_low = endangered_species_service.predict_endangered_species(sample_image_path)
    assert res_low["detected"] is False
    assert res_low["species_name"] is None
    assert res_low["confidence"] == 0.0
    assert len(res_low["predictions"]) == 0
    assert "confidence <= 60%" in res_low["message"] or "No endangered species" in res_low["message"]

    # 2. Mock Roboflow response returning high confidence (> 60%, e.g., 0.85)
    mock_high_conf_resp = MagicMock()
    mock_high_conf_resp.status_code = 200
    mock_high_conf_resp.json.return_value = {
        "predictions": [
            {"class": "Whale", "confidence": 0.85, "x": 100, "y": 100, "width": 50, "height": 50}
        ]
    }

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: mock_high_conf_resp)

    res_high = endangered_species_service.predict_endangered_species(sample_image_path)
    assert res_high["detected"] is True
    assert res_high["species_name"] == "Whale"
    assert res_high["confidence"] == 0.85
    assert len(res_high["predictions"]) == 1


def test_endangered_species_shark_image():
    """
    Verifies that when testing on shark.jpg (an image outside the 12 trained endangered classes),
    the system reports no endangered species detected.
    """
    import os
    from app.services.ai.endangered_species_service import predict_endangered_species

    shark_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "shark.jpg"))
    if os.path.exists(shark_path):
        res = predict_endangered_species(shark_path)
        assert res["detected"] is False
        assert res["species_name"] is None
        assert len(res["predictions"]) == 0


def test_speciesnet_high_confidence_bypasses_fallback(monkeypatch, sample_image_path):
    """
    Scenario 1: ViT confidence >= 80% (0.80) -> SpeciesNet must NOT execute,
    and the payload reports source_model='ViT', fallback_used=False.
    """
    speciesnet_called = False

    def mock_predict_crop_species(crop_input):
        nonlocal speciesnet_called
        speciesnet_called = True
        return {"species": "Should Not Be Called", "confidence": 0.99}

    monkeypatch.setattr("app.services.ai.speciesnet_service.predict_crop_species", mock_predict_crop_species)

    det_model = model_loader.get_detection_model()
    class_model = model_loader.get_classification_model()
    class_transforms = model_loader.get_classification_transforms()
    class_labels = model_loader.get_classification_labels()
    device = model_loader.get_device()

    results = image_engine.run_image_inference(
        image_path=sample_image_path,
        det_model=det_model,
        class_model=class_model,
        class_transforms=class_transforms,
        class_labels=class_labels,
        device=device
    )

    # Check species_prediction structure
    assert "species_prediction" in results
    sp = results["species_prediction"]
    assert "species" in sp
    assert "confidence" in sp
    assert "source_model" in sp
    assert "fallback_used" in sp

    if results["top5_predictions"][0]["confidence"] >= 0.80:
        assert speciesnet_called is False
        assert sp["source_model"] == "ViT"
        assert sp["fallback_used"] is False


def test_speciesnet_low_confidence_triggers_fallback(monkeypatch, sample_image_path):
    """
    Scenario 2: ViT confidence < 80% (0.80) -> SpeciesNet executes on crop,
    and returns SpeciesNet prediction (source_model='SpeciesNet', fallback_used=True).
    """
    speciesnet_called = False

    def mock_predict_crop_species(crop_input):
        nonlocal speciesnet_called
        speciesnet_called = True
        return {
            "species": "Panthera Onca",
            "confidence": 0.92,
            "top5_predictions": [
                {"species": "Panthera Onca", "confidence": 0.92},
                {"species": "Panthera Leo", "confidence": 0.05}
            ]
        }

    monkeypatch.setattr("app.services.ai.speciesnet_service.predict_crop_species", mock_predict_crop_species)

    det_model = model_loader.get_detection_model()
    class_model = model_loader.get_classification_model()
    class_transforms = model_loader.get_classification_transforms()
    class_labels = model_loader.get_classification_labels()
    device = model_loader.get_device()

    # Force top1 confidence < 0.80 by passing a low-confidence top1 mock transform/logits if needed
    # Or test fallback execution when threshold condition is met
    from unittest.mock import MagicMock
    mock_class_model = MagicMock()
    # Return uniform logits so top-1 softmax prob is ~ 1/1000 (< 0.80)
    import torch
    mock_class_model.return_value = torch.zeros((1, 1000))

    results = image_engine.run_image_inference(
        image_path=sample_image_path,
        det_model=det_model,
        class_model=mock_class_model,
        class_transforms=class_transforms,
        class_labels=class_labels,
        device=device
    )

    assert speciesnet_called is True
    sp = results["species_prediction"]
    assert sp["species"] == "Panthera Onca"
    assert sp["confidence"] == 0.92
    assert sp["source_model"] == "SpeciesNet"
    assert sp["fallback_used"] is True
    # Verify top-5 predictions come strictly from SpeciesNet and match top prediction source
    assert len(results["top5_predictions"]) == 2
    assert results["top5_predictions"][0]["species"] == "Panthera Onca"


def test_speciesnet_failure_graceful_fallback(monkeypatch, sample_image_path):
    """
    Scenario 3: SpeciesNet fails / raises exception -> System gracefully falls back
    to ViT without crashing.
    """
    def mock_failing_predict_crop(crop_input):
        raise RuntimeError("SpeciesNet GPU Out of Memory / Weights Missing Test")

    monkeypatch.setattr("app.services.ai.speciesnet_service.predict_crop_species", mock_failing_predict_crop)

    det_model = model_loader.get_detection_model()
    class_model = model_loader.get_classification_model()
    class_transforms = model_loader.get_classification_transforms()
    class_labels = model_loader.get_classification_labels()
    device = model_loader.get_device()

    from unittest.mock import MagicMock
    mock_class_model = MagicMock()
    import torch
    mock_class_model.return_value = torch.zeros((1, 1000))

    results = image_engine.run_image_inference(
        image_path=sample_image_path,
        det_model=det_model,
        class_model=mock_class_model,
        class_transforms=class_transforms,
        class_labels=class_labels,
        device=device
    )

    # Should not raise exception and fall back to ViT
    sp = results["species_prediction"]
    assert sp["source_model"] == "ViT"
    assert sp["fallback_used"] is False
    assert "bounding_boxes" in results
    assert "endangered_species_detection" in results


def test_yolo_endangered_metadata_merging(sample_image_path):
    """
    Verifies that Roboflow endangered species predictions are merged directly
    into each YOLO bounding box object's metadata.
    """
    det_model = model_loader.get_detection_model()
    class_model = model_loader.get_classification_model()
    class_transforms = model_loader.get_classification_transforms()
    class_labels = model_loader.get_classification_labels()
    device = model_loader.get_device()

    results = image_engine.run_image_inference(
        image_path=sample_image_path,
        det_model=det_model,
        class_model=class_model,
        class_transforms=class_transforms,
        class_labels=class_labels,
        device=device
    )

    assert "bounding_boxes" in results
    for box in results["bounding_boxes"]:
        assert "endangered" in box
        assert "endangered_species_name" in box
        assert "endangered_confidence" in box
        assert isinstance(box["endangered"], bool)


def test_duplicate_detection_filtering():
    """
    Verifies that filter_duplicate_detections removes duplicate lower-confidence bounding boxes
    caused by cross-class overlapping predictions or nested containment, while preserving
    legitimate distinct detections.
    """
    from app.services.ai.image_engine import compute_box_metrics, filter_duplicate_detections

    # 1. Test box metrics computation
    box_a = [10.0, 10.0, 100.0, 100.0]
    box_b = [10.0, 10.0, 100.0, 100.0]
    m_ab = compute_box_metrics(box_a, box_b)
    assert m_ab["iou"] == 1.0
    assert m_ab["containment"] == 1.0

    box_c = [200.0, 200.0, 300.0, 300.0]
    m_ac = compute_box_metrics(box_a, box_c)
    assert m_ac["iou"] == 0.0

    # 2. Test cross-class duplicate suppression and nested containment suppression
    raw_boxes = [
        {"bounding_box": [10.0, 10.0, 100.0, 100.0], "confidence": 0.85, "class_id": 16, "label": "dog"},
        {"bounding_box": [10.0, 10.0, 100.0, 100.0], "confidence": 0.50, "class_id": 18, "label": "sheep"}, # Cross-class duplicate
        {"bounding_box": [20.0, 20.0, 80.0, 80.0], "confidence": 0.30, "class_id": 14, "label": "bird"},    # Nested contained sub-box
        {"bounding_box": [250.0, 250.0, 350.0, 350.0], "confidence": 0.90, "class_id": 16, "label": "dog"}   # Distinct dog
    ]

    filtered = filter_duplicate_detections(raw_boxes, iou_threshold=0.60, containment_threshold=0.70)
    assert len(filtered) == 2
    # High confidence dog preserved
    assert any(b["confidence"] == 0.85 and b["class_id"] == 16 for b in filtered)
    # Distinct dog preserved
    assert any(b["confidence"] == 0.90 and b["class_id"] == 16 for b in filtered)
    # Cross-class duplicate sheep discarded
    assert not any(b["class_id"] == 18 for b in filtered)
    # Nested contained sub-box bird discarded
    assert not any(b["confidence"] == 0.30 for b in filtered)


def test_iucn_service_integration():
    """
    Verifies that get_conservation_status returns structured conservation status
    dictionary with scientific_name, common_name, iucn_category, population_trend, and assessment_year.
    """
    from app.services.ai.iucn_service import get_conservation_status

    res_lion = get_conservation_status("lion")
    assert res_lion["scientific_name"] == "Panthera leo"
    assert res_lion["iucn_category"] == "VU"
    assert res_lion["population_trend"] == "Decreasing"
    assert res_lion["source"] == "IUCN Red List API"

    res_unknown = get_conservation_status("Unknown Extraterrestrial Animal")
    assert res_unknown["scientific_name"] == "Unknown Extraterrestrial Animal"
    assert res_unknown["iucn_category"] is None
    assert res_unknown["population_trend"] is None









