# Tasks: Reports Time-Range API Endpoint

**Input**: `plan.md`, forthcoming `research.md`, `data-model.md`, `contracts/reports.openapi.yaml`, `quickstart.md`
**Prerequisites**: Node.js 18+, npm, Supabase service key/URL

## Phase 3.1: Setup & Design Finalization
- [X] T001 Capture runtime and tooling decisions in `specs/001-produce-a-complete/research.md` (Next.js runtime, Drizzle init pattern, operational verification strategy). Blocks T007-T012.
- [X] T002 Document entities and relationships in `specs/001-produce-a-complete/data-model.md` with Drizzle table mappings. Blocks T007-T011.
- [X] T003 Author OpenAPI spec for `GET /api/reports` in `specs/001-produce-a-complete/contracts/reports.openapi.yaml` (success + error payload examples). Blocks T012, T015.
- [X] T004 Write execution steps and manual verification checklist in `specs/001-produce-a-complete/quickstart.md` covering happy path, empty set, and error scenarios. Blocks T013, T015.
- [X] T005 Run `.specify/scripts/bash/update-agent-context.sh cursor` to append new tech context in repository root. Blocks downstream automation relying on agent hints.
- [X] T006 Add backend dependencies (`drizzle-orm`, `pg`, `@supabase/supabase-js`, `drizzle-kit`, `zod`) to `package.json` and install them. Blocks T007-T016.

## Phase 3.2: Core Implementation
- [X] T007 Define Drizzle schema for reports, locations, timeline entries, and related tables in `src/lib/drizzle/schema.ts`. Depends on T002, T006.
- [X] T008 Implement Supabase-aware Drizzle client factory with connection reuse in `src/lib/drizzle/client.ts`. Depends on T001, T006, T007.
- [X] T009 Implement report repository query (`findByTimeRange`) with inclusive bounds + sorting in `src/lib/reports/repository.ts`. Depends on T001-T008.
- [X] T010 Implement serialization + input validation helpers (ISO-8601 formatting, camelCase) in `src/lib/reports/serializers.ts`. Depends on T002, T006, T009.
- [X] T011 Add datetime parsing utilities (ISO validation, range comparison) in `src/lib/utils/datetime.ts`. Depends on T001, T006.
- [X] T012 Implement `GET /api/reports` handler with validation, repository call, and error mapping in `src/app/api/reports/route.ts`. Depends on T003, T004, T009-T011.
- [X] T013 Enhance logging and unexpected error handling (500 payload contract) within `src/app/api/reports/route.ts` using shared logger/util. Depends on T012.

## Phase 3.3: Integration & Ops
- [X] T014 Document required Supabase env variables and provide `.env.local.example` plus README snippet. Depends on T006, T012.
- [ ] T015 Perform manual verification steps (e.g., curl/Postman, Supabase dashboard) per `quickstart.md` and record outcomes. Depends on T004, T012-T014.

## Phase 3.4: Polish & Documentation
- [ ] T016 [P] Update `specs/001-produce-a-complete/quickstart.md` with final verification results and troubleshooting tips. Depends on T004, T015.
- [X] T017 [P] Add developer notes to `README.md` describing endpoint contract, sample request, and large-range handling. Depends on T003, T012-T015.

## Dependencies Summary
- Design artifacts (T001-T006) must be completed before core implementation (T007-T013).
- Repository and serialization layers (T009-T011) rely on schema and client setup (T007-T008).
- API route tasks (T012-T013) depend on data layer completion and documented contracts.
- Integration and polish tasks (T014-T017) run after core implementation succeeds.

## Parallel Execution Example
```
# During polish, run documentation updates together:
Task: "T016 Update quickstart with final verification results"
Task: "T017 Add API usage notes to README.md"
```

## Validation Checklist
- [ ] Design artifacts (research, data model, OpenAPI, quickstart) completed before implementation.
- [ ] Data layer tasks (schema, client, repository) finished prior to API handler work.
- [ ] Parallel-tagged tasks operate on distinct files.
- [ ] Deployment prerequisites (env variables, tooling) documented (T014).
- [ ] Manual verification recorded in quickstart and README (T015-T017).

