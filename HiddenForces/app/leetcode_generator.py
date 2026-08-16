"""
LeetCode test case generation using Gemini model prompt guidelines.
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

def generate_leetcode_test_cases(metadata: dict, num_cases: int = 10, solution: dict = None) -> list:
    """
    Generates dynamic hidden test cases targeting LeetCode constraints, edge cases, and typical failure modes.
    
    Args:
        metadata (dict): Problem parameters including title, description, constraints.
        num_cases (int): Desired count of generated test cases.
        solution (dict, optional): Reference solution implementation.
        
    Returns:
        list: List of generated hidden test case inputs as string blobs.
    """
    prompt_template = PromptTemplate(
        input_variables=["description", "input_format", "examples", "tags", "solution"],
        template="""
You are an expert LeetCode test case designer creating HIDDEN test cases that expose subtle bugs in solutions. Your test cases must be comprehensive and catch edge cases that typical solutions miss.

PROBLEM CONTEXT:
Description: {description}
Input Format: {input_format}
Tags: {tags}
Sample Cases (DO NOT replicate): {examples}
{solution}

MISSION: Generate exactly {num_cases} test case INPUTS that comprehensively test the solution. These must cover ALL edge cases and common failure patterns.

LEETCODE-SPECIFIC COVERAGE (include ALL applicable):

1. **EMPTY/NULL CASES** (always test if valid):
   - Empty arrays: []
   - Empty strings: ""
   - Null nodes: null
   - Zero-length inputs
   - Single element: [x], "a", single node

2. **BOUNDARY VALUES**:
   - Minimum constraints: n=1, values=0 or minimum allowed
   - Maximum constraints: n=10^4 or 10^5, values=10^9 or Integer.MAX_VALUE
   - Exact boundary: values at -2^31, 2^31-1
   - Array length boundaries: length=1, length=max

3. **ARRAY/LIST PATTERNS**:
   - All elements identical: [5,5,5,5,5]
   - Strictly increasing: [1,2,3,4,5]
   - Strictly decreasing: [5,4,3,2,1]
   - Alternating: [1,5,1,5,1]
   - Single outlier: [1,1,1,1,100]
   - Duplicates: [1,1,2,2,3,3]
   - No duplicates: [1,2,3,4,5]

4. **STRING PATTERNS**:
   - All same character: "aaaaa"
   - Alternating: "ababab"
   - Palindrome: "racecar"
   - No repeating chars: "abcdef"
   - Special characters if allowed
   - Mixed case if applicable

5. **TREE/GRAPH CASES** (if applicable):
   - Null root: null
   - Single node: [1]
   - Left-skewed tree: [1,null,2,null,3]
   - Right-skewed tree: [1,2,null,3]
   - Perfect binary tree: [1,2,3,4,5,6,7]
   - Unbalanced tree
   - Disconnected graph
   - Graph with cycles
   - Single-node graph

6. **LINKED LIST CASES** (if applicable):
   - Empty list: null
   - Single node: [1]
   - Two nodes: [1,2]
   - Cycle detection cases
   - Palindrome lists

7. **ALGORITHMIC TRAPS**:
   - Integer overflow: operations resulting in > 2^31-1
   - Off-by-one errors: indices at boundaries
   - Wrong comparison: >= vs >, <= vs <
   - Greedy failure: cases where greedy gives wrong answer
   - DP necessity: cases where brute force times out
   - Hash collision scenarios

8. **SORTING/SEARCH EDGE CASES**:
   - Already sorted input
   - Reverse sorted input
   - Target not present
   - Target at first position
   - Target at last position
   - Multiple occurrences of target
   - All elements equal to target

9. **TWO POINTER/SLIDING WINDOW**:
   - Window size = array size
   - Window size = 1
   - No valid window
   - Entire array is valid window

10. **DYNAMIC PROGRAMMING**:
    - Base case: n=0, n=1
    - Cases requiring memoization
    - Cases with overlapping subproblems

TAG-SPECIFIC PATTERNS:
- Array: test sorted, reverse, duplicates, single element
- String: test empty, single char, palindrome, all same
- Tree: test null, single node, skewed, balanced
- Graph: test disconnected, cycles, single node
- DP: test base cases, exponential recursion traps
- Binary Search: test target at boundaries, not present
- Two Pointers: test empty, single element, all same

CONSTRAINTS COMPLIANCE:
- Parse ALL constraints from description
- NEVER violate any constraint
- Match EXACT input format from examples
- Ensure proper data types (int, string, array, etc.)

OUTPUT FORMAT:
- Return ONLY a valid JSON array of strings
- NO explanations, NO labels, NO markdown
- Each array item must be one complete input blob
- Use escaped newlines inside strings when the format is multi-line
- Match sample input format EXACTLY
- For array inputs use JSON format: [1,2,3]
- For string inputs use quotes only when the problem format requires them
- For tree inputs use level-order: [1,2,3,null,null,4,5]

QUALITY CHECKLIST:
- At least 3 edge cases (empty/null, min, max)
- At least 2 boundary values
- At least 2 algorithmic traps
- All cases follow constraints strictly
- All cases different from samples
- Format matches examples exactly

Generate {num_cases} comprehensive test inputs now:
        """
    )

    examples = metadata.get('examples', [])
    examples_str = "\n".join([f"Input: {ex['input']}\nOutput: {ex['output']}" for ex in examples])
    tags_str = ", ".join(metadata.get('tags', []))
    
    solution_str = ""
    if solution:
        solution_str = f"REFERENCE SOLUTION:\nLanguage: {solution.get('language', '')}\nCode:\n{solution.get('code', '')}\n"

    prompt = prompt_template.format(
        description=metadata.get('description', ''),
        input_format=metadata.get('inputFormat', ''),
        examples=examples_str,
        tags=tags_str,
        solution=solution_str,
        num_cases=num_cases
    )

    response = llm.invoke(prompt)
    raw_content = response.content.strip() if isinstance(response.content, str) else ""

    cleaned_content = raw_content.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(cleaned_content)
        if isinstance(parsed, list):
            return [str(item) for item in parsed if str(item).strip()][:num_cases]
        raise ValueError("Expected a JSON array from Gemini response")
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"generate_leetcode_test_cases: falling back to line-based parsing ({exc})")

    test_cases = []
    current_case = []

    for line in raw_content.split("\n"):
        line = line.strip()
        if line in ["```json", "```", "[", "]", ""] and not current_case:
            continue

        if line == "" and current_case:
            test_cases.append("\n".join(current_case))
            current_case = []
        elif line:
            current_case.append(line)

    if current_case:
        test_cases.append("\n".join(current_case))

    return test_cases[:num_cases]
