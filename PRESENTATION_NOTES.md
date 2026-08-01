# Final-Year Project Presentation & Demo Guide

## Project Pitch
"The Wildlife Population Intelligence System is a multi-modal AI platform designed to transform raw field evidence into actionable conservation intelligence. By combining YOLOv8 computer vision, Librosa bioacoustics analysis, and deterministic ecological modeling, the system dynamically calculates species populations, habitat quality, and ecosystem health grades in real time using a 100% offline SQLite database."

## Demonstration Walkthrough Checklist

1. **Executive Dashboard (`/executive-dashboard`)**:
   - Highlight the 12 KPI cards and 12 interactive Recharts charts.
   - Show population velocity trends and 12-month growth forecasts.

2. **GIS Spatial Map (`/gis`)**:
   - Demonstrate the Leaflet map plotting sites, sightings, and risk markers (Green, Yellow, Orange, Red).
   - Filter by species and habitat type.

3. **Multi-Modal AI Analysis (`/species` & `/audio`)**:
   - Upload image file to demonstrate bounding box species detection.
   - Upload audio file to demonstrate waveform and spectrogram extraction.

4. **AI Prediction Analytics (`/predictions`)**:
   - Showcase 6-month and 1-year population trajectory forecasts and AI recommendation cards.

5. **Multi-Format Exporting (`/reports`)**:
   - Click "Export PDF", "Export CSV", "Export Excel", and "Export JSON" to demonstrate report downloads.

6. **System Health (`/system-health`)**:
   - Display real-time SQLite database metrics, API latency, and model status.
