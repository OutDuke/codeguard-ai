<!--
Sync Impact Report
- Version change: template (unratified) -> 1.0.0
- Modified principles: placeholder principles -> twelve initial CodeGuard AI principles
- Added sections: Security and Data Constraints; Development Workflow and Quality Gates
- Removed sections: none
- Follow-up TODOs: none
-->
# CodeGuard AI Constitution

## Core Principles

### I. Security-First Development (NON-NEGOTIABLE)
Security MUST be considered during design, implementation, review, testing, and deployment. Source
code, dependency data, pull-request content, logs, and generated artifacts MUST be treated as
sensitive by default. Inputs from repositories and external systems MUST be validated and handled
as untrusted. Access MUST use least privilege, and security-sensitive operations MUST fail closed.
The rationale is that CodeGuard AI operates on valuable source code and within trusted GitHub
workflows, so a security failure can directly affect users and repositories.

### II. Human-in-the-Loop Authority (NON-NEGOTIABLE)
AI-generated findings, test suggestions, patches, comments, and other changes MUST be presented for
human review and explicit approval before they alter a repository, pull request, or protected
workflow. AI output MUST be clearly identified as generated, and users MUST be able to reject or
modify it. The system MUST NOT merge code, push changes, or silently apply recommendations solely on
AI authority. Human accountability prevents probabilistic output from becoming an unreviewed action.

### III. Explicit Architectural Boundaries
Frontend, backend, AI agents, GitHub integration, and testing MUST remain separate modules with
documented responsibilities and explicit interfaces. GitHub-specific transport and authentication
MUST NOT leak into AI-agent logic; agents MUST NOT depend on frontend details; the frontend MUST NOT
access secrets or privileged GitHub credentials; and tests MUST exercise boundaries through stable
contracts. Cross-boundary dependencies and shared schemas MUST be intentional and documented. This
separation limits blast radius and keeps parallel work manageable.

### IV. Testable, Reproducible, and Explainable Agents
Every AI-agent operation MUST expose its relevant inputs, model and configuration identifier, prompt
or instruction version, tool activity, and structured output sufficiently for diagnosis and replay,
subject to privacy and secret-redaction requirements. Non-determinism MUST be controlled where the
provider permits and accounted for with deterministic fixtures, mocks, schema validation, and bounded
acceptance criteria. Agent decisions MUST include understandable reasoning or evidence rather than
unsupported conclusions. This makes AI behavior reviewable and prevents quality from depending on an
irreproducible demonstration.

### V. Automation from the Start
Automated testing and CI/CD MUST be established with the first functional change, not deferred until
the product is mature. Every branch and pull request MUST run the applicable formatting, linting,
type-checking, security, and test checks. Deployments MUST be repeatable and driven by versioned
configuration, with production-affecting steps protected by explicit approvals where appropriate.
Early automation provides rapid feedback and prevents manual release practices from becoming hidden
project dependencies.

### VI. No Hardcoded Secrets (NON-NEGOTIABLE)
API keys, GitHub tokens, credentials, private keys, webhook secrets, and other sensitive values MUST
NEVER appear in source code, tests, fixtures, committed configuration, documentation examples, logs,
or generated artifacts. Secrets MUST come from approved environment variables or secret-management
facilities, use least-privilege scopes, and be rotated if exposure is suspected. CI MUST include
secret scanning, and examples MUST use unmistakably fake placeholders. This rule reduces accidental
credential disclosure and repository compromise.

### VII. Actionable AI Review Findings
Every AI review finding MUST include a severity, a concise explanation of the issue and its evidence,
and specific remediation guidance. Findings MUST identify the relevant file and location when
available, distinguish confirmed defects from uncertain suggestions, and avoid claiming certainty
unsupported by evidence. Output that lacks any required field MUST be rejected by schema validation
or marked incomplete rather than published as a normal finding. Consistent, actionable findings let
developers assess risk and respond efficiently.

### VIII. Privacy-Conscious Data Handling
Repository and pull-request data MUST be collected, transmitted, retained, logged, and shared only to
the minimum extent required for an approved product function. The system MUST document what data is
sent to each external AI or infrastructure provider, enforce authorization for every access, redact
secrets and unnecessary personal data, and define deletion and retention behavior. User data MUST NOT
be used for unrelated analytics or model training without explicit informed consent. Privacy-aware
handling preserves developer trust and respects repository ownership.

### IX. Hackathon-Focused MVP
Work MUST prioritize the documented hackathon requirements and the smallest end-to-end experience
that demonstrates secure pull-request review and automated test generation. Features without a direct
requirement or demonstrated MVP need MUST be deferred to a documented backlog. New dependencies,
services, abstractions, and infrastructure MUST have an immediate use case; speculative scalability
and optional polish MUST NOT delay the core workflow. A narrow scope maximizes the chance of a stable,
demonstrable product within the available time.

### X. Documentation-Implementation Synchronization
Documentation, setup instructions, architecture diagrams, API contracts, configuration examples, and
user-visible behavior MUST be updated in the same change as the implementation they describe. A pull
request that changes behavior or an interface MUST identify and update affected documentation, or
state verifiably why no documentation change is needed. Stale instructions MUST be treated as a
defect. Synchronized documentation allows all team members and evaluators to reproduce the project.

### XI. Four-Person-Team Maintainability
Architecture and code MUST remain understandable and maintainable by a four-person student team.
Solutions MUST favor clear naming, small cohesive modules, conventional patterns, and minimal
operational burden over clever abstractions or unnecessary distributed systems. Complexity MUST be
justified in the relevant specification or pull request, including its owner and testing approach.
Critical workflows MUST NOT depend on knowledge held by only one team member. This keeps development,
review, debugging, and handoff feasible during the hackathon.

### XII. Tested Functionality and Enforced Quality Gates
Major functionality MUST have automated tests at the appropriate level: unit tests for isolated
logic, contract or integration tests for module boundaries and external adapters, and end-to-end tests
for critical user workflows. Bug fixes MUST include a regression test where practical. Required tests
and quality checks MUST pass before merge; bypasses MUST be documented, explicitly approved, and
time-bounded with a follow-up issue. Tests MUST be reliable, independent, and suitable for CI. Quality
gates turn project expectations into repeatable evidence.

## Security and Data Constraints

- GitHub App permissions, tokens, and third-party provider access MUST use the minimum scopes needed
  for the implemented workflow and MUST be reviewed when functionality changes.
- Repository content MUST be isolated by installation, organization, and repository authorization;
  cached or persisted content MUST NOT cross tenant boundaries.
- Logs and telemetry MUST exclude source content, credentials, raw prompts, and personal data by
  default. Any diagnostic exception MUST be explicit, access-controlled, redacted, and short-lived.
- External dependencies and AI providers MUST be documented with their purpose, data exposure, and
  failure behavior before integration.
- Destructive or write-capable GitHub operations MUST require explicit human intent, auditable
  authorization, and a safe recovery path.

## Development Workflow and Quality Gates

1. Every proposed feature MUST begin with a Spec Kit specification that identifies MVP relevance,
   architectural ownership, security and privacy impact, acceptance criteria, and test strategy.
2. Plans and tasks MUST preserve the frontend, backend, AI-agent, GitHub-integration, and testing
   boundaries. Any exception MUST be justified and approved during review.
3. Pull requests MUST be small enough for effective human review and MUST include evidence that the
   applicable automated checks pass.
4. Required CI gates MUST include formatting and linting, type or static analysis where supported,
   automated tests, dependency vulnerability checks, and secret scanning. Changes involving agents or
   integrations MUST also include schema or contract validation.
5. AI-agent changes MUST be evaluated against versioned fixtures or scenarios covering expected
   outputs, failure handling, severity assignment, reasoning, remediation, and secret redaction.
6. Documentation MUST be reviewed as part of the definition of done. The README and relevant design
   or runbook material MUST reflect the current runnable system.
7. A quality-gate exception MUST name the approver, rationale, risk, expiration, and follow-up work;
   exceptions MUST NOT weaken the non-negotiable secret or human-approval rules.

## Governance

This constitution is the highest-priority project governance document. Specifications, plans, tasks,
pull requests, and reviews MUST demonstrate compliance. If another project document conflicts with
this constitution, this constitution prevails until it is formally amended.

Amendments MUST be proposed in writing with the affected principles, rationale, compatibility impact,
and any required migration steps. Adoption requires explicit approval from a majority of the active
four-person team, including at least one reviewer other than the author. Amendments take effect only
when this file, its Sync Impact Report, version, and amendment date are updated together.

Constitution versions follow semantic versioning: MAJOR for removal or incompatible redefinition of a
principle or governance rule; MINOR for a new principle or materially expanded requirement; PATCH for
clarifications that do not change obligations. The initial ratification is version 1.0.0.

Every feature specification and pull request review MUST include a constitution check. Before a
release or hackathon submission, the team MUST review all principles and required quality gates,
record unresolved exceptions, and reject release when a non-negotiable rule is violated. Complexity
and scope MUST be challenged against Principles IX and XI during planning and review.

**Version**: 1.0.0 | **Ratified**: 2026-08-08 | **Last Amended**: 2026-08-08
