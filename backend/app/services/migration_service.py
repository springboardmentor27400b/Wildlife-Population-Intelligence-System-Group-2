def analyze_migration(species: str, previous_location: str, current_location: str):

    if previous_location == current_location:

        migration_status = "No Migration"

        distance = 0

        pattern = "Resident"

    else:

        migration_status = "Migration Detected"

        # Demo distance
        distance = 45

        pattern = f"{previous_location} → {current_location}"

    return {

        "species": species,

        "previous_location": previous_location,

        "current_location": current_location,

        "migration_status": migration_status,

        "migration_pattern": pattern,

        "estimated_distance_km": distance

    }