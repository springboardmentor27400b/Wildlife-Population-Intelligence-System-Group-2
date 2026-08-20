from datetime import date, datetime, timezone
from typing import Any

from app.models.wildlife import Wildlife
from app.models.habitat import Habitat
from app.models.monitoring_site import MonitoringSite

from app.services.population_service import get_population_alerts
from app.services.conservation_service import (
    get_conservation_priority_recommendations,
    get_habitat_restoration_suggestions,
)


# ============================================================
# HELPERS
# ============================================================

def parse_datetime(value: Any) -> datetime | None:

    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    if isinstance(value, date):
        return datetime(
            value.year,
            value.month,
            value.day,
            tzinfo=timezone.utc,
        )

    if isinstance(value, str):

        text = value.strip()

        if not text:
            return None

        try:

            parsed = datetime.fromisoformat(
                text.replace("Z", "+00:00")
            )

            if parsed.tzinfo is None:
                parsed = parsed.replace(
                    tzinfo=timezone.utc
                )

            return parsed

        except ValueError:
            return None

    return None


def severity_rank(
    severity: str,
) -> int:

    value = str(
        severity or ""
    ).lower()

    if value == "critical":
        return 4

    if value == "high":
        return 3

    if value in {"medium", "moderate"}:
        return 2

    return 1


def make_alert(
    *,
    category: str,
    severity: str,
    title: str,
    message: str,
    source: str,
    species: str | None = None,
    location: str | None = None,
) -> dict:

    return {

        "category": category,

        "severity": severity,

        "title": title,

        "message": message,

        "species": species,

        "location": location,

        "source": source,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),

    }


# ============================================================
# ENDANGERED SPECIES ALERTS
# ============================================================

async def build_endangered_species_alerts():

    records = await Wildlife.find_all().to_list()

    alerts = []

    seen = set()

    for record in records:

        species = (
            str(
                getattr(
                    record,
                    "species_name",
                    "Unknown species",
                )
            )
            .strip()
            .title()
        )

        status = str(
            getattr(
                record,
                "conservation_status",
                "Not Evaluated",
            )
            or "Not Evaluated"
        ).strip()

        normalized_status = status.lower()

        if "endangered" not in normalized_status:
            continue

        location = (
            getattr(
                record,
                "location",
                None,
            )
            or "Location unavailable"
        )

        key = (
            species,
            location,
            status,
        )

        if key in seen:
            continue

        seen.add(key)

        population = (
            getattr(
                record,
                "count",
                None,
            )
            or 0
        )

        alerts.append(
            make_alert(
                category="endangered_species",
                severity="Critical",
                title=(
                    f"Endangered species detected: "
                    f"{species}"
                ),
                message=(
                    f"{species} is classified as "
                    f"{status}. "
                    f"Observed count: {population}. "
                    f"Immediate conservation attention "
                    f"is recommended."
                ),
                source="Wildlife records",
                species=species,
                location=location,
            )
        )

    return alerts


# ============================================================
# POPULATION DECLINE ALERTS
# ============================================================

async def build_population_decline_alerts():

    alerts = []

    try:

        data = await get_population_alerts()

    except Exception:

        return alerts

    source_alerts = (
        data.get("alerts", [])
        if isinstance(data, dict)
        else []
    )

    decline_terms = {
        "decline",
        "declining",
        "decrease",
        "decreased",
        "drop",
        "dropping",
    }

    for item in source_alerts:

        alert_type = str(
            item.get(
                "alert_type",
                "",
            )
        ).strip()

        normalized = alert_type.lower()

        if not any(
            term in normalized
            for term in decline_terms
        ):
            continue

        severity = str(
            item.get(
                "severity",
                "Medium",
            )
            or "Medium"
        )

        alerts.append(
            make_alert(
                category="population_decline",
                severity=severity,
                title=(
                    f"Population decline: "
                    f"{item.get('species', 'Unknown species')}"
                ),
                message=(
                    f"{alert_type}. "
                    f"Population indicators require "
                    f"further field assessment."
                ),
                source="Population alert engine",
                species=item.get("species"),
                location=item.get("location"),
            )
        )

    return alerts


# ============================================================
# HABITAT DEGRADATION ALERTS
# ============================================================

async def build_habitat_degradation_alerts():

    habitats = await Habitat.find_all().to_list()

    alerts = []

    for habitat in habitats:

        vegetation = float(
            getattr(
                habitat,
                "vegetation_health",
                0,
            )
            or 0
        )

        water = float(
            getattr(
                habitat,
                "water_quality",
                0,
            )
            or 0
        )

        suitability_value = getattr(
            habitat,
            "habitat_suitability_score",
            None,
        )

        suitability = None

        if suitability_value is not None:

            try:
                suitability = float(
                    suitability_value
                )
            except (TypeError, ValueError):
                suitability = None

        issues = []

        if vegetation < 50:
            issues.append(
                "poor vegetation health"
            )

        if water < 50:
            issues.append(
                "poor water quality"
            )

        if (
            suitability is not None
            and suitability < 50
        ):
            issues.append(
                "low habitat suitability"
            )

        if not issues:
            continue

        if (
            vegetation < 50
            and water < 50
        ):
            severity = "Critical"

        else:
            severity = "High"

        location = (
            getattr(
                habitat,
                "location",
                None,
            )
            or "Unknown location"
        )

        alerts.append(
            make_alert(
                category="habitat_degradation",
                severity=severity,
                title=(
                    f"Habitat degradation risk: "
                    f"{location}"
                ),
                message=(
                    "Habitat assessment identified "
                    + ", ".join(issues)
                    + ". Restoration or field assessment "
                      "is recommended."
                ),
                source="Habitat assessment",
                location=location,
            )
        )

    return alerts

# ============================================================
# MONITORING DEVICE ALERTS
# ============================================================

async def build_monitoring_device_alerts():

    sites = (
        await MonitoringSite
        .find_all()
        .to_list()
    )

    alerts = []

    for site in sites:

        # ----------------------------------------------------
        # Current monitoring model may not contain device data.
        #
        # Only create a device alert when the model actually
        # provides an explicit device/status field.
        # ----------------------------------------------------

        device = (
            getattr(
                site,
                "monitoring_device",
                None,
            )
            or getattr(
                site,
                "device",
                None,
            )
        )

        device_status = (
            getattr(
                site,
                "monitoring_device_status",
                None,
            )
            or getattr(
                site,
                "device_status",
                None,
            )
        )

        location = (
            getattr(
                site,
                "site_name",
                None,
            )
            or getattr(
                site,
                "monitoring_location",
                None,
            )
            or getattr(
                site,
                "location",
                None,
            )
            or "Unknown location"
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # If the current model contains no device information,
        # do NOT generate a false "device missing" alert.
        # ----------------------------------------------------

        if device is None and device_status is None:
            continue

        # ----------------------------------------------------
        # Explicitly reported device failure/offline state
        # ----------------------------------------------------

        status_text = str(
            device_status or ""
        ).strip().lower()

        failure_states = {
            "offline",
            "inactive",
            "failed",
            "failure",
            "fault",
            "faulty",
            "disconnected",
            "not working",
        }

        if status_text in failure_states:

            alerts.append(
                make_alert(
                    category="monitoring_device",
                    severity="High",
                    title=(
                        f"Monitoring device issue: "
                        f"{location}"
                    ),
                    message=(
                        f"Monitoring device"
                        f"{f' {device}' if device else ''} "
                        f"is currently reported as "
                        f"'{device_status}'. "
                        f"Field inspection is recommended."
                    ),
                    source="Monitoring system",
                    location=location,
                )
            )

            continue

        # ----------------------------------------------------
        # Explicit missing device field
        #
        # Only alert when a device field exists in the model
        # but contains an empty value. We don't treat a model
        # that simply has no device field as an alert.
        # ----------------------------------------------------

        has_device_field = (
            hasattr(
                site,
                "monitoring_device"
            )
            or hasattr(
                site,
                "device"
            )
        )

        if has_device_field and not str(
            device or ""
        ).strip():

            alerts.append(
                make_alert(
                    category="monitoring_device",
                    severity="High",
                    title=(
                        f"Monitoring device missing: "
                        f"{location}"
                    ),
                    message=(
                        "The monitoring site has a device "
                        "field but no device is currently "
                        "registered. Review the site "
                        "configuration."
                    ),
                    source="Monitoring system",
                    location=location,
                )
            )

    return alerts

# ============================================================
# CONSERVATION NOTIFICATIONS
# ============================================================

async def build_conservation_notifications():

    alerts = []

    try:

        priority_data = (
            await
            get_conservation_priority_recommendations()
        )

        recommendations = (
            priority_data.get(
                "recommendations",
                [],
            )
            if isinstance(priority_data, dict)
            else []
        )

        for item in recommendations:

            priority = str(
                item.get(
                    "priority",
                    "",
                )
            )

            if priority.lower() not in {
                "critical",
                "high",
            }:
                continue

            alerts.append(
                make_alert(
                    category="conservation_notification",
                    severity=priority,
                    title=(
                        f"{priority} conservation "
                        f"priority: "
                        f"{item.get('species', 'Unknown species')}"
                    ),
                    message=(
                        item.get(
                            "recommendation",
                            "Conservation action recommended.",
                        )
                    ),
                    source="Conservation recommendation engine",
                    species=item.get("species"),
                )
            )

    except Exception:
        pass


    try:

        restoration_data = (
            await
            get_habitat_restoration_suggestions()
        )

        recommendations = (
            restoration_data.get(
                "restoration_recommendations",
                [],
            )
            if isinstance(restoration_data, dict)
            else []
        )

        for item in recommendations:

            priority = str(
                item.get(
                    "priority",
                    "",
                )
            )

            if priority.lower() != "high":
                continue

            alerts.append(
                make_alert(
                    category="conservation_notification",
                    severity="High",
                    title=(
                        "High-priority habitat restoration: "
                        f"{item.get('location', 'Unknown location')}"
                    ),
                    message=(
                        "Habitat restoration action is "
                        "recommended for this location."
                    ),
                    source="Habitat restoration engine",
                    location=item.get("location"),
                )
            )

    except Exception:
        pass

    return alerts


# ============================================================
# BUILD ALL ALERTS
# ============================================================

async def get_all_alerts():

    results = await __import__(
        "asyncio"
    ).gather(

        build_endangered_species_alerts(),

        build_population_decline_alerts(),

        build_habitat_degradation_alerts(),

        build_monitoring_device_alerts(),

        build_conservation_notifications(),

        return_exceptions=True,
    )

    alerts = []

    for result in results:

        if isinstance(result, Exception):
            continue

        alerts.extend(result)

    alerts.sort(
        key=lambda alert: (
            -severity_rank(
                alert.get("severity")
            ),
            alert.get(
                "category",
                ""
            ),
            alert.get(
                "title",
                ""
            ),
        )
    )

    for index, alert in enumerate(
        alerts,
        start=1,
    ):
        alert["id"] = str(index)

    return alerts


# ============================================================
# ALERT SUMMARY
# ============================================================

async def get_alert_summary():

    alerts = await get_all_alerts()

    summary = {

        "total": len(alerts),

        "critical": 0,

        "high": 0,

        "medium": 0,

        "low": 0,

        "by_category": {

            "endangered_species": 0,

            "population_decline": 0,

            "habitat_degradation": 0,

            "monitoring_device": 0,

            "conservation_notification": 0,

        },

    }


    for alert in alerts:

        severity = str(
            alert.get(
                "severity",
                ""
            )
        ).lower()

        category = alert.get(
            "category"
        )

        if severity in summary:
            summary[severity] += 1

        if category in summary["by_category"]:
            summary["by_category"][category] += 1

    return summary