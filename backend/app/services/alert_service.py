def generate_alerts(metrics):

    alerts = []

    if metrics["growth_rate"] < 0:

        alerts.append({

            "type": "Danger",

            "message": "Population is decreasing."

        })

    elif metrics["growth_rate"] > 20:

        alerts.append({

            "type": "Success",

            "message": "Population is increasing."

        })

    if metrics["density"] > 15:

        alerts.append({

            "type": "Warning",

            "message": "High animal density detected."

        })

    if metrics["migration_status"] == "Migration Detected":

        alerts.append({

            "type": "Info",

            "message": "Species migration detected."

        })

    if metrics["species_richness"] > 10:

        alerts.append({

            "type": "Success",

            "message": "Excellent biodiversity."

        })

    return alerts