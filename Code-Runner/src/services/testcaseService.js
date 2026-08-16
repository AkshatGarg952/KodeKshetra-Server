export function getTestcases(problem, includeHidden = false) {
  let testcases = problem.examples || problem.sampleTests || [];

  if (includeHidden) {
    if (Array.isArray(problem.hiddenTests)) {
      testcases = [...testcases, ...problem.hiddenTests];
    } else if (Array.isArray(problem.hiddenTestCases)) {
      testcases = [...testcases, ...problem.hiddenTestCases];
    }
  }

  return testcases.map((testcase) => ({
    input: testcase.input || "",
    expected: testcase.output || testcase.expected || "",
  }));
}

