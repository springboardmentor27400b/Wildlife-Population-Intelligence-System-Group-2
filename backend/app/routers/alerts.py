from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Observation

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


# ---------------------------------------------------------
# Helper: calculate severity
# ---------------------------------------------------------

def get_severity(score):
    if score >= 80:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Moderate"
    else:
        return "Low"


# ---------------------------------------------------------
# 1. Endangered Species Alerts
# ---------------------------------------------------------

@router.get("/endangered-species")
def endangered_species_alerts(
    db: Session = Depends(get_db)
):
    observations = db.query(Observation).all()

    species_data = {}

    for obs in observations:

        species = getattr(obs, "species_name", None)

        if not species:
            continue

        population = getattr(obs, "animal_count", None) or 0

        if species not in species_data:
            species_data[species] = {
                "species": species,
                "population": 0,
                "observations": 0
            }

        species_data[species]["population"] += population
        species_data[species]["observations"] += 1

    alerts = []

    for data in species_data.values():

        population = data["population"]

        if population <= 5:
            severity = "Critical"
        elif population <= 10:
            severity = "High"
        elif population <= 20:
            severity = "Moderate"
        else:
            continue

        alerts.append({
            "alert_type": "Endangered Species",
            "species": data["species"],
            "population": population,
            "observations": data["observations"],
            "severity": severity,
            "message": (
                f"Low population detected for {data['species']}. "
                f"Immediate conservation monitoring is recommended."
            )
        })

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


# ---------------------------------------------------------
# 2. Population Decline Alerts
# ---------------------------------------------------------

@router.get("/population-decline")
def population_decline_alerts(
    db: Session = Depends(get_db)
):
    observations = db.query(Observation).all()

    species_data = {}

    for obs in observations:

        species = getattr(obs, "species_name", None)

        if not species:
            continue

        population = getattr(obs, "animal_count", None) or 0

        if species not in species_data:
            species_data[species] = []

        species_data[species].append(population)

    alerts = []

    for species, populations in species_data.items():

        if len(populations) < 2:
            continue

        previous = populations[-2]
        current = populations[-1]

        if previous <= 0:
            continue

        decline = ((previous - current) / previous) * 100

        if decline <= 0:
            continue

        if decline >= 50:
            severity = "Critical"
        elif decline >= 25:
            severity = "High"
        else:
            severity = "Moderate"

        alerts.append({
            "alert_type": "Population Decline",
            "species": species,
            "previous_population": previous,
            "current_population": current,
            "decline_percentage": round(decline, 2),
            "severity": severity,
            "message": (
                f"{species} population declined by "
                f"{round(decline, 2)}%. "
                f"Population monitoring should be increased."
            )
        })

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


# ---------------------------------------------------------
# 3. Habitat Degradation Alerts
# ---------------------------------------------------------

@router.get("/habitat-degradation")
def habitat_degradation_alerts(
    db: Session = Depends(get_db)
):
    observations = db.query(Observation).all()

    habitat_data = {}

    for obs in observations:

        habitat = getattr(obs, "habitat", None)

        if not habitat:
            habitat = "Unknown Habitat"

        if habitat not in habitat_data:
            habitat_data[habitat] = {
                "habitat": habitat,
                "observations": 0,
                "population": 0
            }

        habitat_data[habitat]["observations"] += 1

        population = getattr(obs, "animal_count", None) or 0
        habitat_data[habitat]["population"] += population

    alerts = []

    for data in habitat_data.values():

        observations_count = data["observations"]
        population = data["population"]

        # Low observations + low population indicates
        # possible habitat degradation / reduced wildlife presence
        if observations_count <= 1 and population <= 10:

            severity = "Critical"

        elif observations_count <= 2 and population <= 20:

            severity = "High"

        else:
            continue

        alerts.append({
            "alert_type": "Habitat Degradation",
            "habitat": data["habitat"],
            "observations": observations_count,
            "population": population,
            "severity": severity,
            "message": (
                f"Possible habitat degradation detected in "
                f"{data['habitat']}. Habitat assessment and "
                f"restoration planning are recommended."
            )
        })

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


# ---------------------------------------------------------
# 4. Monitoring Device Alerts
# ---------------------------------------------------------

@router.get("/monitoring-devices")
def monitoring_device_alerts():

    # Static device status for Milestone 4 demonstration.
    # Later this can be connected to real IoT/device data.

    devices = [
        {
            "device_id": "CAM-001",
            "location": "Nagarjuna Sagar Forest",
            "device_type": "Camera Trap",
            "status": "Online",
            "battery": 87
        },
        {
            "device_id": "CAM-002",
            "location": "Nalamala Forest",
            "device_type": "Camera Trap",
            "status": "Offline",
            "battery": 12
        },
        {
            "device_id": "AUD-001",
            "location": "Bandhavgarh National Park",
            "device_type": "Audio Sensor",
            "status": "Online",
            "battery": 65
        },
        {
            "device_id": "CAM-003",
            "location": "Leopard Zone 1",
            "device_type": "Camera Trap",
            "status": "Low Battery",
            "battery": 18
        }
    ]

    alerts = []

    for device in devices:

        if device["status"] == "Offline":

            severity = "Critical"

            message = (
                f"{device['device_type']} {device['device_id']} "
                f"is offline at {device['location']}."
            )

        elif device["status"] == "Low Battery":

            severity = "High"

            message = (
                f"{device['device_type']} {device['device_id']} "
                f"has low battery ({device['battery']}%)."
            )

        elif device["battery"] < 20:

            severity = "High"

            message = (
                f"{device['device_type']} {device['device_id']} "
                f"requires battery replacement."
            )

        else:
            continue

        alerts.append({
            "alert_type": "Monitoring Device",
            "device_id": device["device_id"],
            "location": device["location"],
            "device_type": device["device_type"],
            "status": device["status"],
            "battery": device["battery"],
            "severity": severity,
            "message": message
        })

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


# ---------------------------------------------------------
# 5. Conservation Notifications
# ---------------------------------------------------------

@router.get("/conservation")
def conservation_notifications(
    db: Session = Depends(get_db)
):
    observations = db.query(Observation).all()

    species_data = {}

    for obs in observations:

        species = getattr(obs, "species_name", None)

        if not species:
            continue

        population = getattr(obs, "animal_count", None) or 0

        if species not in species_data:
            species_data[species] = 0

        species_data[species] += population

    notifications = []

    for species, population in species_data.items():

        if population <= 5:

            notifications.append({
                "notification_type": "Conservation Action",
                "species": species,
                "priority": "Critical",
                "message": (
                    f"Immediate conservation intervention is "
                    f"recommended for {species}."
                ),
                "action": "Increase protection and intensive monitoring."
            })

        elif population <= 10:

            notifications.append({
                "notification_type": "Conservation Action",
                "species": species,
                "priority": "High",
                "message": (
                    f"Additional conservation measures are "
                    f"recommended for {species}."
                ),
                "action": "Increase monitoring and protection."
            })

        elif population <= 20:

            notifications.append({
                "notification_type": "Conservation Action",
                "species": species,
                "priority": "Moderate",
                "message": (
                    f"Regular conservation monitoring is recommended "
                    f"for {species}."
                ),
                "action": "Continue regular monitoring."
            })

    return {
        "total_notifications": len(notifications),
        "notifications": notifications
    }


# ---------------------------------------------------------
# 6. ALL ALERTS — Dashboard endpoint
# ---------------------------------------------------------

@router.get("/all")
def all_alerts(
    db: Session = Depends(get_db)
):

    endangered = endangered_species_alerts(db)
    decline = population_decline_alerts(db)
    habitat = habitat_degradation_alerts(db)
    devices = monitoring_device_alerts()
    conservation = conservation_notifications(db)

    all_alerts_list = []

    all_alerts_list.extend(endangered["alerts"])
    all_alerts_list.extend(decline["alerts"])
    all_alerts_list.extend(habitat["alerts"])
    all_alerts_list.extend(devices["alerts"])

    for notification in conservation["notifications"]:

        all_alerts_list.append({
            "alert_type": notification["notification_type"],
            "species": notification["species"],
            "severity": notification["priority"],
            "message": notification["message"],
            "action": notification["action"]
        })

    critical = sum(
        1 for alert in all_alerts_list
        if alert.get("severity") == "Critical"
    )

    high = sum(
        1 for alert in all_alerts_list
        if alert.get("severity") == "High"
    )

    moderate = sum(
        1 for alert in all_alerts_list
        if alert.get("severity") == "Moderate"
    )

    return {
        "total_alerts": len(all_alerts_list),
        "critical": critical,
        "high": high,
        "moderate": moderate,
        "alerts": all_alerts_list
    }