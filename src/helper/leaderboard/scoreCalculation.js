import redisClient from '../../redis/redisClient.js';
import User from '../../models/user.model.js';
import dayjs from 'dayjs';

function calculateScoreForUser(user, timeWindowStart) {
  // 1️⃣ Total XP earned today
  const xp = user.XP
    ?.filter(entry => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.xp || 0), 0) || 0;

  
  const totalWins = user.totalW
    ?.filter(entry => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.battlesWon || 0), 0) || 0;

  // 3️⃣ Total battles played today (sum of battlesPlayed)
  const matchesPlayed = user.totalB
    ?.filter(entry => new Date(entry.date) >= timeWindowStart)
    .reduce((sum, entry) => sum + (entry.battlesPlayed || 0), 0) || 0;

  // 4️⃣ Win ratio
  const winRatio = matchesPlayed === 0 ? 0 : totalWins / matchesPlayed;

const totalPoints = 
    (totalWins * 50) +        // each win gives 50 points
    (matchesPlayed * 5) +     // each battle played gives 5 points
    (xp) +                    // XP adds directly
    (Math.floor((totalWins / Math.max(matchesPlayed,1)) * 100)); 
    // extra points for good win ratio (0-100)


  return totalPoints;
}



export async function updateLeaderboard({ key, days }) {
  const now = new Date();
  const timeWindowStart = dayjs(now).subtract(days, 'day').toDate();

  try {
    await redisClient.del(key);
    const cursor = User.find().cursor();
    const pipeline = redisClient.multi();

    for await (const user of cursor) {
      const score = calculateScoreForUser(user, timeWindowStart);
      if (score > 0) {
        pipeline.zAdd(key, { score, value: user._id.toString() });
      }
    }

    await pipeline.exec();

    console.log(`Leaderboard '${key}' updated for last ${days} day(s).`);
  } catch (err) {
    console.error('Failed to update leaderboard:', err);
  }
}
