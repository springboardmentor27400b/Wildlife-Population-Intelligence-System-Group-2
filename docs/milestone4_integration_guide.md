# Milestone 4 - Integration & Features Developer Guide

This document outlines the architecture, database additions, API routes, and verification tests completed for the Milestone 4 presentation layer.

---

## 1. Role-Specific Dashboards

All four role-specific dashboards consume live, dynamic API metrics. There are zero hardcoded statistics or charts.

1.  **Wildlife Researcher Dashboard:**
    *   **Focus:** Core species abundance, Richness counts, and Shannon-Wiener and Simpson index calculations.
    *   **Features:** Temporal observation trends, Species distribution counts, and detail redirects.
2.  **Conservation Officer Dashboard:**
    *   **Focus:** Threat monitoring, species status prioritizations (Critical/High/Medium), and vulnerable site classifications.
    *   **Features:** Conservation priority tables and risk scores.
3.  **Forest Department Officer Dashboard:**
    *   **Focus:** Patrols telemetry, device statuses (Active/Inactive/Maintenance), and interactive GIS overlays.
    *   **Features:** Layer toggles for sightings and traps.
4.  **Administrator Dashboard:**
    *   **Focus:** Global platform audits, user registrations, and device management.
    *   **Features:** Metric aggregators for total users, active sensors, and surveys.

---

## 2. Notification & Alert System

A robust notification system generates system-wide alerts based on telemetry conditions.

### A. Database Model (`notifications` table)
*   `id`: unique primary key (UUID).
*   `notification_type`: alert category (`endangered_species`, `population_decline`, `habitat_degradation`, `device_alert`).
*   `title` / `message`: user-facing alert copy.
*   `severity`: severity hierarchy (`critical`, `high`, `medium`, `low`).
*   `is_read`: boolean flag tracking read status.
*   `recipient_role`: specifies target role restriction.
*   `created_at`: timestamps indicating generation time.

### B. Auto-Alert Rules Engine
Alerts are generated dynamically on feed retrieval:
*   **Endangered Alerts:** Triggered if an observation reports a species classified as "Critically Endangered" or "Endangered" in `SpeciesProfile`.
*   **Population Decline Alerts:** Triggered if a species profile has its `population_trend` flagged as "Decreasing".
*   **Habitat Quality Warnings:** Triggered if a monitoring site's dynamic ecological suitability rating falls below `60.0%` or reports `High` human conflict.
*   **Device Maintenance Warnings:** Triggered if a camera trap or audio sensor status transitions to `Inactive` or `Maintenance`.

---

## 3. Reports & Excel Export System

Supports exporting data for all five report categories: **Survey, Population, Biodiversity, Habitat, and Conservation**.

### A. PDF Export
*   Generated using ReportLab.
*   Secure authenticated binary transfer via Axios blob handling (protects tokens from URL exposure).

### B. Excel Export
*   Compiled using `openpyxl`.
*   **API Route:** `GET /api/v1/reports/{analysis_id}/export-excel`
*   Features: Styled headers, dynamic column widths, and custom worksheets populated with filtered database records.

---

## 4. Verification & Testing

Verify system functionalities using the following test scripts:

1.  **PDF Reports Verification:**
    ```powershell
    .\venv\Scripts\python scratch/verify_pdf_reports.py
    ```
2.  **Excel Reports Verification:**
    ```powershell
    .\venv\Scripts\python scratch/verify_excel_reports.py
    ```
3.  **Notifications & Role Isolation Verification:**
    ```powershell
    .\venv\Scripts\python scratch/verify_notifications.py
    ```

All verification suites pass 100% locally with HTTP 200, correct media formats, and precise database counts.
