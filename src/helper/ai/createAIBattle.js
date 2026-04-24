import Battle from '../../models/battle.model.js';
import getQuestionForBattle from '../Questions/fetchQuestion.js';
import resolveAIOpponent from './resolveAIOpponent.js';
import { buildInitialAIExecution } from './liveAIBattleExecution.js';

const getTotalTestCount = (question = {}) =>
  (Array.isArray(question.examples) ? question.examples.length : 0) +
  (Array.isArray(question.sampleTests) ? question.sampleTests.length : 0) +
  (Array.isArray(question.hiddenTests) ? question.hiddenTests.length : 0);

const defaultLanguageForMode = (mode) => (mode === 'cp' ? 'cpp' : 'python');

export default async function createAIBattle({
  user,
  mode,
  topic,
  battleDurationSeconds
}) {
  const opponent = resolveAIOpponent({ user, mode, topic });
  const botUser = {
    rating: {
      [mode]: opponent.visibleRating
    },
    solvedQuestions: []
  };

  const question = await getQuestionForBattle(
    { mode, topic, battleType: 'ai' },
    user,
    botUser
  );

  const totalCases = getTotalTestCount(question);
  const defaultLanguage = defaultLanguageForMode(mode);
  const battleStartedAt = new Date();
  const battleEndsAt = battleStartedAt.getTime() + (battleDurationSeconds * 1000);

  const battle = await Battle.create({
    player1: user._id,
    player2: null,
    battleType: 'ai',
    mode,
    topic,
    question,
    aiOpponent: {
      botId: opponent.botId,
      displayName: opponent.displayName,
      visibleRating: opponent.visibleRating,
      persona: opponent.persona,
      mode: opponent.mode,
      topic: opponent.topic,
      difficulty: opponent.difficulty,
      version: opponent.version
    },
    aiExecution: buildInitialAIExecution({
      language: defaultLanguage,
      totalCases
    }),
    createdAt: battleStartedAt
  });

  return {
    battle,
    question,
    battleStartedAt,
    battleEndsAt,
    opponent,
    defaultLanguage
  };
}
