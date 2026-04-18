function normalizeExample(example = {}) {
  return {
    input: String(example.input || "").trim(),
    output: String(example.output || "").trim(),
    explanation: String(example.explanation || "").trim(),
  };
}

export default function normalizeProblem(platform, scrapedProblem) {
  if (platform === "codeforces") {
    return {
      source: "codeforces",
      problemId: scrapedProblem.problemId,
      title: scrapedProblem.title,
      description: scrapedProblem.description,
      inputFormat: scrapedProblem.inputFormat || "",
      outputFormat: scrapedProblem.outputFormat || "",
      examples: (scrapedProblem.examples || []).map(normalizeExample),
      hiddenTests: [],
      note: scrapedProblem.note || "",
      tags: scrapedProblem.tags || [],
      rating: scrapedProblem.rating || 0,
      timeLimit: scrapedProblem.timeLimit || 2,
      memoryLimit: scrapedProblem.memoryLimit || 256,
    };
  }

  if (platform === "leetcode") {
    return {
      source: "leetcode",
      problemId: scrapedProblem.problemId,
      title: scrapedProblem.title,
      url: scrapedProblem.url,
      tags: scrapedProblem.tags || [],
      difficulty: scrapedProblem.difficulty,
      timeLimit: scrapedProblem.timeLimit || 2,
      memoryLimit: scrapedProblem.memoryLimit || 256000,
      description: scrapedProblem.description,
      constraints: scrapedProblem.constraints || [],
      sampleTests: (scrapedProblem.sampleTests || []).map(normalizeExample),
      hiddenTests: [],
      boilerplateCode: scrapedProblem.boilerplateCode || {},
      completeCodeTemplates: scrapedProblem.completeCodeTemplates || {},
      inputFormat: scrapedProblem.inputFormat || "",
      outputFormat: scrapedProblem.outputFormat || "",
      examples: (scrapedProblem.sampleTests || []).map(normalizeExample),
      note: (scrapedProblem.constraints || []).join("\n"),
      rating: 0,
    };
  }

  throw new Error("Unsupported platform for normalization");
}
