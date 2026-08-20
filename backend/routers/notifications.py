from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

import models
from database import get_db
from auth import get_current_user


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications & Alerts"]
)


# =========================================================
# NOTIFICATION TYPES
# =========================================================

ENDANGERED_SPECIES = "ENDANGERED_SPECIES"
POPULATION_DECLINE = "POPULATION_DECLINE"
HABITAT_DEGRADATION = "HABITAT_DEGRADATION"
MONITORING_DEVICE = "MONITORING_DEVICE"
CONSERVATION = "CONSERVATION"


# =========================================================
# SEVERITY LEVELS
# =========================================================

INFO = "INFO"
MEDIUM = "MEDIUM"
HIGH = "HIGH"
CRITICAL = "CRITICAL"


# =========================================================
# HELPER
# =========================================================

def notification_to_dict(
    notification: models.Notification
):
    return {
        "id": notification.id,

        "notification_type":
            notification.notification_type,

        "severity":
            notification.severity,

        "title":
            notification.title,

        "message":
            notification.message,

        "species_id":
            notification.species_id,

        "habitat":
            notification.habitat,

        "survey_id":
            notification.survey_id,

        "is_read":
            notification.is_read,

        "created_at":
            notification.created_at,
    }


# =========================================================
# CREATE NOTIFICATION HELPER
# =========================================================

def create_notification(
    db: Session,
    notification_type: str,
    severity: str,
    title: str,
    message: str,
    user_id=None,
    species_id=None,
    habitat=None,
    survey_id=None,
):
    notification = models.Notification(
        user_id=user_id,

        notification_type=
            notification_type,

        severity=
            severity,

        title=
            title,

        message=
            message,

        species_id=
            species_id,

        habitat=
            habitat,

        survey_id=
            survey_id,

        is_read=False,
    )

    db.add(notification)

    return notification


# =========================================================
# GET ALL NOTIFICATIONS
# =========================================================

@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    ),
):
    notifications = (
        db.query(models.Notification)
        .filter(
            or_(
                models.Notification.user_id
                == current_user.id,

                models.Notification.user_id
                .is_(None)
            )
        )
        .order_by(
            desc(
                models.Notification.created_at
            )
        )
        .all()
    )

    unread_count = sum(
        1
        for notification in notifications
        if not notification.is_read
    )

    return {
        "total":
            len(notifications),

        "unread":
            unread_count,

        "notifications": [
            notification_to_dict(
                notification
            )
            for notification in notifications
        ],
    }


# =========================================================
# GET UNREAD COUNT
# =========================================================

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    ),
):
    unread_count = (
        db.query(
            models.Notification
        )
        .filter(
            or_(
                models.Notification.user_id
                == current_user.id,

                models.Notification.user_id
                .is_(None)
            )
        )
        .filter(
            models.Notification.is_read
            == False
        )
        .count()
    )

    return {
        "unread":
            unread_count
    }


# =========================================================
# GET SINGLE NOTIFICATION
# =========================================================

@router.get("/{notification_id}")
def get_single_notification(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    notification = (
        db.query(
            models.Notification
        )
        .filter(
            models.Notification.id
            == notification_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    if (
        notification.user_id is not None
        and notification.user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    return notification_to_dict(
        notification
    )


# =========================================================
# MARK SINGLE NOTIFICATION AS READ
# =========================================================

@router.patch(
    "/{notification_id}/read"
)
def mark_notification_read(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    notification = (
        db.query(
            models.Notification
        )
        .filter(
            models.Notification.id
            == notification_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    if (
        notification.user_id is not None
        and notification.user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    notification.is_read = True

    db.commit()

    db.refresh(notification)

    return {
        "message":
            "Notification marked as read",

        "notification":
            notification_to_dict(
                notification
            ),
    }


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    notifications = (
        db.query(
            models.Notification
        )
        .filter(
            or_(
                models.Notification.user_id
                == current_user.id,

                models.Notification.user_id
                .is_(None)
            )
        )
        .filter(
            models.Notification.is_read
            == False
        )
        .all()
    )

    updated_count = len(
        notifications
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message":
            "All notifications marked as read",

        "updated":
            updated_count,
    }


# =========================================================
# GENERATE ENDANGERED SPECIES ALERTS
# =========================================================

@router.post(
    "/generate/endangered"
)
def generate_endangered_species_alerts(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    endangered_statuses = [
        "Endangered",
        "Critically Endangered",
        "Critically_ Endangered",
        "CR",
        "EN",
    ]

    species_list = (
        db.query(models.Species)
        .filter(
            models.Species
            .conservation_status
            .in_(endangered_statuses)
        )
        .all()
    )

    created_count = 0

    for species in species_list:

        existing = (
            db.query(
                models.Notification
            )
            .filter(
                models.Notification
                .notification_type
                == ENDANGERED_SPECIES
            )
            .filter(
                models.Notification
                .species_id
                == species.id
            )
            .filter(
                models.Notification
                .is_read
                == False
            )
            .first()
        )

        if existing:
            continue

        create_notification(
            db=db,

            notification_type=
                ENDANGERED_SPECIES,

            severity=
                CRITICAL,

            title=
                "Endangered Species Alert",

            message=(
                f"{species.species_name} "
                f"is classified as "
                f"{species.conservation_status}. "
                f"Immediate conservation "
                f"attention is recommended."
            ),

            species_id=
                species.id,

            habitat=
                species.habitat,
        )

        created_count += 1

    db.commit()

    return {
        "message":
            "Endangered species alerts generated",

        "created":
            created_count,
    }


# =========================================================
# GENERATE POPULATION DECLINE ALERTS
# =========================================================

@router.post(
    "/generate/population-decline"
)
def generate_population_decline_alerts(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    species_list = (
        db.query(models.Species)
        .all()
    )

    created_count = 0

    for species in species_list:

        observations = (
            db.query(
                models.Observation
            )
            .filter(
                models.Observation
                .species_id
                == species.id
            )
            .filter(
                models.Observation
                .population_count
                .isnot(None)
            )
            .order_by(
                models.Observation
                .observation_date
                .desc()
            )
            .limit(2)
            .all()
        )

        if len(observations) < 2:
            continue

        latest_count = (
            observations[0]
            .population_count
            or 0
        )

        previous_count = (
            observations[1]
            .population_count
            or 0
        )

        if previous_count <= 0:
            continue

        decline_percentage = (
            (
                previous_count
                - latest_count
            )
            / previous_count
        ) * 100

        if decline_percentage < 20:
            continue

        severity = HIGH

        if decline_percentage >= 50:
            severity = CRITICAL

        existing = (
            db.query(
                models.Notification
            )
            .filter(
                models.Notification
                .notification_type
                == POPULATION_DECLINE
            )
            .filter(
                models.Notification
                .species_id
                == species.id
            )
            .filter(
                models.Notification
                .is_read
                == False
            )
            .first()
        )

        if existing:
            continue

        create_notification(
            db=db,

            notification_type=
                POPULATION_DECLINE,

            severity=
                severity,

            title=
                "Population Decline Alert",

            message=(
                f"{species.species_name} "
                f"population has declined by "
                f"{decline_percentage:.1f}% "
                f"between the two latest "
                f"observations."
            ),

            species_id=
                species.id,

            habitat=
                species.habitat,
        )

        created_count += 1

    db.commit()

    return {
        "message":
            "Population decline alerts generated",

        "created":
            created_count,
    }


# =========================================================
# GENERATE HABITAT DEGRADATION ALERTS
# =========================================================

@router.post(
    "/generate/habitat-degradation"
)
def generate_habitat_degradation_alerts(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    habitats = (
        db.query(
            models.Species.habitat
        )
        .filter(
            models.Species.habitat
            .isnot(None)
        )
        .distinct()
        .all()
    )

    created_count = 0

    for habitat_row in habitats:

        habitat = habitat_row[0]

        if not habitat:
            continue

        species_count = (
            db.query(models.Species)
            .filter(
                models.Species.habitat
                == habitat
            )
            .count()
        )

        observation_count = (
            db.query(
                models.Observation
            )
            .join(
                models.Species,
                models.Species.id
                ==
                models.Observation.species_id
            )
            .filter(
                models.Species.habitat
                == habitat
            )
            .count()
        )

        if species_count == 0:
            continue

        # This is a monitoring warning.
        # It should later be replaced by
        # the actual habitat health score.

        if observation_count >= 2:
            continue

        existing = (
            db.query(
                models.Notification
            )
            .filter(
                models.Notification
                .notification_type
                == HABITAT_DEGRADATION
            )
            .filter(
                models.Notification
                .habitat
                == habitat
            )
            .filter(
                models.Notification
                .is_read
                == False
            )
            .first()
        )

        if existing:
            continue

        create_notification(
            db=db,

            notification_type=
                HABITAT_DEGRADATION,

            severity=
                MEDIUM,

            title=
                "Habitat Monitoring Alert",

            message=(
                f"Habitat '{habitat}' "
                f"has limited recent "
                f"monitoring data. "
                f"Habitat condition "
                f"should be reviewed."
            ),

            habitat=
                habitat,
        )

        created_count += 1

    db.commit()

    return {
        "message":
            "Habitat degradation alerts generated",

        "created":
            created_count,
    }


# =========================================================
# GENERATE MONITORING DEVICE ALERTS
# =========================================================

@router.post(
    "/generate/device"
)
def generate_monitoring_device_alerts(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    surveys = (
        db.query(models.Survey)
        .filter(
            models.Survey
            .monitoring_device
            .isnot(None)
        )
        .all()
    )

    created_count = 0

    for survey in surveys:

        status = (
            str(
                survey.status
                or ""
            )
            .strip()
            .lower()
        )

        # These statuses don't require
        # a device warning.

        if status in [
            "ongoing",
            "active",
            "completed",
        ]:
            continue

        existing = (
            db.query(
                models.Notification
            )
            .filter(
                models.Notification
                .notification_type
                == MONITORING_DEVICE
            )
            .filter(
                models.Notification
                .survey_id
                == survey.id
            )
            .filter(
                models.Notification
                .is_read
                == False
            )
            .first()
        )

        if existing:
            continue

        create_notification(
            db=db,

            notification_type=
                MONITORING_DEVICE,

            severity=
                HIGH,

            title=
                "Monitoring Device Alert",

            message=(
                f"Monitoring device "
                f"'{survey.monitoring_device}' "
                f"associated with survey "
                f"'{survey.title}' "
                f"requires attention."
            ),

            survey_id=
                survey.id,
        )

        created_count += 1

    db.commit()

    return {
        "message":
            "Monitoring device alerts generated",

        "created":
            created_count,
    }


# =========================================================
# GENERATE CONSERVATION NOTIFICATIONS
# =========================================================

@router.post(
    "/generate/conservation"
)
def generate_conservation_notifications(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    species_list = (
        db.query(models.Species)
        .all()
    )

    created_count = 0

    priority_statuses = [
        "endangered",
        "critically endangered",
        "vulnerable",
        "critical",
        "cr",
        "en",
        "vu",
    ]

    for species in species_list:

        status = (
            str(
                species.conservation_status
                or ""
            )
            .strip()
            .lower()
        )

        if status not in priority_statuses:
            continue

        existing = (
            db.query(
                models.Notification
            )
            .filter(
                models.Notification
                .notification_type
                == CONSERVATION
            )
            .filter(
                models.Notification
                .species_id
                == species.id
            )
            .filter(
                models.Notification
                .is_read
                == False
            )
            .first()
        )

        if existing:
            continue

        create_notification(
            db=db,

            notification_type=
                CONSERVATION,

            severity=
                MEDIUM,

            title=
                "Conservation Priority",

            message=(
                f"{species.species_name} "
                f"requires conservation "
                f"attention because its "
                f"current status is "
                f"{species.conservation_status}."
            ),

            species_id=
                species.id,

            habitat=
                species.habitat,
        )

        created_count += 1

    db.commit()

    return {
        "message":
            "Conservation notifications generated",

        "created":
            created_count,
    }


# =========================================================
# GENERATE ALL ALERTS
# =========================================================

@router.post(
    "/generate-all"
)
def generate_all_alerts(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):
    results = {}

    # -----------------------------------------------------
    # ENDANGERED
    # -----------------------------------------------------

    endangered_result = (
        generate_endangered_species_alerts(
            db,
            current_user
        )
    )

    results[
        "endangered_species"
    ] = endangered_result[
        "created"
    ]

    # -----------------------------------------------------
    # POPULATION DECLINE
    # -----------------------------------------------------

    population_result = (
        generate_population_decline_alerts(
            db,
            current_user
        )
    )

    results[
        "population_decline"
    ] = population_result[
        "created"
    ]

    # -----------------------------------------------------
    # HABITAT
    # -----------------------------------------------------

    habitat_result = (
        generate_habitat_degradation_alerts(
            db,
            current_user
        )
    )

    results[
        "habitat_degradation"
    ] = habitat_result[
        "created"
    ]

    # -----------------------------------------------------
    # DEVICE
    # -----------------------------------------------------

    device_result = (
        generate_monitoring_device_alerts(
            db,
            current_user
        )
    )

    results[
        "monitoring_device"
    ] = device_result[
        "created"
    ]

    # -----------------------------------------------------
    # CONSERVATION
    # -----------------------------------------------------

    conservation_result = (
        generate_conservation_notifications(
            db,
            current_user
        )
    )

    results[
        "conservation"
    ] = conservation_result[
        "created"
    ]

    return {
        "message":
            "All notification checks completed",

        "results":
            results,

        "total_created":
            sum(results.values()),
    }