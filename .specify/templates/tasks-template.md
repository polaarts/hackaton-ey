# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: environment config, Supabase migrations, linting
   → Tests: contract tests, integration tests
   → Core: Next.js route handlers, BFF services, shared contracts
   → Integration: Supabase auth, storage, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js BFF single project**: `src/app`, `src/server`, `src/shared`, `tests/`
- **Additional services**: document explicitly in plan.md (rare; must be approved)

## Phase 3.1: Setup
- [ ] T001 Provision Supabase migration in `supabase/migrations/*`
- [ ] T002 Configure Next.js environment variables for Supabase and Vercel previews
- [ ] T003 [P] Configure linting, formatting, and logging scaffolding

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test for `src/app/api/[endpoint]/route.ts`
- [ ] T005 [P] Integration test covering Supabase auth flow in `tests/integration`
- [ ] T006 [P] Contract test for shared client/server types in `tests/contract`
- [ ] T007 [P] E2E scenario using Playwright or equivalent (if app-facing)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T008 [P] Implement Supabase data access helper in `src/server`
- [ ] T009 [P] Implement route handler in `src/app/api/[endpoint]/route.ts`
- [ ] T010 [P] Wire BFF service orchestration in `src/server/services`
- [ ] T011 Implement client components consuming BFF in `src/app`
- [ ] T012 Ensure runtime validation via `zod` or equivalent in shared contracts

## Phase 3.4: Integration
- [ ] T013 Connect Supabase auth/session refresh flows
- [ ] T014 Configure structured logging and error reporting
- [ ] T015 Verify Vercel preview deployment configuration

## Phase 3.5: Polish
- [ ] T016 [P] Add unit tests for server utilities in `tests/unit`
- [ ] T017 Capture performance baselines (e.g., Supabase query latency)
- [ ] T018 [P] Update developer docs in `docs/`
- [ ] T019 Remove duplication and tighten typings

## Dependencies
- Tests (T004-T007) before implementation (T008-T012)
- Supabase helper (T008) blocks route handler (T009) and orchestration (T010)
- Integration tasks require core implementation completed

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test for src/app/api/[endpoint]/route.ts"
Task: "Integration test covering Supabase auth flow in tests/integration"
Task: "Contract test for shared client/server types in tests/contract"
Task: "E2E scenario using Playwright or equivalent"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts, unreviewed services beyond BFF scope

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks
   
4. **Ordering**:
   - Setup → Tests → Models/Services → API routes → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] Vercel/Supabase deployment prerequisites covered