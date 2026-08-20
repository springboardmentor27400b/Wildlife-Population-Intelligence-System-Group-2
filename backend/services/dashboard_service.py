import crud


def get_static_dashboard_stats():
    return {
        "total_species": 128,
        "total_animals": 3245,
        "protected_forests": 24,
        "researchers": 18,
    }


def get_dashboard_stats(db):
    return crud.get_dashboard_stats(db)


def get_category_stats(db):
    return crud.species_by_category(db)


def get_recent_species(db):
    return crud.get_recent_species(db)


def get_status_stats(db):
    return crud.conservation_status_chart(db)


def get_population_stats(db):
    return crud.population_chart(db)
