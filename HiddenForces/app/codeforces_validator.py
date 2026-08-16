"""
Codeforces test case validation using Gemini model guidelines.
"""

import json
import os

from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# Initialize connection to Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    timeout=30
)

def validate_codeforces_test_cases(test_cases: list, metadata: dict) -> list:
    """
    Validates a list of test cases against Codeforces format requirements and constraints.
    
    Args:
        test_cases (list): Raw list of generated test case strings.
        metadata (dict): Problem parameters including description, rating, constraints, inputs format.
        
    Returns:
        list: Filtered list of verified valid test cases.
    """
    prompt_template = PromptTemplate(
        input_variables=["test_cases", "input_format", "description"],
        template="""
You are a Codeforces automated judge validator. Your job is to REJECT any test case that violates constraints or formatting, even slightly. Be STRICT and UNFORGIVING like the actual Codeforces system.

PROBLEM SPECIFICATION:
Description: {description}
Input Format: {input_format}

TEST CASES TO VALIDATE:
{test_cases}

VALIDATION CHECKLIST (REJECT if ANY fails):

1. **CONSTRAINT VERIFICATION** (CRITICAL):
   - Extract EVERY numeric constraint from description (1 ≤ n ≤ X, 0 ≤ ai ≤ Y, etc.)
   - Parse each test case and verify ALL values are within bounds
   - Check aggregate constraints (e.g., "sum of n over all tests ≤ 2×10^5")
   - REJECT if any value violates constraints by even 1
   - Check implicit constraints (e.g., array length matches n, graph has m edges)
   - Verify modular arithmetic constraints if applicable

2. **FORMAT COMPLIANCE**:
   - Must match input format EXACTLY (spaces, newlines, order)
   - Correct number of lines/tokens per the format specification
   - No extra spaces, tabs, or characters
   - Numbers are integers/floats as required
   - Strings match expected character set (if specified)
   - Multi-test format: first line is t, then t test cases follow

3. **LOGICAL VALIDITY**:
   - For graphs: m edges means exactly m edge lines, valid node indices (1 to n or 0 to n-1)
   - For arrays: if n=5, must have exactly 5 elements
   - For trees: n-1 edges, connected, no cycles (if tree problem)
   - For strings: length matches specified n
   - For queries: query indices within valid range
   - For permutations: valid permutation of 1 to n

4. **CODEFORCES-SPECIFIC CHECKS**:
   - Multi-test format: verify t value is reasonable
   - Aggregate constraints: sum of all n values across tests
   - 1-indexed vs 0-indexed: match problem specification
   - Modular arithmetic: if MOD specified, values can be large
   - Interactive problems: proper query format

5. **QUALITY STANDARDS** (REJECT low-quality cases):
   - NOT trivially identical to sample inputs
   - NOT degenerate unless intentionally testing edge case
   - NOT impossible cases (e.g., asking for path in disconnected graph)
   - NOT ambiguous or malformed
   - NOT violating global constraints in multi-test

6. **PARSING SAFETY**:
   - Can be parsed without errors
   - No leading/trailing whitespace on lines (except intentional)
   - No empty lines within a test case (unless format allows)
   - Numbers don't have leading zeros (unless 0 itself)
   - Proper integer format (no decimals where integers expected)

7. **MATHEMATICAL VALIDITY**:
   - For prime problems: values in valid range
   - For GCD/LCM: positive integers
   - For modular arithmetic: proper value ranges
   - For combinatorics: n, k values make sense

VALIDATION PROCESS:
1. Parse each test case according to input format
2. Extract all values and check against constraints
3. Verify format matches specification exactly
4. Check logical consistency
5. Verify aggregate constraints for multi-test
6. If ALL checks pass → ACCEPT, else → REJECT

OUTPUT FORMAT:
Return ONLY a valid JSON array of strings.
Preserve exact formatting of accepted cases.
NO explanations, NO labels, NO markdown.
If a test case is invalid, silently drop it.

CRITICAL: When in doubt, REJECT. Better to have 7 perfect test cases than 10 with 1 invalid.

Validate now and return only valid cases:
        """
    )

    test_cases_str = "\n\n".join(test_cases)
    prompt = prompt_template.format(
        test_cases=test_cases_str,
        input_format=metadata.get('inputFormat', ''),
        description=metadata.get('description', '')
    )

    response = llm.invoke(prompt)
    raw_content = response.content.strip() if isinstance(response.content, str) else ""

    cleaned_content = raw_content.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(cleaned_content)
        if isinstance(parsed, list):
            return [str(item) for item in parsed if str(item).strip()]
        raise ValueError("Expected a JSON array from Gemini response")
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"validate_codeforces_test_cases: falling back to line-based parsing ({exc})")

    valid_test_cases = []
    current_case = []

    for line in raw_content.split("\n"):
        line = line.strip()
        if line in ["```json", "```", "[", "]", ""] and not current_case:
            continue

        if line == "" and current_case:
            valid_test_cases.append("\n".join(current_case))
            current_case = []
        elif line:
            current_case.append(line)

    if current_case:
        valid_test_cases.append("\n".join(current_case))

    return valid_test_cases
