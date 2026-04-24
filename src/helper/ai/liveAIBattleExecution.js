import axios from 'axios';
import Battle from '../../models/battle.model.js';
import { decideWinner } from '../winner/decideWinner.js';
import requestAISolve from './requestAISolve.js';
import normalizeAISolverResult from './normalizeAISolverResult.js';
import fallbackSimulation from './fallbackSimulation.js';

const AI_BATTLE_MAX_ATTEMPTS = Math.max(1, Number(process.env.AI_BATTLE_MAX_ATTEMPTS || 4));
const AI_BATTLE_RETRY_DELAY_MS = Math.max(0, Number(process.env.AI_BATTLE_RETRY_DELAY_MS || 1500));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getTotalTestCount = (question = {}) =>
  (Array.isArray(question.examples) ? question.examples.length : 0) +
  (Array.isArray(question.sampleTests) ? question.sampleTests.length : 0) +
  (Array.isArray(question.hiddenTests) ? question.hiddenTests.length : 0);

const getRemainingBattleSeconds = ({ battleStartedAt, battleDurationSeconds }) => {
  const elapsedSeconds = Math.max(
    0,
    Math.ceil((Date.now() - battleStartedAt.getTime()) / 1000)
  );

  return Math.max(0, battleDurationSeconds - elapsedSeconds);
};

const buildFeedbackFromEvaluation = ({ evaluation, totalCases }) => {
  if (!evaluation) {
    return 'The previous attempt did not produce a judgeable solution. Return one complete runnable program.';
  }

  if (evaluation.compileStatus && evaluation.compileStatus !== 'success') {
    return `The previous judged result failed with ${evaluation.compileStatus}. Return a corrected full solution.`;
  }

  if (evaluation.solved) {
    return 'The previous judged result fully solved the problem.';
  }

  if ((evaluation.passedCases || 0) > 0) {
    return `The previous judged result passed ${evaluation.passedCases} out of ${totalCases} tests. Improve correctness and edge cases.`;
  }

  return 'The previous judged result was wrong answer. Return a different full solution.';
};

const isBetterResult = (candidate, current) => {
  if (!candidate) {
    return false;
  }

  if (!current) {
    return true;
  }

  if ((candidate.passedCases || 0) !== (current.passedCases || 0)) {
    return (candidate.passedCases || 0) > (current.passedCases || 0);
  }

  if (Boolean(candidate.solved) !== Boolean(current.solved)) {
    return Boolean(candidate.solved);
  }

  if ((candidate.finishTimeSeconds || 0) !== (current.finishTimeSeconds || 0)) {
    return (candidate.finishTimeSeconds || 0) > (current.finishTimeSeconds || 0);
  }

  return (candidate.confidence || 0) > (current.confidence || 0);
};

const evaluateAISubmission = async ({
  question,
  solverResult,
  totalCases,
  battleStartedAt,
  battleDurationSeconds
}) => {
  if (!solverResult.generatedCode) {
    return null;
  }

  const codeRunnerUrl = process.env.CODE_RUNNER_URL;
  if (!codeRunnerUrl) {
    return null;
  }

  const startedAt = Date.now();

  const [submitResponse, passedCases] = await Promise.all([
    axios.post(
      `${codeRunnerUrl}/submit`,
      {
        code: solverResult.generatedCode,
        language: solverResult.language,
        problem: question
      },
      { timeout: Number(process.env.CODE_RUNNER_TIMEOUT_MS || 35000) }
    ),
    decideWinner(solverResult.generatedCode, solverResult.language, question)
  ]);

  const submitData = submitResponse.data || {};
  const executionTimeMs = Date.now() - startedAt;
  const finishTimeSeconds = getRemainingBattleSeconds({
    battleStartedAt,
    battleDurationSeconds
  });

  return {
    strategy: solverResult.attempts > 1 ? 'assisted_solver' : solverResult.strategy,
    language: solverResult.language,
    generatedCode: solverResult.generatedCode,
    compileStatus: submitData.isError ? (submitData.errorType || 'error') : 'success',
    passedCases,
    totalCases,
    solved: passedCases >= totalCases && totalCases > 0,
    executionTimeMs,
    finishTimeSeconds,
    confidence: solverResult.confidence,
    failureReason: submitData.isError ? (submitData.message || 'Judge execution failed') : null
  };
};

const buildFallbackResult = ({
  battleId,
  question,
  opponent,
  user,
  totalCases,
  battleDurationSeconds,
  language,
  attemptsUsed,
  feedback
}) => ({
  ...fallbackSimulation({
    battleId,
    question,
    opponent,
    user,
    totalCases,
    battleDurationSeconds,
    language
  }),
  status: 'fallback',
  attemptsUsed,
  maxAttempts: AI_BATTLE_MAX_ATTEMPTS,
  lastFeedback: feedback,
  lastUpdatedAt: new Date()
});

const getExecutionWriteFilter = (battleId) => ({
  _id: battleId,
  'aiOutcome.resolvedAt': null,
  'aiExecution.status': { $ne: 'fallback' }
});

const isExecutionLocked = async (battleId) => {
  const battle = await Battle.findById(battleId)
    .select('aiExecution.status aiOutcome.resolvedAt')
    .lean();

  if (!battle) {
    return true;
  }

  return Boolean(battle.aiOutcome?.resolvedAt) || battle.aiExecution?.status === 'fallback';
};

export async function persistFallbackAIExecution({
  battleId,
  question,
  opponent,
  user,
  totalCases,
  battleDurationSeconds,
  language,
  attemptsUsed = 0,
  feedback = ''
}) {
  const finalResult = buildFallbackResult({
    battleId: battleId.toString(),
    question,
    opponent,
    user,
    totalCases,
    battleDurationSeconds,
    language,
    attemptsUsed,
    feedback
  });

  await Battle.findByIdAndUpdate(battleId, {
    $set: {
      aiExecution: {
        ...finalResult,
        status: 'fallback',
        attemptsUsed: finalResult.attemptsUsed ?? attemptsUsed,
        maxAttempts: finalResult.maxAttempts ?? AI_BATTLE_MAX_ATTEMPTS,
        totalCases,
        language: finalResult.language || language,
        lastUpdatedAt: new Date()
      }
    }
  });

  return finalResult;
}

export const buildInitialAIExecution = ({ language, totalCases }) => ({
  status: 'pending',
  strategy: null,
  attemptsUsed: 0,
  maxAttempts: AI_BATTLE_MAX_ATTEMPTS,
  language,
  generatedCode: null,
  compileStatus: 'pending',
  passedCases: 0,
  totalCases,
  solved: false,
  executionTimeMs: null,
  finishTimeSeconds: null,
  confidence: 0,
  failureReason: 'AI has not completed any judged attempt yet.',
  lastFeedback: null,
  lastUpdatedAt: new Date()
});

export default async function runLiveAIBattleExecution({
  battleId,
  battleStartedAt,
  battleDurationSeconds,
  question,
  topic,
  mode,
  language,
  opponent,
  user
}) {
  const totalCases = getTotalTestCount(question);
  let attemptsUsed = 0;
  let bestResult = null;
  let retryFeedback = '';

  const markedRunning = await Battle.findOneAndUpdate(getExecutionWriteFilter(battleId), {
    $set: {
      'aiExecution.status': 'running',
      'aiExecution.failureReason': 'AI is solving in the background.',
      'aiExecution.lastUpdatedAt': new Date()
    }
  });

  if (!markedRunning) {
    return null;
  }

  while (
    attemptsUsed < AI_BATTLE_MAX_ATTEMPTS &&
    getRemainingBattleSeconds({ battleStartedAt, battleDurationSeconds }) > 0 &&
    !bestResult?.solved
  ) {
    if (await isExecutionLocked(battleId)) {
      return bestResult;
    }

    attemptsUsed += 1;
    let evaluatedResult = null;

    try {
      const rawSolverResult = await requestAISolve({
        battleId: battleId.toString(),
        mode,
        topic,
        opponent,
        language,
        question,
        attemptNumber: attemptsUsed,
        retryFeedback
      });

      const solverResult = normalizeAISolverResult(rawSolverResult, language);
      evaluatedResult = await evaluateAISubmission({
        question,
        solverResult,
        totalCases,
        battleStartedAt,
        battleDurationSeconds
      });
    } catch (error) {
      evaluatedResult = null;
    }

    retryFeedback = buildFeedbackFromEvaluation({
      evaluation: evaluatedResult,
      totalCases
    });

    if (isBetterResult(evaluatedResult, bestResult)) {
      bestResult = {
        ...evaluatedResult,
        status: 'completed',
        attemptsUsed,
        maxAttempts: AI_BATTLE_MAX_ATTEMPTS,
        lastFeedback: retryFeedback,
        lastUpdatedAt: new Date()
      };
    }

    const persistedProgress = await Battle.findOneAndUpdate(getExecutionWriteFilter(battleId), {
      $set: {
        'aiExecution.status': bestResult?.solved ? 'completed' : 'running',
        'aiExecution.strategy': bestResult?.strategy || null,
        'aiExecution.attemptsUsed': attemptsUsed,
        'aiExecution.maxAttempts': AI_BATTLE_MAX_ATTEMPTS,
        'aiExecution.language': bestResult?.language || language,
        'aiExecution.generatedCode': bestResult?.generatedCode || null,
        'aiExecution.compileStatus': bestResult?.compileStatus || 'running',
        'aiExecution.passedCases': bestResult?.passedCases || 0,
        'aiExecution.totalCases': totalCases,
        'aiExecution.solved': Boolean(bestResult?.solved),
        'aiExecution.executionTimeMs': bestResult?.executionTimeMs ?? null,
        'aiExecution.finishTimeSeconds': bestResult?.finishTimeSeconds ?? null,
        'aiExecution.confidence': bestResult?.confidence ?? 0,
        'aiExecution.failureReason': bestResult?.failureReason || (bestResult ? null : 'No successful judged attempt yet.'),
        'aiExecution.lastFeedback': retryFeedback,
        'aiExecution.lastUpdatedAt': new Date()
      }
    });

    if (!persistedProgress) {
      return bestResult;
    }

    if (bestResult?.solved) {
      break;
    }

    if (
      attemptsUsed < AI_BATTLE_MAX_ATTEMPTS &&
      getRemainingBattleSeconds({ battleStartedAt, battleDurationSeconds }) > 0 &&
      AI_BATTLE_RETRY_DELAY_MS > 0
    ) {
      await sleep(AI_BATTLE_RETRY_DELAY_MS);
    }
  }

  if (await isExecutionLocked(battleId)) {
    return bestResult;
  }

  const finalResult = bestResult || await persistFallbackAIExecution({
    battleId,
    question,
    opponent,
    user,
    totalCases,
    battleDurationSeconds,
    language,
    attemptsUsed,
    feedback: retryFeedback || 'No judged AI attempt completed successfully.'
  });

  if (finalResult.status === 'fallback') {
    return finalResult;
  }

  const persistedFinal = await Battle.findOneAndUpdate(getExecutionWriteFilter(battleId), {
    $set: {
      aiExecution: {
        ...finalResult,
        status: finalResult.status || 'completed',
        attemptsUsed: finalResult.attemptsUsed ?? attemptsUsed,
        maxAttempts: finalResult.maxAttempts ?? AI_BATTLE_MAX_ATTEMPTS,
        totalCases,
        language: finalResult.language || language,
        lastUpdatedAt: new Date()
      }
    }
  });

  if (!persistedFinal) {
    return bestResult;
  }

  return finalResult;
}
