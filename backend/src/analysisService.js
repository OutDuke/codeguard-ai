const { GoogleGenerativeAI } = require("@google/generative-ai");
const { truncateDiff } = require("./diffUtils");

const VALID_SEVERITIES = ["critical", "high", "medium", "low"];
const VALID_CATEGORIES = ["security", "bugs", "quality", "testing"];

const SYSTEM_PROMPT = `You are CodeGuard AI's static review engine. You review a unified git diff the way a senior engineer doing a thorough PR review would: for bugs, security vulnerabilities, missing error handling, missing tests, and code quality issues.

Respond with ONLY a JSON array of finding objects. No prose, no markdown fences, nothing before or after the array.

Each finding object must match this shape:
{
  "severity": "critical" | "high" | "medium" | "low",
  "category": "security" | "bugs" | "quality" | "testing",
  "title": "short specific title",
  "file": "file path",
  "line": 123,
  "description": "1-2 sentences describing the problem",
  "why": "1-2 sentences describing the impact",
  "badCode": [
    { "t": "code line", "c": "" | "rem" }
  ],
  "fixCode": [
    { "t": "code line", "c": "" | "add" }
  ]
}

Guidelines:
- Only flag issues actually visible in the diff.
- Do not invent files or lines.
- critical = exploitable security holes or serious data loss
- high = authentication or logic bugs with real user impact
- medium = correctness, validation, or quality issues
- low = style, documentation, or minor maintainability
- security = authentication, injection, secrets, access control
- bugs = crashes, logic errors, performance problems
- quality = readability, validation, consistency
- testing = missing or weak tests
- Keep badCode and fixCode short.
- Return at most 12 findings.
- Order findings by severity, critical first.
- If there are no meaningful issues, return [].
`;

function safeParseJsonArray(text) {
  let cleaned = String(text || "").trim();

  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    return [];
  }

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeFinding(raw, idx) {
  const severity = VALID_SEVERITIES.includes(raw?.severity)
    ? raw.severity
    : "medium";

  const category = VALID_CATEGORIES.includes(raw?.category)
    ? raw.category
    : "quality";

  const toLines = (arr) =>
    Array.isArray(arr)
      ? arr
          .filter((line) => line && typeof line.t === "string")
          .map((line) => ({
            t: line.t,
            c:
              line.c === "add" || line.c === "rem"
                ? line.c
                : "",
          }))
      : [];

  return {
    id: idx + 1,
    severity,
    category,
    title: String(raw?.title || "Untitled finding").slice(0, 140),
    file: String(raw?.file || "unknown file"),
    line: Number.isFinite(Number(raw?.line))
      ? Number(raw.line)
      : 1,
    description: String(raw?.description || "").slice(0, 600),
    why: String(raw?.why || "").slice(0, 600),
    badCode: toLines(raw?.badCode).slice(0, 10),
    fixCode: toLines(raw?.fixCode).slice(0, 10),
  };
}

function computeRiskScore(findings) {
  const weights = {
    critical: 32,
    high: 16,
    medium: 6,
    low: 2,
  };

  const raw = findings.reduce(
    (sum, finding) =>
      sum + (weights[finding.severity] || 0),
    0
  );

  return Math.max(0, Math.min(100, raw));
}

async function analyzeDiff(diffText) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error(
      "GEMINI_API_KEY is not set on the server. Add it to backend/.env and restart."
    );

    err.status = 500;
    throw err;
  }

  const diff = truncateDiff(diffText);

  if (!diff.trim()) {
    const err = new Error("No diff content to analyze.");
    err.status = 400;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

  const model = genAI.getGenerativeModel({
    model:
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    `Review this Git diff:\n\n${diff}`
  );

  const response = result.response;
  const text = response.text();

  const rawFindings = safeParseJsonArray(text);

  const findings = rawFindings.map(
    sanitizeFinding
  );

  const severityOrder = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  findings.sort(
    (a, b) =>
      severityOrder[a.severity] -
      severityOrder[b.severity]
  );

  findings.forEach(
    (finding, index) => {
      finding.id = index + 1;
    }
  );

  return {
    findings,
    riskScore: computeRiskScore(findings),
  };
}

module.exports = {
  analyzeDiff,
  computeRiskScore,
};