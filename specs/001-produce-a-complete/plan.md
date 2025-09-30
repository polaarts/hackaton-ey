
# Implementation Plan: Reports Time-Range API Endpoint

**Branch**: `001-produce-a-complete` | **Date**: 2025-09-30 | **Spec**: `/specs/001-produce-a-complete/spec.md`
**Input**: Feature specification from `/specs/001-produce-a-complete/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
- Implement a Next.js API route at `/api/reports` that validates `start_time` and `end_time`, queries Supabase Postgres via Drizzle for reports within the inclusive range, and returns camelCased JSON sorted by `incidentDatetime`.
- Provide robust error handling (400 for validation failures, 5xx for unexpected errors) and support arbitrarily large time windows without truncation while maintaining ISO-8601 datetime serialization for all nested report fields.

## Technical Context
**Language/Version**: TypeScript (Next.js 15 app router)  
**Primary Dependencies**: Next.js 15, React 19, Drizzle ORM (PostgreSQL), Supabase JS client  
**Storage**: Supabase-managed PostgreSQL (reports + related tables)  
**Testing**: Vitest + Supertest (API route) with Drizzle mocking utilities  
**Target Platform**: Next.js API route running in Node.js runtime (serverless-ready)  
**Project Type**: Single web project (Next.js app + API routes)  
**Performance Goals**: No explicit latency SLA; focus on efficient filtering & serialization  
**Constraints**: Inclusive datetime filtering; support unbounded time ranges; camelCase serialization  
**Scale/Scope**: Single endpoint; expect up to thousands of reports per request

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ All clarifications resolved and captured in spec (no outstanding `NEEDS CLARIFICATION`).
- ✅ Scope fits within existing Next.js project; no additional projects introduced.
- ✅ Plan aligns with Constitution principles (documentation-first, tests before implementation).
- ⚠️ Ensure generated tests remain failing until implementation (verify during Phase 1 outputs).

## Project Structure

### Documentation (this feature)
```
specs/001-produce-a-complete/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── drizzle/
│   │   ├── client.ts
│   │   └── schema.ts
│   ├── reports/
│   │   ├── repository.ts
│   │   └── serializers.ts
│   └── utils/
│       └── datetime.ts

tests/
├── unit/
│   └── lib/reports/serializers.test.ts
├── integration/
│   └── api/reports.integration.test.ts
└── contract/
    └── api/reports.contract.test.ts
```

**Structure Decision**: Single Next.js project (app router) with API route under `src/app/api/reports/route.ts`, shared data access/helpers in `src/lib`, and dedicated `tests/` hierarchy for contract, integration, and unit coverage.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Confirm optimal Next.js runtime (Edge vs Node) for Supabase Drizzle API route compatibility.
   - Identify Drizzle client initialization pattern for Supabase connection reuse within API routes.
   - Determine Vitest + Supertest configuration for testing Next.js API routes in app directory.

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Next.js runtime choice for Supabase Drizzle API routes"
   Task: "Document Drizzle client initialization and schema usage with Supabase"
   Task: "Outline Vitest + Supertest setup for Next.js API route testing"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Document `Report`, `Location`, `TimelineDeVistaEntry`, `LastKnownPosition`, `EvidenceItem`, and derived arrays with Drizzle table mappings and primary keys.
   - Capture inclusive datetime filtering rules and serialization responsibilities (camelCase transformation, ISO-8601 formatting).

2. **Generate API contracts** from functional requirements:
   - Produce OpenAPI spec for `GET /api/reports` covering query params, success payload, and error schemas.
   - Include examples for populated and empty report responses to guide frontend integration.

3. **Generate contract tests** from contracts:
   - Create `tests/contract/api/reports.contract.test.ts` asserting response shape via OpenAPI validator (Ajv or similar) against generated spec.
   - Ensure tests fail pending API implementation.

4. **Extract test scenarios** from user stories:
   - Map user stories to integration tests: valid range with results, invalid/missing params, valid range with empty results, database error path.
   - Reflect these scenarios in `tests/integration/api/reports.integration.test.ts` using mocked Drizzle layer.

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If script missing, document remediation path before proceeding.
   - If exists: Add only NEW tech from current plan, preserve manual sections, keep under 150 lines.

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Start from `.specify/templates/tasks-template.md` baseline.
- Derive tasks from Phase 1 outputs: OpenAPI contract, data-model mappings, quickstart checklist.
- Include setup tasks for Drizzle schema/client, serializer utilities, and Supabase environment configuration.
- Add failing tests first (contract, integration, unit), followed by implementation tasks to satisfy them.

**Ordering Strategy**:
- Follow TDD: generate contract/schema artifacts, then failing tests, then implementation.
- Sequence data layer (Drizzle schema + repository) before API route logic, then serialization utilities.
- Mark [P] for independent tasks (e.g., serializer unit tests vs contract test) to allow parallel execution.

**Estimated Output**: Approximately 18-22 ordered tasks in `tasks.md` reflecting single-endpoint scope.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
