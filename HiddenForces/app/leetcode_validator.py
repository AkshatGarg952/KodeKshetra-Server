"""
LeetCode test case validation using Gemini model guidelines.
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

def validate_leetcode_test_cases(test_cases: list, metadata: dict) -> list:
    """
    Validates a list of test cases against LeetCode format requirements and constraints.
    
    Args:
        test_cases (list): Raw list of generated test case strings.
        metadata (dict): Problem parameters including description, constraints, inputs format.
        
    Returns:
        list: Filtered list of verified valid test cases.
    """
    prompt_template = PromptTemplate(
        input_variables=["test_cases", "input_format", "description"],
        template="""
You are a LeetCode automated judge validator. Your job is to REJECT any test case that violates constraints or formatting, even slightly. Be STRICT and UNFORGIVING like the actual LeetCode system.

PROBLEM SPECIFICATION:
Description: {description}
Input Format: {input_format}

TEST CASES TO VALIDATE:
{test_cases}

VALIDATION CHECKLIST (REJECT if ANY fails):

1. **CONSTRAINT VERIFICATION** (CRITICAL):
   - Extract EVERY numeric constraint from description (1 ≤ n ≤ X, 0 ≤ ai ≤ Y, etc.)
   - Parse each test case and verify ALL values are within bounds
   - Check array lengths match specified n
   - REJECT if any value violates constraints by even 1
   - Check for null/None validity based on problem constraints
   - Verify integer bounds: -2^31 ≤ value ≤ 2^31-1 for 32-bit integers

2. **FORMAT COMPLIANCE**:
   - Must match input format EXACTLY
   - For arrays: proper JSON format [1,2,3]
   - For strings: proper quotes "hello"
   - For trees: level-order format [1,2,3,null,4]
   - For linked lists: array format [1,2,3]
   - No extra spaces, tabs, or characters
   - Numbers are integers/floats as required

3. **LOGICAL VALIDITY**:
   - For arrays: if n specified, must have exactly n elements
   - For trees: valid binary tree structure, null positions correct
   - For graphs: valid node indices, edge count matches
   - For strings: length matches specified n if given
   - For linked lists: valid node sequence

4. **LEETCODE-SPECIFIC CHECKS**:
   - Null handling: verify null is valid for this problem
   - Empty inputs: verify empty array/string is valid
   - Tree structure: proper level-order with null markers
   - Graph representation: adjacency list/matrix validity
   - String constraints: character set validity

5. **QUALITY STANDARDS** (REJECT low-quality cases):
   - NOT trivially identical to sample inputs
   - NOT malformed JSON/syntax
   - NOT impossible cases (e.g., invalid tree structure)
   - NOT ambiguous or unparseable

6. **PARSING SAFETY**:
   - Can be parsed without errors
   - Valid JSON where applicable
   - No leading zeros (except 0 itself)
   - Proper escaping in strings

VALIDATION PROCESS:
1. Parse each test case according to input format
2. Extract all values and check against constraints
3. Verify format matches specification exactly
4. Check logical consistency
5. If ALL checks pass → ACCEPT, else → REJECT

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
        print(f"validate_leetcode_test_cases: falling back to line-based parsing ({exc})")

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
