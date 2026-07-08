from fastapi import APIRouter

router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring"]
)


@router.post("/")
async def create_monitoring():
    return {
        "message": "Monitoring site created"
    }


@router.get("/")
async def get_sites():
    return [
        {
            "survey_id": "S001",
            "location": "Bandipur"
        }
    ]