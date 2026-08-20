-- 1. ROLES
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. USERS
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(100) NOT NULL REFERENCES roles(role_name),
    phone_number VARCHAR(50),
    profile_picture TEXT,
    organization VARCHAR(255),
    designation VARCHAR(255),
    preferences JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);

-- 3. MONITORING SITES
CREATE TABLE monitoring_sites (
    id VARCHAR(50) PRIMARY KEY,
    site_name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    habitat_type VARCHAR(100) NOT NULL,
    area_sq_km DOUBLE PRECISION NOT NULL,
    description TEXT,
    status VARCHAR(50),
    created_by VARCHAR(50) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 4. SENSOR DEVICES
CREATE TABLE sensor_devices (
    id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    monitoring_site_id VARCHAR(50) NOT NULL REFERENCES monitoring_sites(id),
    monitoring_site_name VARCHAR(255),
    battery_level DOUBLE PRECISION,
    last_active TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 5. OBSERVATION RECORDS
CREATE TABLE observation_records (
    id VARCHAR(50) PRIMARY KEY,
    species_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    count INT NOT NULL,
    count_accuracy VARCHAR(50),
    gender VARCHAR(50),
    age_group VARCHAR(50),
    monitoring_site_name VARCHAR(255) REFERENCES monitoring_sites(site_name),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    habitat_type VARCHAR(100),
    weather_conditions VARCHAR(255),
    verification_status VARCHAR(50),
    observed_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    observer_id VARCHAR(50) NOT NULL REFERENCES users(id),
    observer_name VARCHAR(255),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
CREATE INDEX idx_observation_species ON observation_records(species_name);
CREATE INDEX idx_observation_date ON observation_records(observed_at);

-- 6. PREDICTION RECORDS
CREATE TABLE prediction_records (
    id VARCHAR(50) PRIMARY KEY,
    image_file_name TEXT,
    image_url TEXT,
    species_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    confidence_score DOUBLE PRECISION NOT NULL,
    explanation TEXT,
    similar_species JSONB,
    status VARCHAR(50),
    observation_id VARCHAR(50), 
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 7. AUDIO PREDICTION RECORDS
CREATE TABLE audio_prediction_records (
    id VARCHAR(50) PRIMARY KEY,
    audio_file_name TEXT,
    file_url TEXT,
    species_name VARCHAR(255) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    explanation TEXT,
    spectogram_url TEXT,
    model_name VARCHAR(255),
    top_predictions JSONB,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(255),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    observation_id VARCHAR(50),
    created_at TIMESTAMPTZ
);

-- 8. UNIFIED PREDICTION RECORDS
CREATE TABLE unified_prediction_records (
    id VARCHAR(50) PRIMARY KEY,
    species_name VARCHAR(255) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    prediction_source VARCHAR(50) NOT NULL,
    prediction_timestamp TIMESTAMPTZ NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(255),
    taxonomy JSONB,
    family VARCHAR(255),
    category VARCHAR(255),
    conservation_status VARCHAR(255),
    habitat VARCHAR(255),
    diet VARCHAR(255),
    average_lifespan VARCHAR(255),
    average_weight VARCHAR(255),
    geographic_distribution VARCHAR(255),
    brief_description TEXT,
    typical_behaviour TEXT,
    active_time VARCHAR(255),
    population_trend VARCHAR(255),
    average_height VARCHAR(255),
    length VARCHAR(255),
    speed VARCHAR(255),
    predators VARCHAR(255),
    prey VARCHAR(255),
    reproduction TEXT,
    interesting_facts TEXT,
    native_regions VARCHAR(255),
    climate VARCHAR(255),
    food_chain_level VARCHAR(255),
    endemic_status VARCHAR(255),
    protected_areas VARCHAR(255),
    scientific_reference_url TEXT,
    top_predictions JSONB,
    explanation TEXT,
    similar_species JSONB,
    inference_time DOUBLE PRECISION,
    prediction_engine VARCHAR(100),
    source_record_id VARCHAR(50) NOT NULL,
    observation_id VARCHAR(50),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 9. POPULATION ESTIMATIONS
CREATE TABLE population_estimations (
    id VARCHAR(50) PRIMARY KEY,
    species_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    monitoring_site_name VARCHAR(255) NOT NULL,
    estimated_population DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    growth_trend DOUBLE PRECISION NOT NULL,
    statistics JSONB,
    calculation_date DATE,
    created_at TIMESTAMPTZ
);

-- 10. ADVANCED ANALYTICS CACHE
CREATE TABLE advanced_analytics_cache (
    id VARCHAR(50) PRIMARY KEY,
    query_hash VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- 11. AUDIT LOGS
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    entity_type VARCHAR(100),
    ip_address VARCHAR(100),
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL
);

-- 12. FIELD UPLOADS
CREATE TABLE field_uploads (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    upload_type VARCHAR(100) NOT NULL,
    file_name TEXT NOT NULL,
    stored_file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size DOUBLE PRECISION NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    monitoring_site_id VARCHAR(50) NOT NULL REFERENCES monitoring_sites(id),
    monitoring_site_name VARCHAR(255) NOT NULL,
    sensor_device_id VARCHAR(50) REFERENCES sensor_devices(id),
    sensor_device_name VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    uploaded_by VARCHAR(50) NOT NULL REFERENCES users(id),
    uploaded_by_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    is_read BOOLEAN DEFAULT FALSE,
    reference_id VARCHAR(50),
    reference_type VARCHAR(100),
    created_at TIMESTAMPTZ
);

-- 14. REPORT HISTORY
CREATE TABLE report_history (
    id VARCHAR(50) PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    generated_at TIMESTAMPTZ,
    filters JSONB,
    export_format VARCHAR(50) NOT NULL,
    status VARCHAR(50)
);
