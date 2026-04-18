import CFproblems from "../models/codeforces_questions.model.js";
import leetcodeQuestion from "../models/leetcode_questions.model.js";
import CFsolutions from "../models/codeforces_solutions.model.js";
import LeetCodeSolution from "../models/leetcode_solutions.model.js";
import { summarizeError, wrapImportError } from "./importLogger.js";

export async function findExistingProblem(platform, problemId) {
  if (platform === "codeforces") {
    return CFproblems.findOne({ problemId });
  }

  return leetcodeQuestion.findOne({ problemId });
}

export default async function persistImportedProblem({
  platform,
  problem,
  solution,
  sourceUrl,
  logger,
}) {
  try {
    const hasSolution = Boolean(solution?.code && solution?.language);
    const solutionPayload = hasSolution
      ? {
        problemId: problem.problemId,
        language: solution.language,
        code: solution.code,
        sourceUrl,
        verifiedBySamples: true,
        importedAt: new Date(),
      }
      : null;

    if (platform === "codeforces") {
      const savedQuestion = await CFproblems.create(problem);
      const savedSolution = solutionPayload ? await CFsolutions.create(solutionPayload) : null;
      logger?.info("persistence", "Saved Codeforces import", {
        problemId: problem.problemId,
        questionId: savedQuestion._id,
        hasSolution: Boolean(savedSolution),
      });
      return { savedQuestion, savedSolution };
    }

    const savedQuestion = await leetcodeQuestion.create(problem);
    const savedSolution = solutionPayload ? await LeetCodeSolution.create(solutionPayload) : null;
    logger?.info("persistence", "Saved LeetCode import", {
      problemId: problem.problemId,
      questionId: savedQuestion._id,
      hasSolution: Boolean(savedSolution),
    });
    return { savedQuestion, savedSolution };
  } catch (error) {
    logger?.error("persistence", "Failed to persist imported problem", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to save imported problem",
      statusCode: 500,
      stage: "persistence",
      details: {
        platform,
        problemId: problem.problemId,
      },
    });
  }
}
