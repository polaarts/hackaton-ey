# Feature Specification: Reports Time-Range API Endpoint

**Feature Branch**: `001-produce-a-complete`  
**Created**: 2025-09-30  
**Status**: Draft  
**Input**: User description: "Produce a complete feature specification for a backend API endpoint that returns reports within a requested time range."

# Clarifications

### Session 2025-09-30
- Q: How are report datetime fields stored and expected to be interpreted? → A: All stored in UTC; treat query parameters and responses as UTC.
- Q: When pagination is introduced later, which pattern should we adopt? → A: Offset-based pagination with `page` and `pageSize` parameters.
- Q: What latency target should this endpoint meet under normal load? → A: No explicit latency target required.
- Q: What happens when the requested range spans a very large window (e.g., multiple years) and returns a high volume of reports? → A: Allow any range and return all matching incidents regardless of size.

## User Scenarios & Testing *(mandatory)*

### Primary User Story
An operations analyst visits the incident dashboard, selects a date range of interest, and retrieves all reports recorded within that window to review vehicle theft trends and actionable information.

### Acceptance Scenarios
1. **Given** the analyst supplies both `start_time` and `end_time` as valid ISO-8601 strings with `start_time` earlier than or equal to `end_time`, **When** they load the dashboard, **Then** the system returns a JSON payload containing all matching reports sorted by incident time ascending.
2. **Given** the analyst omits one or both time parameters or provides invalid formats, **When** the request is made, **Then** the system responds with an error message explaining the validation failure without exposing internal details.
3. **Given** the analyst requests a valid range with no matching reports, **When** the request is made, **Then** the system returns an empty `reports` array and a success status so the dashboard can render "no data" messaging.

### Edge Cases
- Large ranges that return many reports are allowed; return all matching incidents without truncation.
- How does system handle reports whose `incident_datetime` exactly equals the provided `start_time` or `end_time`? (Requirement: include them as range is inclusive.)
- How does the system respond if the database query fails (e.g., connectivity issue)? Return service error response with clear, non-sensitive messaging.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST expose a GET endpoint at `/api/reports` that accepts `start_time` and `end_time` query parameters.
- **FR-002**: System MUST validate that both parameters are present, formatted as ISO-8601 datetimes, and that `start_time` is less than or equal to `end_time`; invalid requests MUST return a 400 response with a descriptive error payload.
- **FR-003**: System MUST retrieve all reports whose `incident_datetime` falls within the inclusive range `[start_time, end_time]` using the existing PostgreSQL dataset accessed via Drizzle.
- **FR-004**: System MUST return results sorted by `incident_datetime` ascending.
- **FR-005**: System MUST serialize each report using camelCase keys to match dashboard expectations while preserving nested structures (location, sightings timeline, positions, arrays).
- **FR-006**: System MUST respond with HTTP 200 and a payload containing `reports: []` when no incidents match the requested range.
- **FR-007**: System MUST handle database or unexpected errors by returning an HTTP 500 (or appropriate 5xx) response with an error payload shaped as `{ "error": { "code": string, "message": string } }`.
- **FR-008**: System MUST ensure all datetime values in the response (e.g., `incidentDatetime`, `timelineEvents[].datetime`, `lastKnownPosition.datetime`) are returned as ISO-8601 strings.
- **FR-009**: System SHOULD document how future pagination will be supported using offset-based parameters (`page` and `pageSize`) without altering current response shape.

### Key Entities *(include if feature involves data)*
- **Report**: Represents a vehicle-related incident record filtered by time range. Attributes include `reportId`, `title`, `summary`, `incidentDatetime`, `licensePlate`, `vehicleDescription`, `imageDescriptionRaw`, `evidence[]`, `recommendedActions[]`, `confidence`, `notes`, and nested relationships.
- **Location**: Nested object describing where the incident occurred with `address`, `latitude`, and `longitude` sourced from the report record.
- **TimelineEvent**: Elements within `timelineEvents[]` describing sighting events, each with `index`, `address`, `datetime`, `source`, and `notes`.
- **LastKnownPosition**: Nested object capturing the most recent confirmed position with `address` and `datetime`.

## API Contract & Data Model

### Endpoint Overview
- **Method & Path**: `GET /api/reports`
- **Query Parameters**:
  - `start_time` (required ISO-8601 string): Inclusive lower bound for `incident_datetime`.
  - `end_time` (required ISO-8601 string): Inclusive upper bound for `incident_datetime`.

### Success Response (HTTP 200)
- **Body**:
  - `reports`: array of report objects sorted ascending by `incidentDatetime`.
    - Report fields:
      - `reportId`: string (UUID)
      - `title`: string
      - `summary`: string
      - `incidentDatetime`: ISO-8601 string
      - `location`: object `{ address: string, latitude: number|null, longitude: number|null }`
      - `licensePlate`: string|null
      - `vehicleDescription`: string|null
      - `imageDescriptionRaw`: string|null
      - `timelineEvents`: array of objects `{ index: number, address: string, datetime: ISO-8601 string, source: string|null, notes: string|null }`
      - `lastKnownPosition`: object `{ address: string, datetime: ISO-8601 string|null }`
      - `evidence`: array of URL strings
      - `recommendedActions`: array of strings
      - `confidence`: number between 0 and 1
      - `notes`: string|null

### Error Responses
- **400 Bad Request**: `{ "error": { "code": "INVALID_PARAMETERS", "message": "start_time and end_time must be valid ISO-8601 datetimes with start_time <= end_time." } }`
- **500 Internal Server Error** (or relevant 5xx): `{ "error": { "code": "INTERNAL_ERROR", "message": "Unexpected error retrieving reports." } }`

## Pagination Considerations
- Current release returns all matching reports without pagination to match dashboard MVP needs.
- Future implementation SHOULD add optional offset-based query parameters (`page`, `pageSize`) and include metadata such as `totalCount` while preserving backward compatibility.
- Default `pageSize` SHOULD be agreed with stakeholders during implementation; consider guardrails to prevent excessive payload size.
- Design must ensure pagination operates on deterministic ordering by `incidentDatetime` and `reportId` to avoid duplicates or gaps.

## Non-Functional Quality Attributes
- No explicit latency target required for initial release; observe usage to establish performance baselines and set targets in future iterations.

## Testing Strategy
- **Unit Tests**: Validate parameter parsing and schema rules (missing parameters, invalid formats, `start_time > end_time`). Simulate query builder inputs to ensure correct filtering boundaries.
- **Integration Tests**: Use mocked Drizzle responses to cover successful retrieval (with multiple reports), empty result sets, and database error propagation.
- **Error Handling Tests**: Ensure 400 responses include error details without leaking stack traces; ensure 500 responses follow error schema and log failures internally.
- **Regression Tests**: Verify camelCase serialization and sorting order, including ties sharing the same `incidentDatetime`.
- **Execution**: Run via `npm run test` (or project-standard test command) within CI and before deploying changes.

## Dependencies & Assumptions
- Reports data already resides in PostgreSQL and is accessible via existing Drizzle models.
- Dashboard frontend expects camelCase keys and ISO-8601 strings; no localization formatting required.
- All stored datetimes are UTC; clients must supply UTC ISO-8601 values and interpret responses in UTC to avoid timezone drift.

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
