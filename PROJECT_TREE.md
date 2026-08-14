# Project Tree Structure

```
wildlife-population-intelligence/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── README.md
├── PROJECT_TREE.md
├── IMPLEMENTATION_ROADMAP.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── backend/
│   ├── alembic.ini
│   ├── requirements.txt
│   │
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── uploads/
│   │   ├── images/
│   │   └── audio/
│   │
│   ├── logs/
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   │   ├── test_surveys.py
│   │   ├── test_monitoring_sites.py
│   │   ├── test_camera_traps.py
│   │   ├── test_audio_sensors.py
│   │   ├── test_observations.py
│   │   ├── test_media.py
│   │   └── test_dashboard.py
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       │
│       ├── core/
│       │   ├── config.py
│       │   ├── constants.py
│       │   ├── database.py
│       │   ├── logging_config.py
│       │   ├── security.py
│       │   ├── middleware.py
│       │   ├── exceptions.py
│       │   └── dependencies.py
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   ├── base.py
│       │   ├── enums.py
│       │   ├── user.py
│       │   ├── survey.py
│       │   ├── monitoring_site.py
│       │   ├── camera_trap.py
│       │   ├── audio_sensor.py
│       │   ├── observation.py
│       │   └── media.py
│       │
│       ├── schemas/
│       │   ├── common.py
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── survey.py
│       │   ├── monitoring_site.py
│       │   ├── camera_trap.py
│       │   ├── audio_sensor.py
│       │   ├── observation.py
│       │   ├── media.py
│       │   └── dashboard.py
│       │
│       ├── api/
│       │   ├── deps.py
│       │   ├── router.py
│       │   └── v1/
│       │       ├── auth.py
│       │       ├── users.py
│       │       ├── surveys.py
│       │       ├── monitoring_sites.py
│       │       ├── camera_traps.py
│       │       ├── audio_sensors.py
│       │       ├── observations.py
│       │       ├── media.py
│       │       ├── dashboard.py
│       │       └── files.py
│       │
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── user_service.py
│       │   ├── survey_service.py
│       │   ├── monitoring_site_service.py
│       │   ├── camera_trap_service.py
│       │   ├── audio_sensor_service.py
│       │   ├── observation_service.py
│       │   ├── media_service.py
│       │   ├── storage_service.py
│       │   └── dashboard_service.py
│       │
│       ├── repositories/
│       │   ├── base_repository.py
│       │   ├── user_repository.py
│       │   ├── survey_repository.py
│       │   ├── monitoring_site_repository.py
│       │   ├── camera_trap_repository.py
│       │   ├── audio_sensor_repository.py
│       │   ├── observation_repository.py
│       │   └── media_repository.py
│       │
│       ├── auth/
│       │   ├── roles.py
│       │   ├── permissions.py
│       │   └── guards.py
│       │
│       ├── storage/
│       │   ├── cloudinary_storage.py
│       │   ├── local_storage.py
│       │   └── validators.py
│       │
│       └── utils/
│           ├── helpers.py
│           ├── pagination.py
│           ├── responses.py
│           └── validators.py
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    │
    ├── public/
    │   ├── favicon.svg
    │   └── logo.svg
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── api/
        │   ├── axios.js
        │   ├── auth.js
        │   ├── users.js
        │   ├── surveys.js
        │   ├── monitoringSites.js
        │   ├── cameraTraps.js
        │   ├── audioSensors.js
        │   ├── observations.js
        │   ├── media.js
        │   ├── dashboard.js
        │   └── files.js
        │
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        │
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useTheme.js
        │   ├── useApi.js
        │   ├── useDebounce.js
        │   └── usePagination.js
        │
        ├── routes/
        │   └── index.jsx
        │
        ├── layouts/
        │   ├── AppLayout.jsx
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        │
        ├── components/
        │   ├── common/
        │   │   ├── Badge.jsx
        │   │   ├── Button.jsx
        │   │   ├── Card.jsx
        │   │   ├── ConfirmDialog.jsx
        │   │   ├── DataTable.jsx
        │   │   ├── EmptyState.jsx
        │   │   ├── ErrorBoundary.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Pagination.jsx
        │   │   ├── SearchBar.jsx
        │   │   ├── Skeleton.jsx
        │   │   ├── Spinner.jsx
        │   │   └── Toast.jsx
        │   │
        │   ├── charts/
        │   │   ├── AreaChart.jsx
        │   │   ├── BarChart.jsx
        │   │   ├── PieChart.jsx
        │   │   └── StatCard.jsx
        │   │
        │   └── forms/
        │       ├── CoordinatesInput.jsx
        │       ├── FileUpload.jsx
        │       ├── FormField.jsx
        │       └── SelectField.jsx
        │
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── NotFound.jsx
        │   ├── SurveyList.jsx
        │   ├── SurveyDetail.jsx
        │   ├── SurveyForm.jsx
        │   ├── MonitoringSiteList.jsx
        │   ├── MonitoringSiteDetail.jsx
        │   ├── MonitoringSiteForm.jsx
        │   ├── CameraTrapList.jsx
        │   ├── CameraTrapDetail.jsx
        │   ├── CameraTrapForm.jsx
        │   ├── AudioSensorList.jsx
        │   ├── AudioSensorDetail.jsx
        │   ├── AudioSensorForm.jsx
        │   ├── ObservationList.jsx
        │   ├── ObservationDetail.jsx
        │   └── ObservationForm.jsx
        │
        ├── theme/
        │   ├── colors.js
        │   └── theme.js
        │
        └── utils/
            ├── constants.js
            ├── formatters.js
            ├── helpers.js
            └── validators.js
```
