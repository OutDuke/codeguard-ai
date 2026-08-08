const { GoogleGenerativeAI } = require("@google/generative-ai");
const { truncateDiff } = require("./diffUtils");

const SYSTEM_PROMPT = `You write focused, runnable test cases for a code change.

Given a git diff and optionally a list of review findings, produce tests that:
- Cover the changed behavior.
- Regression-test important bugs.
- Cover security issues when relevant.
- Cover edge cases where appropriate.

Respond with ONLY a JSON object.
Do not use markdown fences.
Do not include explanations outside the JSON.

The JSON must have exactly this structure:

{
  "testNames": [
    "test_name_1()",
    "test_name_2()"
  ],
  "code": "complete test file as plain text"
}

Rules:
- testNames must contain 4-8 tests when enough behavior exists.
- Every test name must correspond to a test function in code.
- Generate syntactically valid test code.
- Use the same programming language as the changed code when possible.
- Use the standard/common test framework for that language.
- Python: pytest
- JavaScript/TypeScript: Jest
- Java: JUnit
- Do not invent APIs that are completely unrelated to the diff.
- Focus on the actual changes in the diff.
`;

function safeParseJsonObject(text) {
  let cleaned = String(text || "").trim();

  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    return null;
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  } catch {
    return null;
  }
}

async function generateTests(diffText, findings) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error(
      "GEMINI_API_KEY is not set on the server. Add it to backend/.env and restart."
    );

    err.status = 500;
    throw err;
  }

  const diff = truncateDiff(diffText, 20000);

  const findingsSummary = (findings || [])
    .slice(0, 12)
    .map(
      (f) =>
        `- [${f.severity}] ${f.title} (${f.file}:${f.line})`
    )
    .join("\n");

  const userMessage = [
    "Git diff:",
    diff || "(no diff provided)",
    findingsSummary
      ? `\nKnown review findings to regression-test:\n${findingsSummary}`
      : "",
  ].join("\n");

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

  const model = genAI.getGenerativeModel({
    model:
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash",

    systemInstruction: SYSTEM_PROMPT,

    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    userMessage
  );

  const text = result.response.text();

  const parsed = safeParseJsonObject(text);

  const testNames =
    Array.isArray(parsed?.testNames)
      ? parsed.testNames
          .filter(
            (test) => typeof test === "string"
          )
          .slice(0, 12)
      : [];

  const code =
    parsed &&
    typeof parsed.code === "string"
      ? parsed.code
      : "";

  if (!testNames.length || !code.trim()) {
    const err = new Error(
      "Gemini did not return usable test output. Try again."
    );

    err.status = 502;
    throw err;
  }

  return {
    testNames,
    code,
  };
}

module.exports = {
  generateTests,
};