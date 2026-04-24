export default function resolveAIBattleOutcome({ userResult, aiExecution }) {
  const safeAIResult = {
    status: aiExecution?.status || 'fallback',
    solved: Boolean(aiExecution?.solved),
    passedCases: Number(aiExecution?.passedCases || 0),
    finishTimeSeconds: Number(aiExecution?.finishTimeSeconds || 0),
    strategy: aiExecution?.strategy || 'fallback_simulation',
    attemptsUsed: Number(aiExecution?.attemptsUsed || 0),
    maxAttempts: Number(aiExecution?.maxAttempts || 0)
  };

  const safeUserResult = {
    solved: Boolean(userResult?.solved),
    passedCases: Number(userResult?.passedCases || 0),
    finishTimeSeconds: Number(userResult?.finishTimeSeconds || 0)
  };

  if (safeUserResult.solved && !safeAIResult.solved) {
    return {
      status: 'won',
      result: 'won',
      reason: 'You fully solved the problem while the AI did not.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (!safeUserResult.solved && safeAIResult.solved) {
    return {
      status: 'loss',
      result: 'loss',
      reason: 'The AI fully solved the problem while your submission did not.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (safeUserResult.passedCases > safeAIResult.passedCases) {
    return {
      status: 'won',
      result: 'won',
      reason: 'Higher passed test count.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (safeUserResult.passedCases < safeAIResult.passedCases) {
    return {
      status: 'loss',
      result: 'loss',
      reason: 'The AI passed more test cases.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (safeUserResult.passedCases === 0 && safeAIResult.passedCases === 0) {
    return {
      status: 'draw',
      result: 'draw',
      reason: 'Neither side produced a meaningful passing submission.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (safeUserResult.finishTimeSeconds > safeAIResult.finishTimeSeconds) {
    return {
      status: 'won',
      result: 'won',
      reason: 'Tie on tests, but you finished earlier.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  if (safeUserResult.finishTimeSeconds < safeAIResult.finishTimeSeconds) {
    return {
      status: 'loss',
      result: 'loss',
      reason: 'Tie on tests, but the AI finished earlier.',
      userResult: safeUserResult,
      aiResult: safeAIResult
    };
  }

  return {
    status: 'draw',
    result: 'draw',
    reason: 'Both submissions were evenly matched.',
    userResult: safeUserResult,
    aiResult: safeAIResult
  };
}
