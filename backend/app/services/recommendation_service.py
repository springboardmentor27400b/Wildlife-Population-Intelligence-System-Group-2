from typing import Dict, Any, List

class ConservationRecommendationService:
    def get_recommendations(self) -> Dict[str, List[str]]:
        """
        Retrieves action recommendations addressing environmental threat categories.
        """
        return {
            "illegal_hunting": [
                "Establish anti-poaching patrol checkpoints near hot-spot coordinate coordinates.",
                "Deploy wireless acoustic sensor lines to detect gunshot audio events.",
                "Enforce stiffer penalties for tracking or catching protected species."
            ],
            "habitat_loss": [
                "Restore degraded pasture areas into original forest ecosystems.",
                "Designate continuous wildlife corridors connecting isolated national park territories.",
                "Implement conservation easements on private land borders."
            ],
            "deforestation": [
                "Impose strict quotas and licensing rules on logging operations.",
                "Enforce satellite-based radar logging checks to detect illegal canopy clearances.",
                "Implement community-led tree planting campaigns in buffer zones."
            ],
            "pollution": [
                "Install runoff filter gates in rivers feeding national wetland reserves.",
                "Regulate fertilizer usage in farms adjacent to primary wildlife watering holes.",
                "Initiate cleanup drives to clear plastic wastes from habitat sites."
            ],
            "climate_change": [
                "Create artificial shaded canopies and waterholes to assist migration during heat waves.",
                "Facilitate assisted migration of slow-moving endangered species to cooler elevations.",
                "Establish seed bank repositories for native forest vegetation."
            ],
            "human_encroachment": [
                "Establish fence parameters to isolate agricultural crops from elephant migration lanes.",
                "Enforce strict zoning laws limiting tourist resort growth near sensitive habitats.",
                "Offer compensation funds to local farmers for crop damage caused by wildlife."
            ]
        }

recommendation_service = ConservationRecommendationService()
