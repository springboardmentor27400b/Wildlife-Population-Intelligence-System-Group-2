# Architecture Document

This document outlines the software architecture of the **Wildlife Population Intelligence System** (Milestone 1).

## System Architecture

The application is structured as a decoupled Single Page Application (SPA) communicating over a secure RESTful API.

```
                                   +--------------------------------------+
                                   |           React Frontend             |
                                   |   (React, Vite, Axios, Tailwind)     |
                                   +-------------------+------------------+
                                                       |
                                                       | HTTPS / JSON
                                                       v
                                   +-------------------+------------------+
                                   |          FastAPI Backend             |
                                   +-------------------+------------------+
                                                       |
                        +------------------------------+------------------------------+
                        |                                                             |
                        v                                                             v
        +---------------+---------------+                             +---------------+---------------+
        |    PostgreSQL Database        |                             |     Cloudinary Media Cloud    |
        |  (Schema, UUIDs, Indexes)     |                             |   (Images & Audio Storage)    |
        +-------------------------------+                             +-------------------------------+
```

## Backend Architecture

The backend follows clean layered architecture patterns:
1. **API Router:** Manages HTTP endpoints, requests validation (Pydantic V2), and Dependency Injection.
2. **Guards & Roles:** Layer that intercepts HTTP requests to inspect JWT tokens and validates Role Based Access Control (RBAC).
3. **Services:** Implements the core business logic (e.g. storage validation, token issuance, dashboard statistics).
4. **Repositories:** Implements CRUD database transactions using SQLAlchemy 2.0.
5. **Database Models:** SQLAlchemy declarative models mapped to the PostgreSQL database.

## Frontend Architecture

The frontend is structured around components, hooks, contexts, and pages:
1. **Context API:** Handles global state:
   - `AuthContext`: Tracks JWT token and current logged-in user profile.
   - `ThemeContext`: Toggles Dark/Light theme values in local storage and HTML class attributes.
2. **Custom Hooks:** Bundles standard API queries, debounce, and pagination behaviors.
3. **Layout Shell:** Sidebar navigation with responsive toggles, specific tabs rendered based on user roles.
4. **Common Components:** Modular inputs, badges, skeletons, buttons, and custom charts.
