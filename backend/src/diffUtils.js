/** Computes files-changed / lines-added / lines-removed straight from diff text. */
function parseDiffStats(diffText) {
  const text = String(diffText || "");
  const filesChanged = (text.match(/^diff --git /gm) || []).length;

  let added = 0;
  let removed = 0;
  for (const line of text.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) added++;
    else if (line.startsWith("-")) removed++;
  }

  return {
    filesChanged: filesChanged || (text.trim() ? 1 : 0),
    linesAdded: added,
    linesRemoved: removed,
  };
}

/** Keeps the diff sent to the model within a safe size. */
function truncateDiff(diffText, maxChars = 40000) {
  const text = String(diffText || "");
  if (text.length <= maxChars) return text;
  return (
    text.slice(0, maxChars) +
    `\n\n... [diff truncated, ${text.length - maxChars} more characters omitted] ...`
  );
}

module.exports = { parseDiffStats, truncateDiff };
