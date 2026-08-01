# API Documentation Reference

## Authentication Endpoints
- `POST /api/register` - Create user account
- `POST /api/login` - Authenticate user & get JWT access token
- `GET /api/profile` - Fetch current user profile

## AI Detections & Media
- `POST /api/ai/detect` - Process camera trap image with YOLOv8
- `POST /api/ai/detect-audio` - Process bioacoustic audio file with Librosa
- `GET /api/ai/history` - Fetch image detection history
- `GET /api/ai/audio-history` - Fetch audio detection history

## Intelligence Engine Endpoints
- `GET /api/analytics/executive` - Fetch Executive Dashboard KPIs & 12 chart datasets
- `GET /api/population/summary` - Species population estimates & density
- `GET /api/habitat/summary` - Habitat quality scores & risk levels
- `GET /api/conservation/recommendations` - Actionable recommendations
- `GET /api/ecosystem/health` - Shannon Diversity Index & Ecosystem Grade
- `GET /api/gis/map-data` - Spatial GeoJSON coordinates for Leaflet map
- `GET /api/predictions/analytics` - 6m & 1yr population forecasts
- `GET /api/system/health` - Live platform system diagnostics

## Reports & Exports
- `GET /api/reports/advanced` - Multi-module report JSON payload
- `GET /api/reports/export/pdf` - Download Executive PDF Report
- `GET /api/reports/export/csv` - Download Population CSV
- `GET /api/reports/export/excel` - Download Excel-compatible CSV
- `GET /api/reports/export/json` - Download JSON Report
