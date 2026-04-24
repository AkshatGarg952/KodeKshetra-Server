import User from '../../models/user.model.js';
import calculateXP from '../XP/XPCalculator.js';
import updateXP from '../XP/UpdateXP.js';
import battleUpdate from '../updation/battleUpdate.js';
import setStreaks from '../updation/setStreaks.js';

export default async function applyAIBattleRewards({ player, question, mode }) {
  const enrichedPlayer = {
    ...player,
    xp: calculateXP(player)
  };

  await updateXP(enrichedPlayer);
  await battleUpdate(enrichedPlayer);
  await setStreaks(enrichedPlayer);

  if (enrichedPlayer.passedCases >= enrichedPlayer.totalCases && enrichedPlayer.totalCases > 0) {
    const platform = mode === 'cp' ? 'Codeforces' : 'LeetCode';
    const updates = {
      $push: { solvedQuestions: { platform, problemId: question.problemId } }
    };

    if (Array.isArray(question?.tags) && question.tags.length > 0) {
      updates.$inc = {};
      question.tags.forEach((tag) => {
        updates.$inc[`topicsMastered.${tag}`] = 1;
      });
    }

    await User.findByIdAndUpdate(enrichedPlayer.id, updates);
  }

  return enrichedPlayer;
}
