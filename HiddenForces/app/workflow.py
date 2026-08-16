"""
Workflow graph management using LangGraph, chaining testcase generation and validation nodes.
"""

from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from .testcase_generator import generate_test_cases
from .testcase_validator import validate_test_cases

class State(TypedDict):
    """
    State definition for the LangGraph workflow process.
    """
    metadata: dict
    solution: Optional[dict]
    test_cases: list
    valid_test_cases: list

def generate_node(state: State) -> State:
    """
    LangGraph execution node: Calls testcase generator using model guidelines.
    """
    state['test_cases'] = generate_test_cases(state['metadata'], num_cases=10, solution=state.get('solution'))
    return state

def validate_node(state: State) -> State:
    """
    LangGraph execution node: Filters generated testcases using validator constraints.
    """
    state['valid_test_cases'] = validate_test_cases(state['test_cases'], state['metadata'])
    return state

def build_workflow():
    """
    Constructs and compiles the StateGraph workflow of generate -> validate.
    """
    workflow = StateGraph(State)
    workflow.add_node("generate", generate_node)
    workflow.add_node("validate", validate_node)

    workflow.set_entry_point("generate")
    workflow.add_edge("generate", "validate")
    workflow.add_edge("validate", END)

    return workflow.compile()