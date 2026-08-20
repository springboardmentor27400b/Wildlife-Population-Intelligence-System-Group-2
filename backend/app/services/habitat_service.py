from app.models.habitat import Habitat


# ============================================================
# HABITAT CLASSIFICATION
# ============================================================

async def classify_habitat(
    location: str,
    habitat_type: str,
    area_km2: float | None = None,
    protected_area: bool = False,
    temperature: float | None = None,
    rainfall: float | None = None,
    vegetation_health: float | None = None,
    water_quality: float | None = None,
):
    """
    Classify and store habitat information.

    Currently uses rule-based habitat classification.
    """

    # ========================================================
    # NORMALIZE INPUT
    # ========================================================

    location = location.strip()

    requested_type = (
        habitat_type
        .strip()
        .lower()
    )

    # ========================================================
    # HABITAT CLASSIFICATION RULES
    # ========================================================

    habitat_mapping = {

        "forest": "Forest",

        "tropical forest": "Tropical Forest",

        "tropical deciduous forest":
            "Tropical Deciduous Forest",

        "grassland": "Grassland",

        "wetland": "Wetland",

        "savanna": "Savanna",

        "mountain": "Mountain",

        "desert": "Desert",

        "urban": "Urban",

        "agricultural": "Agricultural",

    }

    classified_habitat = habitat_mapping.get(

        requested_type,

        habitat_type.strip().title()

    )

    # ========================================================
    # CONFIDENCE
    # ========================================================

    if requested_type in habitat_mapping:

        confidence = 0.95

    else:

        confidence = 0.70

    # ========================================================
    # CREATE HABITAT RECORD
    # ========================================================

    habitat = Habitat(

        location=location,

        habitat_type=classified_habitat,

        area_km2=area_km2,

        protected_area=protected_area,

        temperature=temperature,

        rainfall=rainfall,

        vegetation_health=vegetation_health,

        water_quality=water_quality,

        classification_confidence=confidence,

        classification_method=(
            "Rule-Based Classification"
        ),

    )

    # ========================================================
    # SAVE TO DATABASE
    # ========================================================

    await habitat.insert()

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "id": str(habitat.id),

        "location": habitat.location,

        "habitat_type": (
            habitat.habitat_type
        ),

        "area_km2": habitat.area_km2,

        "protected_area": (
            habitat.protected_area
        ),

        "confidence": (
            habitat.classification_confidence
        ),

        "classification_method": (
            habitat.classification_method
        ),

    }


# ============================================================
# GET HABITAT CLASSIFICATIONS
# ============================================================

async def get_habitat_classifications():

    records = await (
        Habitat
        .find_all()
        .to_list()
    )

    return {

        "total_locations": len(
            records
        ),

        "habitats": [

            {

                "id": str(record.id),

                "location": (
                    record.location
                ),

                "habitat_type": (
                    record.habitat_type
                ),

                "area_km2": (
                    record.area_km2
                ),

                "protected_area": (
                    record.protected_area
                ),

                "confidence": (
                    record.classification_confidence
                ),

                "classification_method": (
                    record.classification_method
                ),

            }

            for record in records

        ],

    }

# ============================================================
# 8.2 HABITAT DEGRADATION DETECTION
# ============================================================

async def detect_habitat_degradation(
    location: str,
    temperature: float | None = None,
    rainfall: float | None = None,
    vegetation_health: float | None = None,
    water_quality: float | None = None,
    protected_area: bool = False,
):
    """
    Detect potential habitat degradation using environmental
    and habitat condition indicators.
    """

    degradation_score = 0.0
    degradation_factors = []
    recommendations = []

    # ========================================================
    # VEGETATION HEALTH
    # ========================================================

    if vegetation_health is not None:

        if vegetation_health < 30:

            degradation_score += 35

            degradation_factors.append(
                "Severe vegetation degradation"
            )

            recommendations.append(
                "Immediate vegetation restoration required"
            )

        elif vegetation_health < 50:

            degradation_score += 25

            degradation_factors.append(
                "Poor vegetation health"
            )

            recommendations.append(
                "Implement vegetation restoration measures"
            )

        elif vegetation_health < 70:

            degradation_score += 15

            degradation_factors.append(
                "Moderate vegetation degradation"
            )

            recommendations.append(
                "Increase vegetation monitoring"
            )

    # ========================================================
    # WATER QUALITY
    # ========================================================

    if water_quality is not None:

        if water_quality < 30:

            degradation_score += 30

            degradation_factors.append(
                "Severe water quality degradation"
            )

            recommendations.append(
                "Immediate water quality management required"
            )

        elif water_quality < 50:

            degradation_score += 20

            degradation_factors.append(
                "Poor water quality"
            )

            recommendations.append(
                "Implement water pollution control measures"
            )

        elif water_quality < 70:

            degradation_score += 10

            degradation_factors.append(
                "Moderate water quality concerns"
            )

            recommendations.append(
                "Increase water quality monitoring"
            )

    # ========================================================
    # RAINFALL
    # ========================================================

    if rainfall is not None:

        if rainfall < 500:

            degradation_score += 20

            degradation_factors.append(
                "Low rainfall conditions"
            )

            recommendations.append(
                "Monitor drought conditions and water availability"
            )

        elif rainfall > 3000:

            degradation_score += 10

            degradation_factors.append(
                "Excessive rainfall conditions"
            )

            recommendations.append(
                "Monitor flooding and soil erosion risks"
            )

    # ========================================================
    # TEMPERATURE
    # ========================================================

    if temperature is not None:

        if temperature > 40:

            degradation_score += 20

            degradation_factors.append(
                "Extreme high temperature"
            )

            recommendations.append(
                "Monitor heat stress and climate impacts"
            )

        elif temperature < 5:

            degradation_score += 10

            degradation_factors.append(
                "Extreme low temperature"
            )

            recommendations.append(
                "Monitor cold stress on wildlife and vegetation"
            )

    # ========================================================
    # PROTECTED AREA FACTOR
    # ========================================================

    if not protected_area:

        degradation_score += 10

        degradation_factors.append(
            "Habitat is outside a protected area"
        )

        recommendations.append(
            "Consider enhanced habitat protection measures"
        )

    # ========================================================
    # LIMIT SCORE
    # ========================================================

    degradation_score = min(
        degradation_score,
        100
    )

    # ========================================================
    # DETERMINE DEGRADATION LEVEL
    # ========================================================

    if degradation_score >= 70:

        degradation_level = "Severe Degradation"

    elif degradation_score >= 40:

        degradation_level = "High Degradation"

    elif degradation_score >= 20:

        degradation_level = "Moderate Degradation"

    elif degradation_score > 0:

        degradation_level = "Low Degradation"

    else:

        degradation_level = "Healthy"

    # ========================================================
    # NO DEGRADATION FACTORS
    # ========================================================

    if not degradation_factors:

        degradation_factors.append(
            "No significant degradation indicators detected"
        )

        recommendations.append(
            "Continue regular habitat monitoring"
        )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "location": location,

        "degradation_score": round(
            degradation_score,
            2
        ),

        "degradation_level": degradation_level,

        "degradation_detected": (
            degradation_score > 0
        ),

        "degradation_factors": (
            degradation_factors
        ),

        "recommendations": (
            recommendations
        ),

    }

# ============================================================
# 8.3 VEGETATION ANALYSIS
# ============================================================

async def analyze_vegetation(
    location: str,
    vegetation_health: float | None = None,
    rainfall: float | None = None,
    temperature: float | None = None,
):
    """
    Analyze vegetation health using available environmental
    indicators.
    """

    # ========================================================
    # HANDLE MISSING VEGETATION DATA
    # ========================================================

    if vegetation_health is None:

        return {
            "location": location,
            "vegetation_health_score": None,
            "vegetation_condition": "Insufficient Data",
            "vegetation_status": "Not Evaluated",
            "degradation_risk": "Unknown",
            "factors": [],
            "recommendations": [
                "Vegetation health data is required for analysis"
            ],
        }

    # ========================================================
    # VALIDATE SCORE
    # ========================================================

    vegetation_health = max(
        0,
        min(
            vegetation_health,
            100
        )
    )

    # ========================================================
    # DETERMINE VEGETATION CONDITION
    # ========================================================

    if vegetation_health >= 80:

        vegetation_condition = "Excellent"

        vegetation_status = "Healthy"

        degradation_risk = "Low"

    elif vegetation_health >= 60:

        vegetation_condition = "Good"

        vegetation_status = "Healthy"

        degradation_risk = "Low"

    elif vegetation_health >= 40:

        vegetation_condition = "Moderate"

        vegetation_status = "Moderate Concern"

        degradation_risk = "Medium"

    elif vegetation_health >= 20:

        vegetation_condition = "Poor"

        vegetation_status = "Vulnerable"

        degradation_risk = "High"

    else:

        vegetation_condition = "Critical"

        vegetation_status = "Critical"

        degradation_risk = "Very High"

    # ========================================================
    # IDENTIFY FACTORS
    # ========================================================

    factors = []

    recommendations = []

    # --------------------------------------------------------
    # VEGETATION HEALTH
    # --------------------------------------------------------

    if vegetation_health < 40:

        factors.append(
            "Low vegetation health"
        )

        recommendations.append(
            "Implement vegetation restoration programs"
        )

    elif vegetation_health < 60:

        factors.append(
            "Moderate vegetation health"
        )

        recommendations.append(
            "Increase vegetation monitoring"
        )

    else:

        factors.append(
            "Healthy vegetation cover"
        )

    # --------------------------------------------------------
    # RAINFALL IMPACT
    # --------------------------------------------------------

    if rainfall is not None:

        if rainfall < 500:

            factors.append(
                "Low rainfall may be affecting vegetation growth"
            )

            recommendations.append(
                "Monitor drought conditions and water availability"
            )

        elif rainfall > 3000:

            factors.append(
                "Excessive rainfall may affect vegetation stability"
            )

            recommendations.append(
                "Monitor flooding and soil erosion"
            )

        else:

            factors.append(
                "Rainfall conditions are within a suitable range"
            )

    # --------------------------------------------------------
    # TEMPERATURE IMPACT
    # --------------------------------------------------------

    if temperature is not None:

        if temperature > 40:

            factors.append(
                "High temperature may cause vegetation stress"
            )

            recommendations.append(
                "Monitor heat stress and water availability"
            )

        elif temperature < 5:

            factors.append(
                "Low temperature may affect vegetation growth"
            )

            recommendations.append(
                "Monitor cold-related vegetation stress"
            )

        else:

            factors.append(
                "Temperature conditions are suitable"
            )

    # ========================================================
    # GENERAL RECOMMENDATION
    # ========================================================

    if vegetation_health >= 60:

        recommendations.append(
            "Continue regular vegetation monitoring"
        )

    # ========================================================
    # RETURN ANALYSIS
    # ========================================================

    return {

        "location": location,

        "vegetation_health_score": round(
            vegetation_health,
            2
        ),

        "vegetation_condition": (
            vegetation_condition
        ),

        "vegetation_status": (
            vegetation_status
        ),

        "degradation_risk": (
            degradation_risk
        ),

        "factors": factors,

        "recommendations": recommendations,

    }

# ============================================================
# 8.4 ENVIRONMENTAL CONDITION MONITORING
# ============================================================

async def monitor_environmental_conditions(
    location: str,
    temperature: float | None = None,
    rainfall: float | None = None,
    vegetation_health: float | None = None,
    water_quality: float | None = None,
):
    """
    Monitor environmental conditions using available
    temperature, rainfall, vegetation, and water quality data.
    """

    factors = {}
    risks = []
    recommendations = []

    scores = []

    # ========================================================
    # TEMPERATURE ANALYSIS
    # ========================================================

    if temperature is not None:

        if 15 <= temperature <= 35:

            temperature_status = "Normal"
            temperature_score = 100

        elif 10 <= temperature < 15 or 35 < temperature <= 40:

            temperature_status = "Moderate Concern"
            temperature_score = 70

            risks.append(
                "Temperature is outside the optimal range"
            )

            recommendations.append(
                "Monitor temperature-related wildlife stress"
            )

        else:

            temperature_status = "Critical"

            temperature_score = 30

            risks.append(
                "Extreme temperature conditions detected"
            )

            recommendations.append(
                "Implement measures to reduce climate-related stress"
            )

        factors["temperature"] = {
            "value": temperature,
            "status": temperature_status,
            "score": temperature_score,
        }

        scores.append(temperature_score)

    # ========================================================
    # RAINFALL ANALYSIS
    # ========================================================

    if rainfall is not None:

        if 500 <= rainfall <= 2500:

            rainfall_status = "Normal"
            rainfall_score = 100

        elif 300 <= rainfall < 500 or 2500 < rainfall <= 3000:

            rainfall_status = "Moderate Concern"
            rainfall_score = 70

            risks.append(
                "Rainfall conditions may affect habitat stability"
            )

            recommendations.append(
                "Monitor water availability and soil conditions"
            )

        else:

            rainfall_status = "Critical"
            rainfall_score = 30

            risks.append(
                "Extreme rainfall conditions detected"
            )

            recommendations.append(
                "Monitor drought, flooding, or water stress conditions"
            )

        factors["rainfall"] = {
            "value": rainfall,
            "status": rainfall_status,
            "score": rainfall_score,
        }

        scores.append(rainfall_score)

    # ========================================================
    # VEGETATION ANALYSIS
    # ========================================================

    if vegetation_health is not None:

        vegetation_health = max(
            0,
            min(
                vegetation_health,
                100
            )
        )

        if vegetation_health >= 70:

            vegetation_status = "Healthy"
            vegetation_score = vegetation_health

        elif vegetation_health >= 40:

            vegetation_status = "Moderate Concern"
            vegetation_score = vegetation_health

            risks.append(
                "Vegetation health is below optimal levels"
            )

            recommendations.append(
                "Increase vegetation monitoring"
            )

        else:

            vegetation_status = "Critical"
            vegetation_score = vegetation_health

            risks.append(
                "Poor vegetation health detected"
            )

            recommendations.append(
                "Implement vegetation restoration measures"
            )

        factors["vegetation"] = {
            "value": vegetation_health,
            "status": vegetation_status,
            "score": round(
                vegetation_score,
                2
            ),
        }

        scores.append(vegetation_score)

    # ========================================================
    # WATER QUALITY ANALYSIS
    # ========================================================

    if water_quality is not None:

        water_quality = max(
            0,
            min(
                water_quality,
                100
            )
        )

        if water_quality >= 70:

            water_status = "Good"
            water_score = water_quality

        elif water_quality >= 40:

            water_status = "Moderate Concern"
            water_score = water_quality

            risks.append(
                "Water quality requires monitoring"
            )

            recommendations.append(
                "Increase water quality monitoring"
            )

        else:

            water_status = "Critical"
            water_score = water_quality

            risks.append(
                "Poor water quality detected"
            )

            recommendations.append(
                "Implement immediate water quality management"
            )

        factors["water_quality"] = {
            "value": water_quality,
            "status": water_status,
            "score": round(
                water_score,
                2
            ),
        }

        scores.append(water_score)

    # ========================================================
    # CALCULATE OVERALL ENVIRONMENTAL SCORE
    # ========================================================

    if scores:

        environmental_score = (
            sum(scores) / len(scores)
        )

        environmental_score = round(
            environmental_score,
            2
        )

    else:

        environmental_score = None

    # ========================================================
    # DETERMINE OVERALL CONDITION
    # ========================================================

    if environmental_score is None:

        environmental_condition = "Insufficient Data"

    elif environmental_score >= 80:

        environmental_condition = "Excellent"

    elif environmental_score >= 60:

        environmental_condition = "Good"

    elif environmental_score >= 40:

        environmental_condition = "Moderate Concern"

    else:

        environmental_condition = "Critical"

    # ========================================================
    # NO RISKS DETECTED
    # ========================================================

    if not risks:

        risks.append(
            "No significant environmental risks detected"
        )

    # ========================================================
    # NO RECOMMENDATIONS
    # ========================================================

    if not recommendations:

        recommendations.append(
            "Continue regular environmental monitoring"
        )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "location": location,

        "environmental_score": (
            environmental_score
        ),

        "environmental_condition": (
            environmental_condition
        ),

        "factors": factors,

        "risks": risks,

        "recommendations": recommendations,

    }

# ============================================================
# 8.5 HABITAT SUITABILITY PREDICTION
# ============================================================

async def predict_habitat_suitability():
    """
    Predict habitat suitability using environmental and
    habitat-related factors.

    This is a rule-based weighted suitability model.
    """

    # ========================================================
    # GET ALL HABITAT RECORDS
    # ========================================================

    habitats = await Habitat.find_all().to_list()

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not habitats:
        return {
            "total_locations_analyzed": 0,
            "suitability_analysis": [],
        }

    suitability_analysis = []

    # ========================================================
    # ANALYZE EACH HABITAT
    # ========================================================

    for habitat in habitats:

        # ----------------------------------------------------
        # GET VALUES SAFELY
        # ----------------------------------------------------

        vegetation_health = (
            habitat.vegetation_health
            if habitat.vegetation_health is not None
            else 50
        )

        water_quality = (
            habitat.water_quality
            if habitat.water_quality is not None
            else 50
        )

        temperature = (
            habitat.temperature
            if habitat.temperature is not None
            else 25
        )

        rainfall = (
            habitat.rainfall
            if habitat.rainfall is not None
            else 1000
        )

        protected_area = (
            habitat.protected_area
            if habitat.protected_area is not None
            else False
        )

        area_km2 = (
            habitat.area_km2
            if habitat.area_km2 is not None
            else 0
        )

        # ====================================================
        # TEMPERATURE SUITABILITY
        # ====================================================

        if 20 <= temperature <= 30:

            temperature_score = 100

        elif 15 <= temperature < 20 or 30 < temperature <= 35:

            temperature_score = 70

        else:

            temperature_score = 40

        # ====================================================
        # RAINFALL SUITABILITY
        # ====================================================

        if 800 <= rainfall <= 2000:

            rainfall_score = 100

        elif 500 <= rainfall < 800 or 2000 < rainfall <= 2500:

            rainfall_score = 70

        else:

            rainfall_score = 40

        # ====================================================
        # PROTECTED AREA SCORE
        # ====================================================

        protected_area_score = (
            100
            if protected_area
            else 50
        )

        # ====================================================
        # AREA SCORE
        # ====================================================

        if area_km2 >= 100:

            area_score = 100

        elif area_km2 >= 50:

            area_score = 80

        elif area_km2 >= 10:

            area_score = 60

        else:

            area_score = 40

        # ====================================================
        # WEIGHTED SUITABILITY SCORE
        # ====================================================

        suitability_score = (

            vegetation_health * 0.30

            +

            water_quality * 0.25

            +

            temperature_score * 0.15

            +

            rainfall_score * 0.15

            +

            protected_area_score * 0.10

            +

            area_score * 0.05

        )

        suitability_score = round(
            suitability_score,
            2
        )

        # ====================================================
        # CLASSIFY SUITABILITY
        # ====================================================

        if suitability_score >= 80:

            suitability = "Highly Suitable"

            recommendation = (
                "Habitat conditions are highly favorable "
                "for wildlife and biodiversity."
            )

        elif suitability_score >= 60:

            suitability = "Suitable"

            recommendation = (
                "Habitat conditions are generally suitable "
                "for wildlife, with some areas for improvement."
            )

        elif suitability_score >= 40:

            suitability = "Moderately Suitable"

            recommendation = (
                "Habitat conditions require monitoring "
                "and improvement to support wildlife."
            )

        else:

            suitability = "Unsuitable"

            recommendation = (
                "Habitat conditions are poor and require "
                "immediate conservation intervention."
            )

        # ====================================================
        # ADD RESULT
        # ====================================================

        suitability_analysis.append({

            "location": habitat.location,

            "habitat_type": habitat.habitat_type,

            "suitability_score": suitability_score,

            "suitability": suitability,

            "factors": {

                "vegetation_health":
                    vegetation_health,

                "water_quality":
                    water_quality,

                "temperature":
                    temperature,

                "rainfall":
                    rainfall,

                "protected_area":
                    protected_area,

                "area_km2":
                    area_km2,

            },

            "recommendation":
                recommendation,

        })

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_locations_analyzed":
            len(suitability_analysis),

        "suitability_analysis":
            suitability_analysis,

    }