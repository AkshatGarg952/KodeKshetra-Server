"""
Codeforces test case generation using Gemini model prompt guidelines.
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

def generate_codeforces_test_cases(metadata: dict, num_cases: int = 10, solution: dict = None) -> list:
    """
    Generates dynamic hidden test cases targeting Codeforces constraints, edge cases, and typical failure modes.
    
    Args:
        metadata (dict): Problem parameters including title, description, rating.
        num_cases (int): Desired count of generated test cases.
        solution (dict, optional): Reference solution implementation.
        
    Returns:
        list: List of generated hidden test case inputs as string blobs.
    """
    prompt_template = PromptTemplate(
        input_variables=["description", "input_format", "examples", "rating", "solution"],
        template="""
You are a legendary Codeforces problem setter (red/legendary grandmaster level) creating HIDDEN test cases that will determine if a solution truly deserves to pass. Your test cases have broken thousands of seemingly correct solutions.

PROBLEM CONTEXT:
Description: {description}
Input Format: {input_format}
Rating: {rating}
Sample Cases (DO NOT replicate these): {examples}
{solution}

CRITICAL MISSION: Generate exactly {num_cases} test case INPUTS that would make even grandmasters nervous. These must be DIFFERENT from samples and cover failure modes most coders miss.

MANDATORY COVERAGE (prioritize based on problem type):

1. **ABSOLUTE EDGE CASES** (always include 3-4):
   - Minimum constraints (n=1, empty arrays if valid, single element)
   - Maximum constraints (n=2×10^5, values=10^9, stress memory/time)
   - Boundary values (n=2, values at exact constraint limits)
   - Zero/negative cases if constraints allow (0, -1, -10^9)
   - Empty inputs where valid (empty string, zero length)

2. **ALGORITHMIC TRAPS** (critical - include 2-3):
   - **Off-by-one errors**: Arrays/ranges where index ±1 changes answer
   - **Integer overflow**: Operations on large numbers (near 10^18 after multiplication)
   - **Precision errors**: For floating point (if applicable)
   - **TLE traps**: Inputs that make O(n²) solutions timeout but O(n log n) pass
   - **Wrong greedy**: Cases where greedy fails but seems right
   - **Missing corner logic**: All elements same, alternating patterns, single outlier

3. **DATA STRUCTURE KILLERS** (if problem uses DS):
   - **Graph**: Disconnected components, self-loops, multiple edges, star/chain/cycle
   - **Tree**: Degenerate (chain), single node, perfect binary tree
   - **Array**: All identical, strictly increasing/decreasing, mountain shape
   - **String**: All same char, alternating, palindromes, no matches
   - **DP**: Cases where naive recursion explodes but DP works

4. **MATHEMATICAL PRECISION** (if problem has math):
   - Modular arithmetic edge cases (result=0, result=MOD-1)
   - GCD/LCM special cases (coprime, one divides other, both 1)
   - Prime number edges (2, large prime, composite that looks prime)
   - Combinatorics overflow (C(n,k) intermediate overflow)
   - Power operations (a^b where result > 10^18)

5. **PROBLEM-SPECIFIC TRAPS** (analyze description):
   - Identify the ONE thing most coders will get wrong
   - Create 2-3 cases specifically targeting that mistake
   - For sorting problems: presorted inputs, reverse sorted
   - For search problems: target at boundaries, not present
   - For construction problems: impossible cases, multiple valid answers
   - For interactive problems: worst-case query patterns

6. **ANTI-PATTERN TESTS** (rating-based):
   - Rating 800-1200: Basic logic errors, forgot to handle n=1
   - Rating 1300-1600: Off-by-one, wrong comparison operators
   - Rating 1700-2000: Greedy vs DP confusion, overflow
   - Rating 2100+: Subtle algorithmic errors, complex interaction bugs

7. **MULTI-TEST FORMAT** (if applicable):
   - Test with t=1 (single test)
   - Test with t=max (many small tests)
   - Mix of small and large tests
   - Ensure sum of n across all tests respects global constraints

8. **STRESS TESTS**:
   - Maximum n with worst-case pattern
   - Maximum values causing overflow
   - Cases that maximize recursion depth
   - Cases that maximize memory usage

9. **CORNER CASE COMBINATIONS**:
   - All elements equal + maximum n
   - Strictly increasing + maximum values
   - Alternating pattern + boundary values
   - Single outlier + otherwise uniform

10. **GREEDY KILLERS** (for greedy problems):
     - Cases where local optimum ≠ global optimum
     - Cases requiring lookahead
     - Cases with ties that need specific breaking

CRITICAL CONSTRAINTS COMPLIANCE:
- Parse EVERY constraint from description (1 ≤ n ≤ X, sum of n ≤ Y, etc.)
- NEVER violate constraints even slightly
- Match EXACT input format from samples (spaces, newlines, structure)
- Ensure multi-test inputs respect global constraints (sum of all n ≤ X)

OUTPUT REQUIREMENTS:
- Return ONLY a valid JSON array of strings
- NO explanations, NO labels like "Test 1:", NO markdown
- Each array item must be one complete input blob
- Use escaped newlines inside strings when the format is multi-line
- Match sample input format EXACTLY (don't add/remove spaces or newlines)
- Each test case must be COMPLETE and PARSEABLE as-is

QUALITY CHECKLIST before outputting:
- At least 3 absolute edge cases (min/max values)
- At least 2 algorithmic traps (overflow, off-by-one, TLE)
- At least 2 problem-specific killer cases
- All cases STRICTLY follow constraints
- All cases DIFFERENT from samples
- Format EXACTLY matches sample inputs
- Would these break a solution with 1 subtle bug? (If no, regenerate)

Now generate {num_cases} merciless test case inputs:
        """
    )

    examples = metadata.get('examples', [])
    examples_str = "\n".join([f"Input: {ex['input']}\nOutput: {ex['output']}" for ex in examples])
    
    solution_str = ""
    if solution:
        solution_str = f"REFERENCE SOLUTION:\nLanguage: {solution.get('language', '')}\nCode:\n{solution.get('code', '')}\n"

    prompt = prompt_template.format(
        description=metadata.get('description', ''),
        input_format=metadata.get('inputFormat', ''),
        examples=examples_str,
        rating=metadata.get('rating', 0),
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
        print(f"generate_codeforces_test_cases: falling back to line-based parsing ({exc})")

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
