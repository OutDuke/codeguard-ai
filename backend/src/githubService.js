const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

/**
 * Parses a GitHub PR URL like:
 * https://github.com/owner/repo/pull/42
 * into { owner, repo, number }
 */
function parsePrUrl(prUrl) {
  const match = String(prUrl || "")
    .trim()
    .match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);

  if (!match) {
    const err = new Error(
      "That doesn't look like a GitHub PR URL. Expected something like https://github.com/owner/repo/pull/42"
    );
    err.status = 400;
    throw err;
  }
  const [, owner, repo, number] = match;
  return { owner, repo: repo.replace(/\.git$/, ""), number: Number(number) };
}

function authHeaders(accept) {
  const headers = { Accept: accept, "User-Agent": "codeguard-ai" };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

/**
 * Fetches PR metadata (title, additions, deletions, changed_files) and the
 * raw unified diff text for a PR.
 */
async function fetchPullRequest(prUrl) {
  const { owner, repo, number } = parsePrUrl(prUrl);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;

  const [metaRes, diffRes] = await Promise.all([
    fetch(apiUrl, { headers: authHeaders("application/vnd.github+json") }),
    fetch(apiUrl, { headers: authHeaders("application/vnd.github.v3.diff") }),
  ]);

  if (!metaRes.ok) {
    const err = new Error(
      metaRes.status === 404
        ? `PR not found: ${owner}/${repo}#${number} (private repos need GITHUB_TOKEN set)`
        : `GitHub API error (${metaRes.status}) while fetching PR metadata`
    );
    err.status = metaRes.status === 404 ? 404 : 502;
    throw err;
  }
  if (!diffRes.ok) {
    const err = new Error(`GitHub API error (${diffRes.status}) while fetching PR diff`);
    err.status = 502;
    throw err;
  }

  const meta = await metaRes.json();
  const diff = await diffRes.text();

  return {
    pr: {
      number,
      title: meta.title || `${owner}/${repo}#${number}`,
      owner,
      repo,
    },
    stats: {
      filesChanged: meta.changed_files ?? undefined,
      linesAdded: meta.additions ?? undefined,
      linesRemoved: meta.deletions ?? undefined,
    },
    diff,
  };
}

module.exports = { parsePrUrl, fetchPullRequest };
