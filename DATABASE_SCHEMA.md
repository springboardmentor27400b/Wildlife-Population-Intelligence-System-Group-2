# Database Schema & Entity Relationships

The platform utilizes a local, transactional **SQLite** database (`wildlife.db`).

## Primary Tables & Schema

### `users`
- `id` (INTEGER, PK)
- `full_name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (VARCHAR)

### `species`
- `id` (INTEGER, PK)
- `common_name` (VARCHAR)
- `scientific_name` (VARCHAR)
- `iucn_status` (VARCHAR)
- `habitat` (VARCHAR)

### `monitoring_sites`
- `id` (INTEGER, PK)
- `site_name` (VARCHAR)
- `latitude` (FLOAT)
- `longitude` (FLOAT)
- `habitat` (VARCHAR)

### `observations`
- `id` (INTEGER, PK)
- `species_id` (INTEGER, FK -> species.id)
- `site_id` (INTEGER, FK -> monitoring_sites.id)
- `observation_date` (DATE)
- `count` (INTEGER)

### `image_detections`
- `id` (INTEGER, PK)
- `species` (VARCHAR)
- `confidence` (VARCHAR)
- `image_path` (VARCHAR)
- `detection_date` (VARCHAR)

### `audio_detections`
- `id` (INTEGER, PK)
- `species` (VARCHAR)
- `confidence` (VARCHAR)
- `audio_path` (VARCHAR)
- `waveform_path` (VARCHAR)

### `population_statistics`
- `id` (INTEGER, PK)
- `species_id` (INTEGER, FK -> species.id)
- `habitat_id` (INTEGER)
- `estimated_population` (INTEGER)
- `density` (FLOAT)
- `growth_rate` (FLOAT)

### `habitat_analytics`
- `id` (INTEGER, PK)
- `habitat_name` (VARCHAR)
- `habitat_quality` (FLOAT)
- `risk_level` (VARCHAR)

### `conservation_recommendations`
- `id` (INTEGER, PK)
- `priority` (VARCHAR)
- `issue_detected` (TEXT)
- `recommendation` (TEXT)

### `ecosystem_healths`
- `id` (INTEGER, PK)
- `shannon_index` (FLOAT)
- `overall_health_score` (FLOAT)
- `ecosystem_grade` (VARCHAR)
