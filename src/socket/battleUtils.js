export function sanitizeQuestionForClient(question, mode) {
  if (!question) {
    return question;
  }

  const normalizedQuestion = question.toObject ? question.toObject() : question;

  if (mode === "cp") {
    const { _id, hiddenTestCases, hiddenTests, __v, ...safeQuestion } = normalizedQuestion;
    return safeQuestion;
  }

  if (mode === "dsa") {
    const {
      _id,
      source,
      url,
      memoryLimit,
      timeLimit,
      completeCodeTemplates,
      hiddenTests,
      __v,
      ...safeQuestion
    } = normalizedQuestion;
    return safeQuestion;
  }

  return normalizedQuestion;
}

export function getTotalTestCount(question = {}) {
  return (Array.isArray(question.examples) ? question.examples.length : 0)
    + (Array.isArray(question.sampleTests) ? question.sampleTests.length : 0)
    + (Array.isArray(question.hiddenTests) ? question.hiddenTests.length : 0)
    + (Array.isArray(question.hiddenTestCases) ? question.hiddenTestCases.length : 0);
}

export function buildBattleStartPayload({
  battleId,
  question,
  mode,
  topic,
  battleType,
  battleStartedAt,
  battleEndsAt,
  battleDurationSeconds,
  roomId = null,
}) {
  return {
    question,
    battleId,
    mode,
    topic,
    battleType,
    battleStartedAt,
    battleEndsAt,
    battleDurationSeconds,
    roomId,
    serverNow: Date.now(),
  };
}
