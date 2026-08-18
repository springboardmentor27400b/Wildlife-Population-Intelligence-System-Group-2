import os
import math
import numpy as np
try:
    import rasterio
except ImportError:
    rasterio = None
from typing import Dict, Any, Optional

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "rasters")

class GISService:
    """
    Service providing Phase 4 GIS Habitat Suitability Analysis using Rasterio & GeoPandas.
    Implements standard NDVI calculation: NDVI = (NIR - RED) / (NIR + RED)
    """

    @staticmethod
    def _ensure_storage_dir() -> str:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        return STORAGE_DIR

    @classmethod
    def _read_band_file(cls, band_path: str, band_name: str = "Band") -> Dict[str, Any]:
        """
        Reads a raster band file (.tif, .tiff, or .jp2).
        Uses Rasterio first, with PIL fallback for un-georeferenced JP2 rasters.
        """
        if not os.path.exists(band_path):
            raise FileNotFoundError(f"{band_name} raster file not found: {band_path}")

        try:
            with rasterio.open(band_path) as src:
                if src.count < 1:
                    raise ValueError(f"{band_name} file contains no readable raster bands.")
                band_data = src.read(1).astype('float32')
                meta = src.meta.copy()
                crs_obj = src.crs
                width, height = src.width, src.height
                crs_str = str(src.crs) if src.crs else "EPSG:4326"
                bounds = [src.bounds.left, src.bounds.bottom, src.bounds.right, src.bounds.top] if src.bounds else [0, 0, width, height]

                return {
                    "band": band_data,
                    "meta": meta,
                    "crs_obj": crs_obj,
                    "crs_str": crs_str,
                    "width": width,
                    "height": height,
                    "bounds": bounds
                }
        except Exception as primary_err:
            if isinstance(primary_err, ValueError):
                raise primary_err
            # Fallback for JP2 rasters using PIL
            ext = os.path.splitext(band_path)[1].lower()
            if ext in ['.jp2', '.jpk']:
                try:
                    from PIL import Image
                    from rasterio.transform import from_origin
                    with Image.open(band_path) as img:
                        arr = np.array(img).astype('float32')
                        if arr.ndim == 3:
                            arr = arr[:, :, 0]
                        height, width = arr.shape
                        transform_obj = from_origin(0.0, float(height), 1.0, 1.0)
                        meta = {
                            'driver': 'GTiff',
                            'height': height,
                            'width': width,
                            'count': 1,
                            'dtype': 'float32',
                            'crs': 'EPSG:4326',
                            'transform': transform_obj
                        }
                        return {
                            "band": arr,
                            "meta": meta,
                            "crs_obj": None,
                            "crs_str": "EPSG:4326",
                            "width": width,
                            "height": height,
                            "bounds": [0, 0, width, height]
                        }
                except Exception:
                    pass
            raise ValueError(f"Invalid or corrupted {band_name} raster file (.jp2/.tif): {str(primary_err)}")

    @classmethod
    def calculate_ndvi(cls, red_band_path: str, nir_band_path: str, output_path: str) -> Dict[str, Any]:
        """
        Calculates NDVI (Normalized Difference Vegetation Index) from RED & NIR raster files (.tif or .jp2).
        Standard Formula: NDVI = (NIR - RED) / (NIR + RED)
        Preserves spatial CRS and metadata using Rasterio.
        """
        red_info = cls._read_band_file(red_band_path, "RED band")
        nir_info = cls._read_band_file(nir_band_path, "NIR band")

        red_band = red_info["band"]
        meta = red_info["meta"]
        red_crs = red_info["crs_obj"]
        red_width, red_height = red_info["width"], red_info["height"]
        crs = red_info["crs_str"]
        bounds = red_info["bounds"]

        nir_band = nir_info["band"]
        nir_crs = nir_info["crs_obj"]
        nir_width, nir_height = nir_info["width"], nir_info["height"]

        # Check dimension compatibility (Width x Height)
        if (red_width, red_height) != (nir_width, nir_height):
            raise ValueError(f"Raster dimension mismatch: RED band is {red_width}x{red_height} pixels, but NIR band is {nir_width}x{nir_height} pixels.")

        # Check CRS compatibility (if both define CRS)
        if red_crs and nir_crs and str(red_crs).lower() != str(nir_crs).lower():
            raise ValueError(f"Coordinate Reference System (CRS) mismatch: RED band is {red_crs}, but NIR band is {nir_crs}.")

        # Calculate NDVI (Normalized Difference Vegetation Index)
        # Prevent division by zero
        denominator = nir_band + red_band
        denominator[denominator == 0] = 1e-5
        ndvi = (nir_band - red_band) / denominator

        # Clamp valid NDVI values to [-1.0, 1.0]
        ndvi = np.clip(ndvi, -1.0, 1.0)

        # Write output raster file using standard GeoTIFF driver
        meta.update(driver='GTiff', dtype=rasterio.float32, count=1)
        with rasterio.open(output_path, 'w', **meta) as dst:
            dst.write(ndvi.astype(rasterio.float32), 1)

        # Compute real raster statistics ignoring NaNs
        valid_ndvi = ndvi[~np.isnan(ndvi)]
        if len(valid_ndvi) == 0:
            mean_val, min_val, max_val, std_val = 0.0, 0.0, 0.0, 0.0
        else:
            mean_val = float(np.mean(valid_ndvi))
            min_val = float(np.min(valid_ndvi))
            max_val = float(np.max(valid_ndvi))
            std_val = float(np.std(valid_ndvi))

        # Suitability classification derived strictly from NDVI values
        if mean_val >= 0.50:
            suitability = "High Habitat Suitability (Dense Vegetation / Canopy)"
        elif mean_val >= 0.20:
            suitability = "Moderate Habitat Suitability (Shrubland / Grassland)"
        elif mean_val >= 0.00:
            suitability = "Low Habitat Suitability (Sparse Vegetation / Bare Soil)"
        else:
            suitability = "Unsuitable Habitat (Water Body / Built-up Area)"

        total_pixels = int(valid_ndvi.size)
        high_pixels = int(np.sum(valid_ndvi >= 0.50))
        mod_pixels = int(np.sum((valid_ndvi >= 0.20) & (valid_ndvi < 0.50)))
        low_pixels = int(np.sum((valid_ndvi >= 0.00) & (valid_ndvi < 0.20)))
        unsuitable_pixels = int(np.sum(valid_ndvi < 0.00))

        def pct(cnt):
            return round((cnt / total_pixels * 100), 2) if total_pixels > 0 else 0.0

        return {
            "has_raster": True,
            "output_raster_path": output_path,
            "output_raster_filename": os.path.basename(output_path),
            "mean_ndvi": round(mean_val, 4),
            "min_ndvi": round(min_val, 4),
            "max_ndvi": round(max_val, 4),
            "std_ndvi": round(std_val, 4),
            "habitat_classification": suitability,
            "crs": crs,
            "raster_dimensions": {"height": red_band.shape[0], "width": red_band.shape[1]},
            "bounds": bounds,
            "total_pixels": total_pixels,
            "suitability_distribution": {
                "high": {"count": high_pixels, "percentage": pct(high_pixels), "label": "High Suitability (≥0.50)"},
                "moderate": {"count": mod_pixels, "percentage": pct(mod_pixels), "label": "Moderate Suitability (0.20 - 0.49)"},
                "low": {"count": low_pixels, "percentage": pct(low_pixels), "label": "Low Suitability (0.00 - 0.19)"},
                "unsuitable": {"count": unsuitable_pixels, "percentage": pct(unsuitable_pixels), "label": "Unsuitable (<0.00)"}
            }
        }

    @classmethod
    def get_latest_habitat_suitability(cls) -> Dict[str, Any]:
        """
        Retrieves statistics from the latest calculated NDVI raster in storage directory.
        If no raster exists, returns structured state indicating pending upload.
        """
        storage = cls._ensure_storage_dir()
        ndvi_files = [
            os.path.join(storage, f) for f in os.listdir(storage)
            if f.startswith("ndvi_") and f.endswith(".tif")
        ]

        if not ndvi_files:
            return {
                "has_raster": False,
                "message": "Supported formats: Sentinel-2 JP2 and GeoTIFF. Upload RED (Band 4) and NIR (Band 8) JP2 or GeoTIFF files to process GIS Habitat Suitability.",
                "mean_ndvi": None,
                "min_ndvi": None,
                "max_ndvi": None,
                "std_ndvi": None,
                "habitat_classification": "Pending Raster Upload",
                "suitability_distribution": None
            }

        # Select latest created raster
        latest_ndvi_path = max(ndvi_files, key=os.path.getmtime)
        with rasterio.open(latest_ndvi_path) as ndvi_ds:
            ndvi = ndvi_ds.read(1)
            crs = str(ndvi_ds.crs) if ndvi_ds.crs else "EPSG:4326"

        valid_ndvi = ndvi[~np.isnan(ndvi)]
        if len(valid_ndvi) == 0:
            mean_val, min_val, max_val, std_val = 0.0, 0.0, 0.0, 0.0
        else:
            mean_val = float(np.mean(valid_ndvi))
            min_val = float(np.min(valid_ndvi))
            max_val = float(np.max(valid_ndvi))
            std_val = float(np.std(valid_ndvi))

        if mean_val >= 0.50:
            suitability = "High Habitat Suitability (Dense Vegetation / Canopy)"
        elif mean_val >= 0.20:
            suitability = "Moderate Habitat Suitability (Shrubland / Grassland)"
        elif mean_val >= 0.00:
            suitability = "Low Habitat Suitability (Sparse Vegetation / Bare Soil)"
        else:
            suitability = "Unsuitable Habitat (Water Body / Built-up Area)"

        total_pixels = int(valid_ndvi.size)
        high_pixels = int(np.sum(valid_ndvi >= 0.50))
        mod_pixels = int(np.sum((valid_ndvi >= 0.20) & (valid_ndvi < 0.50)))
        low_pixels = int(np.sum((valid_ndvi >= 0.00) & (valid_ndvi < 0.20)))
        unsuitable_pixels = int(np.sum(valid_ndvi < 0.00))

        def pct(cnt):
            return round((cnt / total_pixels * 100), 2) if total_pixels > 0 else 0.0

        return {
            "has_raster": True,
            "output_raster_path": latest_ndvi_path,
            "output_raster_filename": os.path.basename(latest_ndvi_path),
            "mean_ndvi": round(mean_val, 4),
            "min_ndvi": round(min_val, 4),
            "max_ndvi": round(max_val, 4),
            "std_ndvi": round(std_val, 4),
            "habitat_classification": suitability,
            "crs": crs,
            "total_pixels": total_pixels,
            "suitability_distribution": {
                "high": {"count": high_pixels, "percentage": pct(high_pixels), "label": "High Suitability (≥0.50)"},
                "moderate": {"count": mod_pixels, "percentage": pct(mod_pixels), "label": "Moderate Suitability (0.20 - 0.49)"},
                "low": {"count": low_pixels, "percentage": pct(low_pixels), "label": "Low Suitability (0.00 - 0.19)"},
                "unsuitable": {"count": unsuitable_pixels, "percentage": pct(unsuitable_pixels), "label": "Unsuitable (<0.00)"}
            }
        }
