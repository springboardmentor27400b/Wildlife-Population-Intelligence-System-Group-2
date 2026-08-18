import os
import tempfile
import numpy as np
import rasterio
from rasterio.transform import from_origin
from app.services.gis_service import GISService

def test_calculate_ndvi_rasterio():
    with tempfile.TemporaryDirectory() as tmpdir:
        red_path = os.path.join(tmpdir, "red_band4.tif")
        nir_path = os.path.join(tmpdir, "nir_band8.tif")
        out_path = os.path.join(tmpdir, "ndvi_out.tif")

        # Create synthetic 10x10 GeoTIFF rasters
        transform = from_origin(10.0, 50.0, 10, 10)
        meta = {
            'driver': 'GTiff',
            'height': 10,
            'width': 10,
            'count': 1,
            'dtype': 'float32',
            'crs': 'EPSG:4326',
            'transform': transform
        }

        # Dense vegetation pixels: RED=0.1, NIR=0.6 => NDVI = (0.6 - 0.1)/(0.6 + 0.1) = 0.5/0.7 = 0.7143
        red_data = np.full((10, 10), 0.1, dtype=np.float32)
        nir_data = np.full((10, 10), 0.6, dtype=np.float32)

        with rasterio.open(red_path, 'w', **meta) as dst:
            dst.write(red_data, 1)

        with rasterio.open(nir_path, 'w', **meta) as dst:
            dst.write(nir_data, 1)

        res = GISService.calculate_ndvi(red_path, nir_path, out_path)

        assert res["has_raster"] is True
        assert os.path.exists(out_path)
        assert res["mean_ndvi"] == 0.7143
        assert res["min_ndvi"] == 0.7143
        assert res["max_ndvi"] == 0.7143
        assert res["habitat_classification"] == "High Habitat Suitability (Dense Vegetation / Canopy)"
        assert res["suitability_distribution"]["high"]["percentage"] == 100.0

        # Verify generated output TIFF raster file can be opened and read by rasterio
        with rasterio.open(out_path) as out_ds:
            out_ndvi = out_ds.read(1)
            assert out_ndvi.shape == (10, 10)
            assert np.isclose(out_ndvi[0, 0], 0.7142857)

def test_dimension_mismatch_validation():
    import pytest
    with tempfile.TemporaryDirectory() as tmpdir:
        red_path = os.path.join(tmpdir, "red_10x10.tif")
        nir_path = os.path.join(tmpdir, "nir_20x20.tif")
        out_path = os.path.join(tmpdir, "ndvi_out.tif")

        transform = from_origin(10.0, 50.0, 10, 10)
        meta_10 = {'driver': 'GTiff', 'height': 10, 'width': 10, 'count': 1, 'dtype': 'float32', 'crs': 'EPSG:4326', 'transform': transform}
        meta_20 = {'driver': 'GTiff', 'height': 20, 'width': 20, 'count': 1, 'dtype': 'float32', 'crs': 'EPSG:4326', 'transform': transform}

        with rasterio.open(red_path, 'w', **meta_10) as dst:
            dst.write(np.full((10, 10), 0.1, dtype=np.float32), 1)

        with rasterio.open(nir_path, 'w', **meta_20) as dst:
            dst.write(np.full((20, 20), 0.6, dtype=np.float32), 1)

        with pytest.raises(ValueError, match="dimension mismatch"):
            GISService.calculate_ndvi(red_path, nir_path, out_path)

def test_invalid_extension_validation():
    from app.api.endpoints.analytics import upload_and_process_rasters
    from fastapi import HTTPException, UploadFile
    import io
    import pytest

    red_bad = UploadFile(filename="invalid_red.png", file=io.BytesIO(b"fake"))
    nir_good = UploadFile(filename="valid_nir.tif", file=io.BytesIO(b"fake"))

    with pytest.raises(HTTPException) as exc_info:
        import asyncio
        asyncio.run(upload_and_process_rasters(red_band=red_bad, nir_band=nir_good, current_user=None))
    
    assert exc_info.value.status_code == 400
    assert "Supported formats: Sentinel-2 JP2 and GeoTIFF" in exc_info.value.detail

