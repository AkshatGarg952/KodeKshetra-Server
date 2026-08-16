from .workflow import build_workflow


def build_generation_metadata(problem, platform: str) -> dict:
    metadata = problem.model_dump()
    metadata["examples"] = metadata.get("examples") or metadata.get("sampleTests") or []
    metadata["inputFormat"] = metadata.get("inputFormat") or ""
    metadata["outputFormat"] = metadata.get("outputFormat") or ""
    metadata["rating"] = metadata.get("rating") or 0
    metadata["platform"] = platform
    return metadata


def generate_hidden_test_cases(problem, platform: str, solution=None) -> list[str]:
    workflow = build_workflow()
    metadata = build_generation_metadata(problem, platform)
    result = workflow.invoke(
        {
            "metadata": metadata,
            "solution": solution.model_dump() if solution else None,
            "test_cases": [],
            "valid_test_cases": [],
        }
    )
    return result["valid_test_cases"]

