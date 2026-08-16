import User from '../../models/user.model.js';
import axios from 'axios';

const LEETCODE_GRAPHQL = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      contestRanking {
        rating
      }
    }
  }
`;

async function fetchLeetcodeRating(username) {
  try {
    if (!/^[a-zA-Z0-9\-]+$/.test(username)) {
      throw new Error('Invalid LeetCode username format');
    }

    const body = {
      query: LEETCODE_GRAPHQL,
      variables: { username }
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Referer': `https://leetcode.com/${username}/`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
    };

    const res = await axios.post('https://leetcode.com/graphql', body, { headers });

    if (res.data?.errors) {
      throw new Error(`GraphQL error: ${res.data.errors.map(e => e.message).join(', ')}`);
    }

    const matchedUser = res.data?.data?.matchedUser;
    if (!matchedUser) {
      throw new Error(`LeetCode username "${username}" not found`);
    }

    return matchedUser.contestRanking?.rating ?? null;
  } catch (error) {
    console.error('Fetch LeetCode Rating Error:', error.message, error.response?.data);
    throw new Error(`Failed to fetch LeetCode rating: ${error.message}`);
  }
}

async function leetcodeData(userId, username) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID provided');
  }
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid LeetCode username provided');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found in database');
    }

    user.rating = user.rating || {};

    const rating = await fetchLeetcodeRating(username);

    if (rating !== null) {
      user.rating.dsa = rating;
      await user.save();
    }

    return {
      message: 'LeetCode rating updated successfully',
      rating
    };
  } catch (error) {
    console.error('LeetCode Data Error:', error.message);
    throw new Error(`Error updating LeetCode data: ${error.message}`);
  }
}

export default leetcodeData;
