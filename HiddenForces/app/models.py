"""
Pydantic data models for request and response payloads of the HiddenForces microservice.
"""

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

class Example(BaseModel):
    """
    Represents a single input-output example testcase.
    """
    input: str
    output: str

class Problem(BaseModel):
    """
    Represents a full coding problem description including limits, metadata, and samples.
    """
    _id: Optional[str] = None
    problemId: str
    timeLimit: Optional[float] = None
    memoryLimit: Optional[int] = None
    title: str
    description: str
    inputFormat: Optional[str] = ""
    outputFormat: Optional[str] = ""
    examples: List[Example] = Field(default_factory=list)
    sampleTests: List[Example] = Field(default_factory=list)
    hiddenTests: List[Dict] = Field(default_factory=list)
    note: Optional[str] = ""
    rating: Optional[int] = None
    source: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    platform: Literal["leetcode", "codeforces"] = "codeforces"

class Solution(BaseModel):
    """
    Represents the host's accepted reference solution to help generate output testcases.
    """
    code: str
    language: str

class RequestBody(BaseModel):
    """
    Incoming request payload definition containing problem description and solution.
    """
    problem: Problem
    solution: Optional[Solution] = None

class ResponseBody(BaseModel):
    """
    Outgoing response payload containing generated list of hidden input testcases.
    """
    hiddenTestCases: List[str]
