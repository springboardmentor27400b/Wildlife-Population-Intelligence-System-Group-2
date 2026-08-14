from typing import List, Dict
from pydantic import BaseModel

class RecommendationsResponse(BaseModel):
    illegal_hunting: List[str]
    habitat_loss: List[str]
    deforestation: List[str]
    pollution: List[str]
    climate_change: List[str]
    human_encroachment: List[str]
