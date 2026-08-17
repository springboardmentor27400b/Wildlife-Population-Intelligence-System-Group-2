def calculate_population_trend(current_population: int, previous_population: int):

    if previous_population == 0:
        growth_rate = 100 if current_population > 0 else 0
    else:
        growth_rate = round(
            ((current_population - previous_population) / previous_population) * 100,
            2
        )

    if growth_rate > 5:
        trend = "Increasing"

    elif growth_rate < -5:
        trend = "Decreasing"

    else:
        trend = "Stable"

    return {
        "previous_population": previous_population,
        "current_population": current_population,
        "growth_rate": growth_rate,
        "trend": trend
    }