# Database Schema Documentation

The Wildlife Population Intelligence System uses a PostgreSQL database. Primary keys are auto-generated UUIDs, and foreign keys link entities together. Timestamps track creation and update events.

## Entity Relationship Model

```
   +-------------------+          +------------------------+
   |       users       |          |        surveys         |
   +-------------------+          +------------------------+
   | PK id (UUID)      |          | PK id (UUID)           |
   | email (Unique)    |<----+    | name                   |
   | hashed_password   |     |    | status (SurveyStatus)  |
   | full_name         |     |    | created_by_id (FK)-----+
   | role (UserRole)   |     |    +-----------+------------+
   +-------------------+     |                |
                             |                | 1
                             |                |
                             |                | N
                             |    +-----------v------------+
                             |    |    monitoring_sites    |
                             |    +------------------------+
                             |    | PK id (UUID)           |
                             |    | name                   |
                             |    | latitude, longitude    |
                             |    | survey_id (FK)---------+
                             |    +-----+------------+-----+
                             |          |            |
                             |          | 1          | 1
                             |          |            |
                             |          | N          | N
                             |    +-----v------+     +-----v------+
                             |    |camera_traps|     |audio_sensors|
                             |    +------------+     +------------+
                             |    | PK id(UUID)|     | PK id(UUID)|
                             |    | model      |     | model      |
                             |    | status     |     | status     |
                             |    | site_id(FK)|     | site_id(FK)|
                             |    +------------+     +------------+
                             |
                             |
                             +-----------------------+
                                                     |
                                                     | 1
                                                     |
                                                     v N
                                          +----------+-------------+
                                          |      observations      |
                                          +------------------------+
                                          | PK id (UUID)           |
                                          | species, count         |
                                          | observed_at            |
                                          | site_id (FK)           |
                                          | reporter_id (FK)       |
                                          +----------+-------------+
                                                     |
                                                     | 1
                                                     |
                                                     v N
                                          +----------+-------------+
                                          |         media          |
                                          +------------------------+
                                          | PK id (UUID)           |
                                          | file_url, public_id    |
                                          | mime_type, file_size   |
                                          | observation_id (FK)----+
                                          +------------------------+
```

## Tables & Indexes

### 1. `users`
- **PK:** `id` UUID
- **Indexes:** `idx_users_email` (Unique)

### 2. `surveys`
- **PK:** `id` UUID
- **FK:** `created_by_id` -> `users.id`
- **Indexes:** `idx_surveys_status`

### 3. `monitoring_sites`
- **PK:** `id` UUID
- **FK:** `survey_id` -> `surveys.id` (ON DELETE CASCADE)
- **Indexes:** `idx_monitoring_sites_survey_id`

### 4. `camera_traps`
- **PK:** `id` UUID
- **FK:** `site_id` -> `monitoring_sites.id` (ON DELETE SET NULL)
- **Indexes:** `idx_camera_traps_site_id`

### 5. `audio_sensors`
- **PK:** `id` UUID
- **FK:** `site_id` -> `monitoring_sites.id` (ON DELETE SET NULL)
- **Indexes:** `idx_audio_sensors_site_id`

### 6. `observations`
- **PK:** `id` UUID
- **FK:** `site_id` -> `monitoring_sites.id` (ON DELETE CASCADE)
- **FK:** `reporter_id` -> `users.id` (ON DELETE SET NULL)
- **Indexes:** `idx_observations_species`, `idx_observations_site_id`

### 7. `media`
- **PK:** `id` UUID
- **FK:** `observation_id` -> `observations.id` (ON DELETE CASCADE)
- **Indexes:** `idx_media_observation_id`
