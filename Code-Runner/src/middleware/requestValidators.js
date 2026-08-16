const supportedLanguages = ["python", "cpp", "java", "javascript", "c", "csharp", "ruby", "go", "rust"];
const MAX_CODE_LENGTH = Number(process.env.MAX_CODE_LENGTH || 100000);
const MAX_CUSTOM_TESTCASES = Number(process.env.MAX_CUSTOM_TESTCASES || 25);

function validateCodePayload(code, res) {
  if (!code || typeof code !== "string") {
    return res.status(400).json({
      error: 'Missing or invalid "code" field (must be a non-empty string)',
      success: false,
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return res.status(413).json({
      error: `Code payload too large. Maximum supported length is ${MAX_CODE_LENGTH} characters.`,
      success: false,
    });
  }

  return null;
}

function validateLanguage(language, res) {
  if (!language || !supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid or unsupported language. Supported: ${supportedLanguages.join(", ")}`,
      success: false,
    });
  }

  return null;
}

export function validateRunRequest(req, res, next) {
  const { code, language, problem } = req.body;

  const codeValidationError = validateCodePayload(code, res);
  if (codeValidationError) {
    return codeValidationError;
  }

  const languageValidationError = validateLanguage(language, res);
  if (languageValidationError) {
    return languageValidationError;
  }
  req.body.language = language.toLowerCase();

  if (!problem || typeof problem !== "object") {
    return res.status(400).json({
      error: 'Missing or invalid "problem" field (must be an object)',
      success: false,
    });
  }

  next();
}

export function validateExecuteRequest(req, res, next) {
  const { code, language, inputs, problem } = req.body;

  const codeValidationError = validateCodePayload(code, res);
  if (codeValidationError) {
    return codeValidationError;
  }

  const languageValidationError = validateLanguage(language, res);
  if (languageValidationError) {
    return languageValidationError;
  }
  req.body.language = language.toLowerCase();

  const normalizedInputs = inputs || problem?.testCases?.map((testcase) => (
    typeof testcase === "object" && testcase !== null && testcase.input ? testcase.input : testcase
  ));

  if (!Array.isArray(normalizedInputs) || normalizedInputs.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: code, language, and inputs (array) or problem.testCases',
      success: false,
    });
  }

  if (normalizedInputs.length > MAX_CUSTOM_TESTCASES) {
    return res.status(413).json({
      error: `Too many custom testcases. Maximum supported count is ${MAX_CUSTOM_TESTCASES}.`,
      success: false,
    });
  }

  if (normalizedInputs.some((input) => typeof input !== "string")) {
    return res.status(400).json({
      error: 'Each custom input must be a string.',
      success: false,
    });
  }

  req.body.inputs = normalizedInputs;
  next();
}

