# CodeGuard AI — Gemini Backend

This backend powers the existing `codeguard-ai.html` frontend. It fetches GitHub PR diffs
(or accepts pasted diffs), sends them to Google Gemini for review, and returns the same
JSON shape the frontend already expects.

## 1. Install

```bash
npm install
```

## 2. Configure Gemini

Create a `.env` file in the backend folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=
PORT=8787
```

Get a Gemini API key from Google AI Studio. Keep the key on the backend; **do not put it
inside the HTML/JavaScript frontend**.

## 3. Run

```bash
npm start
```

You should see:

```text
CodeGuard AI backend listening on http://localhost:8787
```

## 4. Frontend

Open `codeguard-ai.html`. It calls:

```text
http://localhost:8787
```

The frontend health check now reads `geminiConfigured` instead of `anthropicConfigured`.

## API

### GET `/api/health`

Returns:

```json
{
  "ok": true,
  "geminiConfigured": true,
  "githubTokenConfigured": false
}
```

### POST `/api/analyze/pr`

```json
{
  "prUrl": "https://github.com/owner/repository/pull/42"
}
```

### POST `/api/analyze/diff`

```json
{
  "diff": "diff --git a/src/example.js b/src/example.js",
  "title": "My Diff Review"
}
```

### POST `/api/tests/generate`

Accepts optional `diff` and `findings`; otherwise it reuses the most recently analyzed diff.

## Notes

- GitHub fetching remains unchanged.
- Risk score is still calculated deterministically from finding severity.
- The frontend does not receive or store the Gemini API key.
- The backend keeps the last analysis in memory for test generation.
