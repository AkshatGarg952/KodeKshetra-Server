const SUPPORTED_HOSTS = {
  codeforces: new Set(["codeforces.com", "www.codeforces.com"]),
  leetcode: new Set(["leetcode.com", "www.leetcode.com"]),
};

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed;
  } catch {
    throw new Error("Invalid problem URL");
  }
}

export default function detectPlatform(url) {
  const parsedUrl = normalizeUrl(url);
  const host = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.replace(/\/+$/, "");

  if (SUPPORTED_HOSTS.codeforces.has(host)) {
    const match = pathname.match(/^\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)$/);
    if (!match) {
      throw new Error("Unsupported Codeforces URL format. Use /problemset/problem/{contestId}/{index}");
    }

    const [, contestId, index] = match;
    return {
      platform: "codeforces",
      normalizedUrl: parsedUrl.toString(),
      metadata: {
        contestId,
        index,
        problemId: `${contestId}-${index.toUpperCase()}`,
      },
    };
  }

  if (SUPPORTED_HOSTS.leetcode.has(host)) {
    const match = pathname.match(/^\/problems\/([a-z0-9-]+)$/i);
    if (!match) {
      throw new Error("Unsupported LeetCode URL format. Use /problems/{title-slug}/");
    }

    const [, titleSlug] = match;
    return {
      platform: "leetcode",
      normalizedUrl: parsedUrl.toString(),
      metadata: {
        titleSlug,
        problemId: titleSlug,
      },
    };
  }

  throw new Error("Unsupported problem host. Only LeetCode and Codeforces URLs are supported.");
}
