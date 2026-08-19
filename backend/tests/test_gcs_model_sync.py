import os
import sys
import tempfile
import hashlib
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai import gcs_model_sync


def test_verify_file_checksum():
    with tempfile.NamedTemporaryFile("w", delete=False) as f:
        f.write("test content for hashing")
        temp_path = f.name

    try:
        expected_sha256 = hashlib.sha256(b"test content for hashing").hexdigest()
        assert gcs_model_sync.verify_file_checksum(temp_path, expected_sha256, "sha256") is True
        assert gcs_model_sync.verify_file_checksum(temp_path, "invalid_checksum", "sha256") is False

        expected_md5 = hashlib.md5(b"test content for hashing").hexdigest()
        assert gcs_model_sync.verify_file_checksum(temp_path, expected_md5, "md5") is True
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_ensure_model_file_local_exists():
    with tempfile.NamedTemporaryFile("w", delete=False) as f:
        f.write("local model binary data dummy")
        local_path = f.name

    try:
        # Should return local_path directly without GCS calls
        res = gcs_model_sync.ensure_model_file("yolov8x.pt", local_path, min_bytes=10)
        assert res == local_path
    finally:
        if os.path.exists(local_path):
            os.remove(local_path)


def test_ensure_model_file_gcs_not_configured():
    with tempfile.TemporaryDirectory() as tmpdir:
        non_existent_file = os.path.join(tmpdir, "missing_model.pt")
        with patch.dict(os.environ, {"GCS_MODEL_BUCKET": ""}, clear=False):
            with patch("app.services.ai.gcs_model_sync.settings", None):
                res = gcs_model_sync.ensure_model_file("missing_model.pt", non_existent_file)
                assert res is None
                assert not os.path.exists(non_existent_file)


def test_ensure_model_file_successful_gcs_download():
    with tempfile.TemporaryDirectory() as tmpdir:
        dest_file = os.path.join(tmpdir, "synced_model.pt")
        fake_content = b"fake weights from gcs bucket"
        fake_sha256 = hashlib.sha256(fake_content).hexdigest()

        mock_blob = MagicMock()
        mock_blob.exists.return_value = True

        def fake_download(target):
            with open(target, "wb") as f:
                f.write(fake_content)

        mock_blob.download_to_filename.side_effect = fake_download

        mock_bucket = MagicMock()
        mock_bucket.blob.return_value = mock_blob

        mock_client = MagicMock()
        mock_client.bucket.return_value = mock_bucket

        with patch.dict(os.environ, {"GCS_MODEL_BUCKET": "wildlife-models", "GCS_MODEL_PREFIX": "v1"}, clear=False):
            with patch("app.services.ai.gcs_model_sync.get_storage_client", return_value=mock_client):
                res = gcs_model_sync.ensure_model_file(
                    asset_name="synced_model.pt",
                    target_local_path=dest_file,
                    expected_checksum=fake_sha256,
                    min_bytes=10
                )

                assert res == dest_file
                assert os.path.exists(dest_file)
                with open(dest_file, "rb") as f:
                    assert f.read() == fake_content
                mock_bucket.blob.assert_called_with("v1/synced_model.pt")


def test_ensure_model_file_checksum_failure_retries():
    with tempfile.TemporaryDirectory() as tmpdir:
        dest_file = os.path.join(tmpdir, "corrupted_model.pt")
        fake_content = b"corrupted payload"

        mock_blob = MagicMock()
        mock_blob.exists.return_value = True

        def fake_download(target):
            with open(target, "wb") as f:
                f.write(fake_content)

        mock_blob.download_to_filename.side_effect = fake_download

        mock_bucket = MagicMock()
        mock_bucket.blob.return_value = mock_blob

        mock_client = MagicMock()
        mock_client.bucket.return_value = mock_bucket

        with patch.dict(os.environ, {"GCS_MODEL_BUCKET": "wildlife-models"}, clear=False):
            with patch("app.services.ai.gcs_model_sync.get_storage_client", return_value=mock_client):
                res = gcs_model_sync.ensure_model_file(
                    asset_name="corrupted_model.pt",
                    target_local_path=dest_file,
                    expected_checksum="expected_different_hash_value",
                    max_retries=2,
                    min_bytes=1
                )

                # Checksum verification failure should return None and clean up
                assert res is None
                assert not os.path.exists(dest_file)
                assert mock_blob.download_to_filename.call_count == 2


def test_target_gcs_configuration_and_11_asset_paths_resolution():
    """
    Validates that target production configuration resolves bucket 'wildlife-ai-prod-4821_cloudbuild'
    with empty prefix and maps all 11 production assets to their exact GCS object paths.
    """
    env_vars = {
        "GCS_MODEL_BUCKET": "wildlife-ai-prod-4821_cloudbuild",
        "GCS_MODEL_PREFIX": "",
        "LOCAL_MODEL_CACHE_DIR": "/tmp/models",
        "GOOGLE_APPLICATION_CREDENTIALS": "",
    }
    with patch.dict(os.environ, env_vars, clear=False):
        with patch("app.services.ai.gcs_model_sync.settings", None):
            cfg = gcs_model_sync.get_gcs_config()
            assert cfg["bucket_name"] == "wildlife-ai-prod-4821_cloudbuild"
            assert cfg["prefix"] == ""
            assert cfg["local_cache_dir"] == "/tmp/models"
            assert cfg["credentials_path"] == ""

            expected_11_assets = [
                "yolov8x.pt",
                "animalclap/animalclap_epoch020.pth",
                "animalclap/species_traits.csv",
                "animalclap/models--laion--clap-htsat-unfused.tar.gz",
                "animalclap/models--roberta-base.tar.gz",
                "birdnet/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite",
                "birdnet/BirdNET_GLOBAL_6K_V2.4_Labels.txt",
                "birdnet/taxonomy.json",
                "yamnet/yamnet.tflite",
                "yamnet/yamnet_labels.txt",
                "speciesnet/v4.0.2a.tar.gz",
            ]

            for asset in expected_11_assets:
                resolved_blob = gcs_model_sync.build_blob_name(asset)
                assert resolved_blob == asset, f"Mismatch for {asset}: got {resolved_blob}"


def test_ensure_model_directory_tar_gz_download():
    """
    Tests downloading and extracting a .tar.gz directory bundle from GCS.
    """
    import tarfile
    with tempfile.TemporaryDirectory() as tmpdir:
        target_dir = os.path.join(tmpdir, "extracted_model")
        
        # Create a mock tar.gz
        tar_src = os.path.join(tmpdir, "source_bundle.tar.gz")
        dummy_file = os.path.join(tmpdir, "config.json")
        with open(dummy_file, "w") as f:
            f.write('{"model": "test"}')

        with tarfile.open(tar_src, "w:gz") as tar:
            tar.add(dummy_file, arcname="config.json")

        with open(tar_src, "rb") as f:
            tar_bytes = f.read()

        mock_blob = MagicMock()
        mock_blob.exists.return_value = True

        def fake_tar_download(dest):
            with open(dest, "wb") as f:
                f.write(tar_bytes)

        mock_blob.download_to_filename.side_effect = fake_tar_download
        mock_bucket = MagicMock()
        mock_bucket.blob.return_value = mock_blob
        mock_client = MagicMock()
        mock_client.bucket.return_value = mock_bucket

        with patch.dict(os.environ, {"GCS_MODEL_BUCKET": "wildlife-ai-prod-4821_cloudbuild"}, clear=False):
            with patch("app.services.ai.gcs_model_sync.get_storage_client", return_value=mock_client):
                res = gcs_model_sync.ensure_model_directory("speciesnet/v4.0.2a", target_dir)
                assert res == target_dir
                assert os.path.exists(os.path.join(target_dir, "config.json"))
                with open(os.path.join(target_dir, "config.json"), "r") as f:
                    assert f.read() == '{"model": "test"}'
                mock_bucket.blob.assert_called_with("speciesnet/v4.0.2a.tar.gz")


def test_storage_client_adc_initialization_without_local_key():
    """
    Confirms that get_storage_client initializes via Application Default Credentials (ADC)
    when no service-account JSON key is provided or present on disk.
    """
    gcs_model_sync._storage_client = None
    gcs_model_sync._client_init_attempted = False

    with patch.dict(os.environ, {"GCS_MODEL_BUCKET": "wildlife-ai-prod-4821_cloudbuild", "GOOGLE_APPLICATION_CREDENTIALS": ""}, clear=False):
        with patch("app.services.ai.gcs_model_sync.settings", None):
            with patch("google.cloud.storage.Client") as mock_storage_class:
                mock_instance = MagicMock()
                mock_storage_class.return_value = mock_instance

                client = gcs_model_sync.get_storage_client()
                assert client is mock_instance
                # Verified default constructor (Application Default Credentials / ADC) was called
                mock_storage_class.assert_called_once_with()

