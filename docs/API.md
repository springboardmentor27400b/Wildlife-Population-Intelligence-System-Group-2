# API Documentation

This document describes the API endpoints exposed by the backend of the **Wildlife Population Intelligence System**.

## Authentication & Profiles

### 1. Register User
- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "email": "researcher@example.com",
    "password": "password123",
    "full_name": "Dr. Jane Doe",
    "role": "Wildlife Researcher"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "e4b3c7d6-7c9d-4e8c-9b8a-3d2c1b0a9f8e",
    "email": "researcher@example.com",
    "full_name": "Dr. Jane Doe",
    "role": "Wildlife Researcher",
    "is_active": true,
    "created_at": "2026-07-10T16:00:00Z"
  }
  ```

### 2. Login User
- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Request Body (Form URL Encoded):**
  - `username`: Email of the user
  - `password`: Password
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "e4b3c7d6-7c9d-4e8c-9b8a-3d2c1b0a9f8e",
      "email": "researcher@example.com",
      "full_name": "Dr. Jane Doe",
      "role": "Wildlife Researcher"
    }
  }
  ```

### 3. Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/v1/users/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):** Same as register response.

---

## CRUD API Modules

All CRUD endpoints (except read paths if configured, though typically all require authentication) require a valid JWT token in the `Authorization` header.

### 1. Surveys
- `GET /api/v1/surveys`: Get surveys list (paginated, with search & filtering)
- `GET /api/v1/surveys/{id}`: Get survey details
- `POST /api/v1/surveys`: Create survey (Administrator and Wildlife Researcher roles)
- `PUT /api/v1/surveys/{id}`: Edit survey
- `DELETE /api/v1/surveys/{id}`: Remove survey (Administrator role only)

### 2. Monitoring Sites
- `GET /api/v1/monitoring-sites`: List monitoring sites
- `GET /api/v1/monitoring-sites/{id}`: Get site details
- `POST /api/v1/monitoring-sites`: Create site (Administrator, Wildlife Researcher, and Conservation Officer roles)
- `PUT /api/v1/monitoring-sites/{id}`: Edit site
- `DELETE /api/v1/monitoring-sites/{id}`: Remove site

### 3. Camera Traps
- `GET /api/v1/camera-traps`: List camera traps
- `GET /api/v1/camera-traps/{id}`: Get camera details
- `POST /api/v1/camera-traps`: Create camera trap
- `PUT /api/v1/camera-traps/{id}`: Edit status/info
- `DELETE /api/v1/camera-traps/{id}`: Remove camera

### 4. Audio Sensors
- `GET /api/v1/audio-sensors`: List audio sensors
- `GET /api/v1/audio-sensors/{id}`: Get sensor details
- `POST /api/v1/audio-sensors`: Register sensor
- `PUT /api/v1/audio-sensors/{id}`: Edit sensor details
- `DELETE /api/v1/audio-sensors/{id}`: Remove sensor

### 5. Observations
- `GET /api/v1/observations`: List wildlife observations
- `GET /api/v1/observations/{id}`: Get observation details (includes media list)
- `POST /api/v1/observations`: Log a wildlife observation
- `PUT /api/v1/observations/{id}`: Edit observation
- `DELETE /api/v1/observations/{id}`: Remove observation

### 6. Media & File Upload
- `POST /api/v1/files/upload`: Multipart file upload endpoint. Uploads to Cloudinary (falls back to local storage) and returns file metadata (URL, public_id, size, MIME type, type).
- `POST /api/v1/media`: Create media record linking observation_id to the uploaded metadata.
- `GET /api/v1/media/observation/{observation_id}`: Retrieve media items associated with an observation.

### 7. Dashboard Metrics
- `GET /api/v1/dashboard/summary`: Returns summary statistics (Total Surveys, Sites, Devices, Observations, and charts data arrays).
