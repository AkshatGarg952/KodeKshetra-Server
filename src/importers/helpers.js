import * as cheerio from "cheerio";

export function htmlToText(html = "") {
  const withLineBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n");
  const $ = cheerio.load(withLineBreaks);
  return $.text()
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function textFromNode($node) {
  return htmlToText($node.html() || "");
}

export function parseCodeforcesLimit(limitText = "") {
  const cleaned = limitText.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/([\d.]+)/);
  return match ? Number(match[1]) : null;
}

export function parseCodeforcesMemoryLimit(limitText = "") {
  const value = parseCodeforcesLimit(limitText);
  if (!value) return null;

  const cleaned = limitText.toLowerCase();
  if (cleaned.includes("gigabyte")) {
    return value * 1000 * 1000;
  }
  if (cleaned.includes("megabyte")) {
    return value * 1000;
  }
  if (cleaned.includes("kilobyte")) {
    return value;
  }

  return value;
}

export function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
