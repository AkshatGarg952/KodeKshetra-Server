import User from '../../models/user.model.js';
import axios from 'axios';

async function codeforcesData(userId, username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid Codeforces username');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
  if (response.data.status === 'OK') {
    const data = response.data.result[0];
    user.rating.cp = data.rating || 0;
  } else {
    user.rating.cp = 0;
  }

  response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
  if (response.data.status !== 'OK') {
    throw new Error(`Failed to fetch submissions for ${username}`);
  }

  const submissions = response.data.result;

  const solvedSet = new Set();
  submissions.forEach(sub => {
    if (sub.verdict === 'OK' && sub.problem) {
      const problemId = `${sub.contestId}-${sub.problem.index}`;
      solvedSet.add(problemId);
    }
  });

  const existingSet = new Set(
    user.solvedQuestions
      .filter(q => q.platform === 'Codeforces')
      .map(q => q.problemId)
  );

  for (const problemId of solvedSet) {
    if (!existingSet.has(problemId)) {
      user.solvedQuestions.push({
        platform: 'Codeforces',
        problemId
      });
    }
  }

  await user.save();

  return {
    message: "Codeforces data updated successfully",
    rating: user.rating.cp,
    totalSolved: solvedSet.size
  };
}

export default codeforcesData;
