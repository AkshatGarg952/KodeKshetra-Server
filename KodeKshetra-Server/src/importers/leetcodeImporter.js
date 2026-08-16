import axios from "axios";
import * as cheerio from "cheerio";
import { htmlToText, safeJsonParse } from "./helpers.js";
import { createImportError, summarizeError, wrapImportError } from "./importLogger.js";

const QUESTION_QUERY = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      titleSlug
      content
      difficulty
      topicTags {
        name
        slug
      }
      codeSnippets {
        lang
        langSlug
        code
      }
      sampleTestCase
      exampleTestcases
      metaData
    }
  }
`;

function extractConstraints(contentHtml = "") {
  const $ = cheerio.load(contentHtml);
  const constraints = [];

  $("strong").each((_, node) => {
    const text = $(node).text().trim().toLowerCase();
    if (text.includes("constraints")) {
      const list = $(node).parent().next("ul");
      if (list.length) {
        list.find("li").each((__, li) => {
          const constraint = htmlToText($(li).html() || "");
          if (constraint) constraints.push(constraint);
        });
      }
    }
  });

  return constraints;
}

function extractExamples(contentHtml = "") {
  const $ = cheerio.load(contentHtml);
  const examples = [];

  $("pre").each((_, preNode) => {
    const text = htmlToText($(preNode).html() || "");
    if (!/Input:/i.test(text) || !/Output:/i.test(text)) {
      return;
    }

    const inputMatch = text.match(/Input:\s*([\s\S]*?)(?:\nOutput:|$)/i);
    const outputMatch = text.match(/Output:\s*([\s\S]*?)(?:\nExplanation:|$)/i);
    const explanationMatch = text.match(/Explanation:\s*([\s\S]*)$/i);

    examples.push({
      input: inputMatch ? inputMatch[1].trim() : "",
      output: outputMatch ? outputMatch[1].trim() : "",
      explanation: explanationMatch ? explanationMatch[1].trim() : "",
    });
  });

  return examples;
}

function normalizeCodeSnippets(codeSnippets = []) {
  const boilerplateCode = {};

  codeSnippets.forEach((snippet) => {
    if (["python3", "python"].includes(snippet.langSlug)) {
      boilerplateCode.python = {
        language: snippet.lang,
        languageSlug: "python",
        code: snippet.code,
      };
    } else if (snippet.langSlug === "cpp") {
      boilerplateCode.cpp = {
        language: snippet.lang,
        languageSlug: snippet.langSlug,
        code: snippet.code,
      };
    } else if (snippet.langSlug === "java") {
      boilerplateCode.java = {
        language: snippet.lang,
        languageSlug: snippet.langSlug,
        code: snippet.code,
      };
    }
  });

  return boilerplateCode;
}

export default async function importLeetCodeProblem({ normalizedUrl, metadata, logger }) {
  try {
    logger?.info("scrape-leetcode", "Fetching LeetCode problem metadata", {
      normalizedUrl,
      problemId: metadata.problemId,
    });
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: QUESTION_QUERY,
        variables: { titleSlug: metadata.titleSlug },
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          Referer: normalizedUrl,
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (response.data?.errors?.length) {
      throw createImportError("LeetCode query returned errors", {
        statusCode: 502,
        stage: "scrape-leetcode",
        details: {
          normalizedUrl,
          problemId: metadata.problemId,
          upstreamErrors: response.data.errors.map((error) => error.message),
        },
      });
    }

    const question = response.data?.data?.question;
    if (!question) {
      throw createImportError("LeetCode problem not found", {
        statusCode: 404,
        stage: "scrape-leetcode",
        details: {
          normalizedUrl,
          problemId: metadata.problemId,
        },
      });
    }

    const contentHtml = question.content || "";
    const metaData = safeJsonParse(question.metaData, {});
    const sampleTests = extractExamples(contentHtml);

    const importedProblem = {
      source: "leetcode",
      url: normalizedUrl,
      problemId: question.titleSlug,
      title: question.title,
      difficulty: question.difficulty,
      description: htmlToText(contentHtml),
      constraints: extractConstraints(contentHtml),
      sampleTests,
      tags: (question.topicTags || []).map((tag) => tag.slug || tag.name).filter(Boolean),
      boilerplateCode: normalizeCodeSnippets(question.codeSnippets || []),
      completeCodeTemplates: {},
      timeLimit: 2,
      memoryLimit: 256000,
      inputFormat: metaData?.name ? `${metaData.name}(${(metaData.params || []).map((param) => `${param.name}: ${param.type}`).join(", ")})` : "",
      outputFormat: metaData?.return ? String(metaData.return) : "",
    };

    logger?.info("scrape-leetcode", "Parsed LeetCode problem successfully", {
      problemId: importedProblem.problemId,
      title: importedProblem.title,
      sampleCount: importedProblem.sampleTests.length,
    });

    return importedProblem;
  } catch (error) {
    logger?.error("scrape-leetcode", "LeetCode import failed", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to import LeetCode problem",
      statusCode: 502,
      stage: "scrape-leetcode",
      details: {
        normalizedUrl,
        problemId: metadata.problemId,
      },
    });
  }
}
