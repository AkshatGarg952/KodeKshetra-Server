const VALID_STRATEGIES = new Set(['real_solver', 'assisted_solver']);
const VALID_LANGUAGES = new Set(['cpp', 'python', 'java', 'javascript']);

const sanitizeMultiline = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\u0000/g, '').trim();
};

export default function normalizeAISolverResult(rawResult = {}, fallbackLanguage = 'python') {
  const strategy = VALID_STRATEGIES.has(rawResult.strategy)
    ? rawResult.strategy
    : 'real_solver';

  const language = VALID_LANGUAGES.has(rawResult.language)
    ? rawResult.language
    : fallbackLanguage;

  return {
    strategy,
    language,
    generatedCode: sanitizeMultiline(rawResult.generatedCode),
    confidence: Number.isFinite(rawResult.confidence)
      ? Math.max(0, Math.min(rawResult.confidence, 1))
      : 0,
    attempts: Number.isFinite(rawResult.attempts) ? rawResult.attempts : 1
  };
}
