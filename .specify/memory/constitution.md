<!-- Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: n/a (new constitution)
Added sections: Core Principles, Delivery Constraints, Workflow Expectations, Governance
Removed sections: None
Templates requiring updates: ✅ /.specify/templates/plan-template.md, ✅ /.specify/templates/spec-template.md, ✅ /.specify/templates/tasks-template.md, ⚠️ /README.md (consider aligning onboarding with Supabase/Vercel workflow)
Follow-up TODOs: None
-->
# Next.js BFF Constitution

## Core Principles

### TypeScript-First Next.js
All application code MUST be authored in TypeScript using `strict` mode. Runtime type
validation MUST guard all external inputs, including Supabase payloads and URL params.
Rationale: Ensures predictable typing, reduces runtime bugs, and aligns with Next.js +
Supabase ecosystem tooling.

### Backend-for-Frontend Isolation
Server-side logic MUST operate as a thin BFF layer that orchestrates Supabase and other
services on behalf of the Next.js frontend. No shared backend endpoints MAY be exposed
to third parties without explicit review. Rationale: Keeps domain logic close to the UI
while preventing accidental backend sprawl.

### Supabase-Centric Data Layer
All persistent state MUST live in Supabase (database, auth, storage) unless governance
approves an exception. Database schema migrations MUST run through Supabase tooling and
include rollback plans. Rationale: Guarantees a single source of truth and leverages
managed capabilities.

### Predictable Deployments on Vercel
Deployments MUST target Vercel using environment-protected workflows. Preview
deployments MUST include Supabase migrations staged against isolated branches before
promotion. Rationale: Protects production stability and matches hosting strategy.

### Observability & Error Discipline
Every API route, server-side function, and Supabase interaction MUST emit structured
logs and surface critical errors via alerting. Client-visible failures MUST render user
friendly fallbacks. Rationale: Rapid diagnosis and user trust depend on consistent
observability.

## Delivery Constraints

Feature work MUST respect Next.js App Router conventions, colocate server utilities in
`src/server`, and keep shared contracts in `src/shared`. Authentication flows MUST rely
on Supabase Auth helpers. No Server Actions are permitted; use API routes or Route
Handlers instead. Rationale: Enforces architectural boundaries aligned with BFF goals.

## Workflow Expectations

All work MUST follow TDD: write failing tests (unit, integration, or contract) before
implementation. Pull requests MUST document constitution compliance, capture Supabase
migration diffs, and include Vercel preview links. Rationale: Creates predictable
reviews and ensures runtime safety prior to merge.

## Governance

Amendments require RFC approval from the platform maintainers, recorded in `/docs/rfc/`
with migration guidance. Versioning follows semantic rules; each amendment updates the
constitution version and date below. Compliance reviews run at sprint close; unresolved
violations escalate to maintainers and block release.

**Version**: 1.0.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30