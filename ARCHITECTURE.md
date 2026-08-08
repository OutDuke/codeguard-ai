# CodeGuard AI Architecture

## Overview
CodeGuard AI is an AI-powered PR analysis tool that reviews code diffs,
detects risks, and generates test cases.

## Tech Stack
- Frontend: HTML + JS (Vercel)
- Backend: Node.js + Express (Render)
- AI: Google Gemini API

## Flow
User → Frontend → Backend → Gemini API → Response → UI

## Components

### Frontend
- Handles user input (PR URL / diff)
- Calls backend APIs

### Backend
- /api/analyze/pr
- /api/analyze/diff
- /api/tests/generate

### AI Layer
- Gemini analyzes diff
- Returns findings + risk score

## Deployment
- Frontend: Vercel
- Backend: Render