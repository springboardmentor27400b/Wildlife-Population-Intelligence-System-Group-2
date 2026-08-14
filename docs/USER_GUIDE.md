# User Guide

Welcome to the **Wildlife Population Intelligence System** (Milestone 1).

## Role Capabilities

The platform operates on a strict Role-Based Access Control (RBAC) model. Here is what each role can do:

| Feature / Resource | Administrator | Wildlife Researcher | Conservation Officer | Forest Department Officer |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Users** | Yes | No | No | No |
| **Create/Edit Surveys** | Yes | Yes | No | No |
| **Delete Surveys** | Yes | No | No | No |
| **Manage Monitoring Sites** | Yes | Yes | Yes | No |
| **Manage Camera Traps & Sensors**| Yes | Yes | Yes | No |
| **View/Log Observations** | Yes | Yes | Yes | Yes |
| **Modify Observations** | Yes | Yes | Yes (Own only) | No |
| **Delete Observations** | Yes | No | No | No |

## Getting Started

1. **Registration:**
   - Go to the register page.
   - Choose your role.
   - Fill in your details and log in.

2. **Dashboard:**
   - View summary tiles (total surveys, active devices, total observations logged).
   - View device status charts and recent observation graphs.

3. **Surveys & Sites:**
   - Creating a survey acts as the high-level boundary.
   - Inside a survey, create individual Monitoring Sites specifying geographic coordinates (latitude and longitude).

4. **Devices:**
   - Link Camera Traps and Audio Sensors to monitoring sites. Set status to Active/Inactive.

5. **Observations & Media:**
   - Add new observation records from the field.
   - Attach image and audio media uploads. Media is saved to Cloudinary.
