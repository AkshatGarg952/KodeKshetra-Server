import User from '../../models/user.model.js';
import UserDailyStats from '../../models/user_daily_stats.model.js';
import { getCurrentDateBucket, shiftDateKey } from './dateBuckets.js';
import { withUserUpdateLock } from './userLock.js';

const buildSolvedQuestionUpdate = ({ platform, problemId, tags = [] }) => {
  const update = {
    $push: {
      solvedQuestions: { platform, problemId }
    }
  };

  if (Array.isArray(tags) && tags.length > 0) {
    update.$inc = {};
    tags.forEach((tag) => {
      update.$inc[`topicsMastered.${tag}`] = 1;
    });
  }

  return update;
};

export const markProblemSolvedOnce = async ({ userId, platform, problemId, tags = [] }) => {
  if (!userId || !platform || !problemId) {
    return false;
  }

  const result = await User.updateOne(
    {
      _id: userId,
      solvedQuestions: {
        $not: {
          $elemMatch: {
            platform,
            problemId
          }
        }
      }
    },
    buildSolvedQuestionUpdate({ platform, problemId, tags })
  );

  return result.modifiedCount > 0;
};

const applyUserStreaks = async ({ player, todayStats }) => {
  await withUserUpdateLock(player.id, async () => {
    const user = await User.findById(player.id)
      .select('currStreak maxStreak currWinStreak maxWinStreak')
      .lean();

    if (!user) {
      return;
    }

    const nextUserState = {
      currWinStreak: player.status === 'won' ? (user.currWinStreak || 0) + 1 : 0,
      maxWinStreak: user.maxWinStreak || 0,
      currStreak: user.currStreak || 0,
      maxStreak: user.maxStreak || 0
    };

    if (nextUserState.currWinStreak > nextUserState.maxWinStreak) {
      nextUserState.maxWinStreak = nextUserState.currWinStreak;
    }

    if ((todayStats?.battlesPlayed || 0) === 1) {
      const yesterdayKey = shiftDateKey(todayStats.dateKey, -1);
      const playedYesterday = await UserDailyStats.exists({
        userId: player.id,
        dateKey: yesterdayKey,
        battlesPlayed: { $gt: 0 }
      });

      nextUserState.currStreak = playedYesterday ? (user.currStreak || 0) + 1 : 1;
      if (nextUserState.currStreak > nextUserState.maxStreak) {
        nextUserState.maxStreak = nextUserState.currStreak;
      }
    }

    await User.updateOne(
      { _id: player.id },
      {
        $set: {
          currWinStreak: nextUserState.currWinStreak,
          maxWinStreak: nextUserState.maxWinStreak,
          currStreak: nextUserState.currStreak,
          maxStreak: nextUserState.maxStreak
        }
      }
    );
  });
};

export const applyBattleOutcomeForUser = async (player) => {
  if (!player?.id) {
    return null;
  }

  const { dateKey, date } = getCurrentDateBucket();
  const increments = {
    battlesPlayed: 1,
    xp: player.xp || 0
  };

  if (player.status === 'won') {
    increments.battlesWon = 1;
  } else if (player.status === 'draw') {
    increments.battlesDraw = 1;
  }

  await UserDailyStats.updateOne(
    { userId: player.id, dateKey },
    {
      $setOnInsert: {
        userId: player.id,
        dateKey,
        date
      },
      $inc: increments
    },
    { upsert: true }
  );

  const todayStats = await UserDailyStats.findOne({ userId: player.id, dateKey })
    .select('dateKey battlesPlayed')
    .lean();

  await applyUserStreaks({
    player,
    todayStats
  });

  return todayStats;
};
