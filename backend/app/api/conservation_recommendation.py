from fastapi import APIRouter, Depends, Request
from typing import Optional, Any
from fastapi.responses import StreamingResponse
from app.services.conservation_recommendation_service import ConservationRecommendationService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    filters = {"start_date": start_date, "end_date": end_date}
    return await ConservationRecommendationService.get_conservation_insights(filters)

@router.get("/export/{format_type}")
async def export_data(
    format_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    filters = {"start_date": start_date, "end_date": end_date}
    if format_type == "excel":
        content = await ConservationRecommendationService.export_excel(filters)
        return StreamingResponse(
            content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=conservation_recommendations.xlsx"}
        )
    elif format_type == "csv":
        content = await ConservationRecommendationService.export_csv(filters)
        return StreamingResponse(
            content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=conservation_recommendations.csv"}
        )
    elif format_type == "pdf":
        content = await ConservationRecommendationService.export_pdf(filters)
        return StreamingResponse(
            content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=conservation_recommendations.pdf"}
        )
    elif format_type == "json":
        content = await ConservationRecommendationService.export_json(filters)
        return StreamingResponse(
            content,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=conservation_recommendations.json"}
        )
    return {"error": "Invalid format"}

@router.get("/{species_name}")
async def get_species_recommendations(species_name: str, current_user: Any = Depends(get_current_user)):
    # Simple detail fallback
    data = await ConservationRecommendationService.get_conservation_insights({})
    recs = data.get("species_recommendations", [])
    for rec in recs:
        if rec.get("species_name", "").lower() == species_name.lower():
            return rec
    return {"error": "Species not found"}
