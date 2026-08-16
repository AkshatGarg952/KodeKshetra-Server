import logging

from fastapi import APIRouter, HTTPException

from .models import RequestBody, ResponseBody
from .test_generation_service import generate_hidden_test_cases

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def root():
    return {"message": "HiddenForces Test Generator API"}


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "HiddenForces",
        "message": "Service is running",
    }


@router.post("/generate-leetcode-tests", response_model=ResponseBody)
async def generate_leetcode_tests(request: RequestBody):
    try:
        hidden_test_cases = generate_hidden_test_cases(request.problem, "leetcode", request.solution)
        return ResponseBody(hiddenTestCases=hidden_test_cases)
    except Exception as error:
        logger.exception("Error generating LeetCode tests")
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/generate-codeforces-tests", response_model=ResponseBody)
async def generate_codeforces_tests(request: RequestBody):
    try:
        hidden_test_cases = generate_hidden_test_cases(request.problem, "codeforces", request.solution)
        return ResponseBody(hiddenTestCases=hidden_test_cases)
    except Exception as error:
        logger.exception("Error generating Codeforces tests")
        raise HTTPException(status_code=500, detail=str(error)) from error

