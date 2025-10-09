import { getTestcases, executeCode } from '../codeSubmission/helper.js';

export async function decideWinner(code, language, problem, timeLimit = 2, memoryLimit = 300) {
  const allTests = getTestcases(problem, true);
  if (!allTests.length) return 0;

  let passedCount = 0;

  for (let i = 0; i < allTests.length; i++) {
    const result = await executeCode(code, language, [allTests[i]], timeLimit, memoryLimit);
    if (!result.isError) passedCount++;
  }

  return passedCount;
}
