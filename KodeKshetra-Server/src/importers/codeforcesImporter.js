import axios from "axios";
import * as cheerio from "cheerio";
import { parseCodeforcesLimit, parseCodeforcesMemoryLimit, textFromNode } from "./helpers.js";
import { createImportError, summarizeError, wrapImportError } from "./importLogger.js";

async function fetchProblemMetadata(contestId, index, logger) {
  try {
    const response = await axios.get("https://codeforces.com/api/problemset.problems", {
      timeout: 30000,
    });

    if (response.data?.status !== "OK") {
      throw createImportError("Failed to fetch Codeforces metadata from API", {
        statusCode: 502,
        stage: "codeforces-metadata",
        details: {
          contestId,
          index,
          upstreamStatus: response.data?.status || null,
        },
      });
    }

    return response.data.result.problems.find(
      (problem) => String(problem.contestId) === String(contestId) && String(problem.index).toUpperCase() === String(index).toUpperCase()
    ) || null;
  } catch (error) {
    logger?.error("codeforces-metadata", "Failed to fetch Codeforces metadata", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to fetch Codeforces metadata",
      statusCode: 502,
      stage: "codeforces-metadata",
      details: {
        contestId,
        index,
      },
    });
  }
}

export default async function importCodeforcesProblem({ normalizedUrl, metadata, logger }) {
  try {
    logger?.info("scrape-codeforces", "Fetching Codeforces problem page", { normalizedUrl, problemId: metadata.problemId });
    const pageResponse = await axios.get(normalizedUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const apiProblem = await fetchProblemMetadata(metadata.contestId, metadata.index, logger);
    const $ = cheerio.load(pageResponse.data);
    const $statement = $(".problem-statement").first();

    if (!$statement.length) {
      throw createImportError("Could not parse Codeforces problem statement", {
        statusCode: 422,
        stage: "scrape-codeforces",
        details: {
          normalizedUrl,
          problemId: metadata.problemId,
        },
      });
    }

    const title = textFromNode($statement.find(".title").first())
      .replace(/^\d+\.[A-Za-z0-9]+\s*/, "")
      .trim();
    const timeLimitText = textFromNode($statement.find(".time-limit").first());
    const memoryLimitText = textFromNode($statement.find(".memory-limit").first());
    const descriptionParts = [];

    $statement.children().each((_, element) => {
      const $element = $(element);
      if (
        $element.hasClass("header") ||
        $element.hasClass("input-specification") ||
        $element.hasClass("output-specification") ||
        $element.hasClass("sample-tests") ||
        $element.hasClass("note")
      ) {
        return;
      }

      const text = textFromNode($element);
      if (text) {
        descriptionParts.push(text);
      }
    });

    const examples = [];
    $statement.find(".sample-test").each((_, sampleNode) => {
      const $sample = $(sampleNode);
      const input = textFromNode($sample.find(".input pre").first());
      const output = textFromNode($sample.find(".output pre").first());
      const explanationNode = $sample.find(".answer, .explanation").first();
      const explanation = explanationNode.length ? textFromNode(explanationNode) : "";

      examples.push({
        input,
        output,
        explanation,
      });
    });

    const importedProblem = {
      source: "codeforces",
      url: normalizedUrl,
      problemId: metadata.problemId,
      title,
      description: descriptionParts.join("\n\n").trim(),
      inputFormat: textFromNode($statement.find(".input-specification").first()),
      outputFormat: textFromNode($statement.find(".output-specification").first()),
      examples,
      note: textFromNode($statement.find(".note").first()),
      timeLimit: parseCodeforcesLimit(timeLimitText) || 2,
      memoryLimit: parseCodeforcesMemoryLimit(memoryLimitText) || 256000,
      tags: apiProblem?.tags || [],
      rating: apiProblem?.rating || 0,
    };

    logger?.info("scrape-codeforces", "Parsed Codeforces problem successfully", {
      problemId: importedProblem.problemId,
      title: importedProblem.title,
      sampleCount: importedProblem.examples.length,
    });

    return importedProblem;
  } catch (error) {
    logger?.error("scrape-codeforces", "Codeforces import failed", summarizeError(error));
    throw wrapImportError(error, {
      message: "Failed to import Codeforces problem",
      statusCode: 502,
      stage: "scrape-codeforces",
      details: {
        normalizedUrl,
        problemId: metadata.problemId,
      },
    });
  }
}
