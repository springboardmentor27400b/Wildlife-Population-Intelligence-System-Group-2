# Implementation Roadmap - Milestone 1

This roadmap details the sequential steps to implement the first milestone of the Wildlife Population Intelligence System.

## Phase 1: Foundations & Database Models
1. **Root Setup:** `.env`, `.gitignore`, `docker-compose.yml`, `Dockerfile`.
2. **Database Core:** Configuration, connection session helper, migration scripts.
3. **Database Models:** Declare user, survey, monitoring site, camera trap, audio sensor, observation, and media tables with UUID IDs and SQLAlchemy 2.0 mapped properties.
4. **Migrations:** Running `alembic init` (or custom script) and applying the initial migrations.

## Phase 2: Core Security & Auth Service
1. **Password Utility:** Secure hashing using Passlib with bcrypt.
2. **JWT System:** Generating Access Tokens (HS256) and decoding/verifying token payloads.
3. **RBAC Guard Middleware:** Verification of roles for specific API paths.

## Phase 3: Repositories & Services Layer
1. **Base Repository:** Custom abstract layer containing standard CRUD operations.
2. **Models Repositories:** Individual repositories that inherit from the Base Repository.
3. **Business Services:** Validation and storage interfaces (Local Storage & Cloudinary).

## Phase 4: API Controllers (FastAPI)
1. **Validation Schemas:** Pydantic models for incoming requests and outgoing responses.
2. **Routing:** Auth routes, CRUD endpoints for all models, dashboard metrics endpoints.

## Phase 5: Frontend Layout & Shell
1. **Vite Configurations:** Tailwind setup, theme settings.
2. **Authentication State:** AuthContext, JWT local storage persistence, automatic redirection.
3. **Layout Shell:** Sidebar, responsive Navbar, theme toggle.

## Phase 6: Frontend Pages & API clients
1. **Axios Integration:** Interceptor to automatically add JWT headers.
2. **CRUD pages:** Component forms, list data tables, skeletons, modal components.
3. **Dashboard Page:** visual charts representing survey details, observations, and device counts.

## Phase 7: Verification & Polishing
1. Run backend tests.
2. Verify Alembic schema modifications.
3. Build and test frontend compilation.
