from .leetcode_validator import validate_leetcode_test_cases
from .codeforces_validator import validate_codeforces_test_cases

def validate_test_cases(test_cases: list, metadata: dict) -> list:
    platform = metadata.get('platform', 'codeforces')
    
    if platform == 'leetcode':
        return validate_leetcode_test_cases(test_cases, metadata)
    elif platform == 'codeforces':
        return validate_codeforces_test_cases(test_cases, metadata)
    else:
        return validate_codeforces_test_cases(test_cases, metadata)
