# CodeGuard AI – Spec Kit Tasks

## Task Format

Each task includes:
- ID
- Owner
- Description
- Acceptance Criteria
- Dependencies

---

## PHASE 0 — Project Setup

### T-001: Initialize Repository Structure
**Owner:** Backend Lead  
**Description:** Create base project structure as defined in plan  
**Acceptance Criteria:**
- All core folders exist
- README initialized
- .env.example created
- Constitution and Plan committed

---

### T-002: Setup Development Environment
**Owner:** DevOps  
**Description:** Configure local dev setup and dependencies  
**Acceptance Criteria:**
- Backend runs locally
- Frontend runs locally
- Environment variables documented

---

## PHASE 1 — GitHub Integration

### T-003: GitHub Webhook Listener
**Owner:** Backend Lead  
**Description:** Create endpoint to receive PR events  
**Acceptance Criteria:**
- Receives PR opened/updated events
- Logs payload safely (no secrets)
- Returns 200 response

---

### T-004: PR Diff Fetcher
**Owner:** Backend Lead  
**Description:** Fetch PR diff using GitHub API  
**Acceptance Criteria:**
- Retrieves changed files
- Extracts diffs cleanly
- Handles API errors

**Dependencies:** T-003

---

### T-005: GitHub Comment Posting
**Owner:** Backend Lead  
**Description:** Post comments back to PR  
**Acceptance Criteria:**
- Comments appear on PR
- Supports structured AI output format

**Dependencies:** T-004

---

## PHASE 2 — AI Review Agent

### T-006: Prompt Template Design
**Owner:** AI Engineer  
**Description:** Create structured prompt for code review  
**Acceptance Criteria:**
- Includes severity, reasoning, fix
- Deterministic format
- Stored in version-controlled file

---

### T-007: AI Review Agent Implementation
**Owner:** AI Engineer  
**Description:** Build code review agent  
**Acceptance Criteria:**
- Takes PR diff as input
- Returns structured findings
- No unstructured output

**Dependencies:** T-006

---

### T-008: AI Output Validator
**Owner:** AI Engineer  
**Description:** Validate AI output schema  
**Acceptance Criteria:**
- Rejects malformed output
- Ensures all required fields exist

---

### T-009: Integrate AI with Backend
**Owner:** Backend Lead  
**Description:** Connect webhook → AI → response  
**Acceptance Criteria:**
- PR triggers AI review
- Output posted as GitHub comment

**Dependencies:** T-004, T-007

---

## PHASE 3 — Test Generation

### T-010: Test Generation Prompt
**Owner:** AI Engineer  
**Description:** Design prompt for generating unit tests  
**Acceptance Criteria:**
- Produces runnable test code
- Covers edge cases

---

### T-011: Test Generation Agent
**Owner:** AI Engineer  
**Description:** Implement test generator  
**Acceptance Criteria:**
- Accepts code diff
- Outputs valid test cases

**Dependencies:** T-010

---

### T-012: Test Validation Runner
**Owner:** DevOps  
**Description:** Run generated tests safely  
**Acceptance Criteria:**
- Tests execute in isolated environment
- Failures are reported

---

## PHASE 4 — Frontend

### T-013: Basic UI Setup
**Owner:** Frontend Dev  
**Description:** Initialize frontend app  
**Acceptance Criteria:**
- App runs locally
- Basic layout created

---

### T-014: PR Insights View
**Owner:** Frontend Dev  
**Description:** Display AI findings  
**Acceptance Criteria:**
- Shows severity, explanation, fixes
- Clean readable UI

---

### T-015: Approval Interface
**Owner:** Frontend Dev  
**Description:** Allow user to approve/reject AI suggestions  
**Acceptance Criteria:**
- Buttons for approve/reject
- State updates correctly

---

## PHASE 5 — CI/CD & Quality

### T-016: CI Pipeline Setup
**Owner:** DevOps  
**Description:** Setup GitHub Actions  
**Acceptance Criteria:**
- Runs on PR
- Executes tests
- Blocks failing PRs

---

### T-017: Linting & Formatting
**Owner:** DevOps  
**Description:** Enforce code quality  
**Acceptance Criteria:**
- Linter runs in CI
- Formatting rules applied

---

### T-018: Security Checks
**Owner:** DevOps  
**Description:** Add secret scanning & dependency checks  
**Acceptance Criteria:**
- Detects hardcoded secrets
- Flags vulnerable dependencies

---

## PHASE 6 — Documentation

### T-019: API Documentation
**Owner:** Backend Lead  
**Description:** Document endpoints  
**Acceptance Criteria:**
- All endpoints described
- Request/response examples included

---

### T-020: Architecture Documentation
**Owner:** AI Engineer  
**Description:** Document system design  
**Acceptance Criteria:**
- Diagrams included
- Matches implementation

---

### T-021: Setup Guide
**Owner:** DevOps  
**Description:** Write setup instructions  
**Acceptance Criteria:**
- New user can run project locally

---

## PHASE 7 — Finalization

### T-022: End-to-End Testing
**Owner:** Entire Team  
**Description:** Validate full workflow  
**Acceptance Criteria:**
- PR → AI review → comment → tests works

---

### T-023: Demo Preparation
**Owner:** Entire Team  
**Description:** Prepare hackathon demo  
**Acceptance Criteria:**
- Demo script ready
- Sample PR prepared

---

## Final Rule

No task is considered complete unless:
- It follows the Constitution
- It has test coverage (where applicable)
- It is documented