require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { fetchPullRequest } = require("./src/githubService");
const { parseDiffStats } = require("./src/diffUtils");
const { analyzeDiff } = require("./src/analysisService");
const { generateTests } = require("./src/testGenService");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// simple in-memory cache of the last analysis, so /api/tests/generate
// can reuse the diff without the frontend re-sending it
let lastAnalysis = null;

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
  });
});

/**
 * POST /api/analyze/pr
 * body: { prUrl: string }
 */
app.post("/api/analyze/pr", async (req, res) => {
  try {
    const { prUrl } = req.body || {};
    if (!prUrl) return res.status(400).json({ error: "prUrl is required" });

    const { pr, stats: ghStats, diff } = await fetchPullRequest(prUrl);
    const fallbackStats = parseDiffStats(diff);
    const stats = {
      filesChanged: ghStats.filesChanged ?? fallbackStats.filesChanged,
      linesAdded: ghStats.linesAdded ?? fallbackStats.linesAdded,
      linesRemoved: ghStats.linesRemoved ?? fallbackStats.linesRemoved,
    };

    const { findings, riskScore } = await analyzeDiff(diff);

    lastAnalysis = { diff, findings };
    res.json({ pr, stats, riskScore, findings, source: "github" });
  } catch (err) {
    console.error("[/api/analyze/pr]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

/**
 * POST /api/analyze/diff
 * body: { diff: string, title?: string }
 */
app.post("/api/analyze/diff", async (req, res) => {
  try {
    const { diff, title } = req.body || {};
    if (!diff || !diff.trim()) return res.status(400).json({ error: "diff is required" });

    const stats = parseDiffStats(diff);
    const { findings, riskScore } = await analyzeDiff(diff);

    lastAnalysis = { diff, findings };
    res.json({
      pr: { number: null, title: title || "Pasted Diff Review" },
      stats,
      riskScore,
      findings,
      source: "diff",
    });
  } catch (err) {
    console.error("[/api/analyze/diff]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

/**
 * POST /api/tests/generate
 * body: { diff?: string, findings?: array }
 * Falls back to the most recently analyzed diff/findings if not provided.
 */
app.post("/api/tests/generate", async (req, res) => {
  try {
    const diff = req.body?.diff || lastAnalysis?.diff || "";
    const findings = req.body?.findings || lastAnalysis?.findings || [];

    if (!diff.trim()) {
      return res
        .status(400)
        .json({ error: "No diff available. Run an analysis first or pass `diff` in the body." });
    }

    const { testNames, code } = await generateTests(diff, findings);
    res.json({ testNames, code });
  } catch (err) {
    console.error("[/api/tests/generate]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`CodeGuard AI backend listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is not set — analysis requests will fail. See your .env file");
  }
});
