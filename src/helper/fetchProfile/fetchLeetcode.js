import User from '../../models/user.model.js';
import axios from 'axios';

// LeetCode GraphQL query (verified for correctness)
const LEETCODE_GRAPHQL = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      contestRanking {
        rating
      }
    }
  }
`;

// Function to fetch LeetCode rating
async function fetchLeetcodeRating(username) {
  try {
    // Validate username format (alphanumeric and hyphens, typical for LeetCode)
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

    // Make the API request
    const res = await axios.post('https://leetcode.com/graphql', body, { headers });

    // Log the response for debugging
    console.log('LeetCode API Response:', JSON.stringify(res.data, null, 2));

    // Check for GraphQL errors
    if (res.data?.errors) {
      throw new Error(`GraphQL error: ${res.data.errors.map(e => e.message).join(', ')}`);
    }

    const matchedUser = res.data?.data?.matchedUser;
    if (!matchedUser) {
      throw new Error(`LeetCode username "${username}" not found`);
    }

    // Return contest rating or null if not available
    return matchedUser.contestRanking?.rating ?? null;
  } catch (error) {
    // Log the full error for debugging
    console.error('Fetch LeetCode Rating Error:', error.message, error.response?.data);
    throw new Error(`Failed to fetch LeetCode rating: ${error.message}`);
  }
}

// Main function to update LeetCode data
async function leetcodeData(userId, username) {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID provided');
  }
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid LeetCode username provided');
  }

  try {
    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found in database');
    }

    // Initialize rating object if not exists
    user.rating = user.rating || {};

    // Fetch LeetCode rating
    const rating = await fetchLeetcodeRating(username);

    // Update rating if available
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