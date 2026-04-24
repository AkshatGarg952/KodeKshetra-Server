import axios from 'axios';

export default async function requestAISolve({
  battleId,
  mode,
  topic,
  opponent,
  language,
  question,
  attemptNumber = 1,
  retryFeedback = ''
}) {
  const hiddenForcesUrl = process.env.HIDDEN_FORCES_URL || 'http://127.0.0.1:8000';

  const payload = {
    battleId,
    mode,
    topic,
    attemptNumber,
    retryFeedback,
    ratingBand: opponent.visibleRating,
    language: language || (mode === 'cp' ? 'cpp' : 'python'),
    problem: {
      title: question?.title || '',
      statement: question?.description || '',
      inputFormat: question?.inputFormat || '',
      outputFormat: question?.outputFormat || '',
      constraints: question?.note || '',
      samples: question?.examples || question?.sampleTests || []
    },
    personaConfig: {
      targetSkill: opponent.difficulty,
      maxRefinementPasses: opponent?.calibration?.refinementBudget || 1,
      displayName: opponent.displayName,
      persona: opponent.persona
    }
  };

  const response = await axios.post(
    `${hiddenForcesUrl}/ai-solver/solve-battle-problem`,
    payload,
    {
      timeout: Number(process.env.AI_SOLVER_TIMEOUT_MS || 12000)
    }
  );

  return response.data;
}
