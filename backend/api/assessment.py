from fastapi import APIRouter
from service.assessment import process_assessment

router = APIRouter()

@router.post("/assessment")
def submit_assessment(data: dict) -> dict:
    print("API Router: POST /api/assessment received request.")
    result = process_assessment(data)
    return result
