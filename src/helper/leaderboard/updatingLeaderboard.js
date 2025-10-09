import cron from 'node-cron';
import User from '../../models/user.model.js';
import leetcodeData from '../fetchLeetcode.js';
import codeforcesData from '../fetchCodeforces.js';
import { updateLeaderboard } from './scoreCalculation.js';


cron.schedule('*/10 * * * *', async () => {
  await updateLeaderboard({ key: 'leaderboard:1', days: 1 });
});


cron.schedule('0 */2 * * *', async () => {
  await updateLeaderboard({ key: 'leaderboard:7', days: 7 });
});


cron.schedule("0 */2 * * *", async () => {
  const users = await User.find({ leetcodeId: { $exists: true, $ne: null } });

  
  for (const user of users) {
    if (user.leetcodeId) {
      await leetcodeData(user._id, user.leetcodeId);
    }
  }
});

cron.schedule("0 */2 * * *", async () => {
  const users = await User.find({ codeforcesId: { $exists: true, $ne: null } });
  
  for (const user of users) {
    if (user.codeforcesId) {
      await codeforcesData(user._id, user.codeforcesId);
    }
  }
});