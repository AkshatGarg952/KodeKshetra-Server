import axios from 'axios';

export async function decideWinner(code, language, problem) {
  
  try {
    const response = await axios.post('https://code-runner-lhdb.onrender.com/run-all', {
      code,
      language,
      problem
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.passed || 0;

  } catch (err) {
    console.error('Error calling /run-all:', err.message);
    return 0;
  }
}
