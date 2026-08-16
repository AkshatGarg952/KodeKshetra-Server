export function createProblemResolver({
  CFproblems,
  leetcodeQuestion,
  ttlMs = 300000,
  maxSize = 1000,
}) {
  const problemCache = new Map();

  const getCachedProblem = (cacheKey) => {
    const entry = problemCache.get(cacheKey);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      problemCache.delete(cacheKey);
      return null;
    }

    return entry.value;
  };

  const setCachedProblem = (cacheKey, value) => {
    if (!value) {
      return;
    }

    if (!problemCache.has(cacheKey) && problemCache.size >= maxSize) {
      const oldestKey = problemCache.keys().next().value;
      if (oldestKey) {
        problemCache.delete(oldestKey);
      }
    }

    problemCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  };

  const resolveProblemForExecution = async (problem) => {
    if (!problem?.source || !problem?.problemId) {
      return problem;
    }

    const cacheKey = `${problem.source}:${problem.problemId}`;
    const cachedProblem = getCachedProblem(cacheKey);
    if (cachedProblem) {
      return cachedProblem;
    }

    let resolvedProblem = null;
    if (problem.source === "codeforces") {
      resolvedProblem = await CFproblems.findOne({ problemId: problem.problemId })
        .select("problemId source timeLimit memoryLimit examples hiddenTests")
        .lean();
    } else if (problem.source === "leetcode") {
      resolvedProblem = await leetcodeQuestion.findOne({ problemId: problem.problemId })
        .select("problemId source timeLimit memoryLimit sampleTests hiddenTests")
        .lean();
    }

    if (resolvedProblem) {
      setCachedProblem(cacheKey, resolvedProblem);
    }

    return resolvedProblem || problem;
  };

  return {
    problemCache,
    resolveProblemForExecution,
  };
}

