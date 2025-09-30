# Data Model: Reports Time-Range API Endpoint

## Overview
The API returns vehicle incident reports stored in Supabase PostgreSQL. Drizzle ORM will map typed entities to tables. All datetime fields are stored as UTC timestamps and exposed as ISO-8601 strings.

## Entities & Tables

### reports
- **Primary Key**: `id` (`uuid`) — exposed as `reportId`.
- **Columns**:
  - `title` (`text`, not null)
  - `summary` (`text`, nullable)
  - `incident_datetime` (`timestamptz`, not null)
  - `license_plate` (`text`, nullable)
  - `vehicle_description` (`text`, nullable)
  - `image_description_raw` (`text`, nullable)
  - `confidence` (`numeric`, not null, check 0-1)
  - `notes` (`text`, nullable)
  - `created_at` (`timestamptz`, default now())
  - `updated_at` (`timestamptz`, default now())

### report_locations
- **Primary Key**: `report_id` (FK to `reports.id`).
- **Columns**:
  - `address` (`text`, not null)
  - `latitude` (`numeric`, nullable)
  - `longitude` (`numeric`, nullable)
- **Relationship**: One-to-one from reports → report_locations.

### report_timeline_events
- **Primary Key**: composite (`report_id`, `index`).
- **Columns**:
  - `report_id` (FK to `reports.id`)
  - `index` (`integer`, not null) — ordering key.
  - `address` (`text`, not null)
  - `datetime` (`timestamptz`, not null)
  - `source` (`text`, nullable)
  - `notes` (`text`, nullable)
- **Relationship**: One-to-many from reports.

### report_last_known_positions
- **Primary Key**: `report_id` (FK to `reports.id`).
- **Columns**:
  - `address` (`text`, not null)
  - `datetime` (`timestamptz`, nullable)
- **Relationship**: Optional one-to-one from reports.

### report_evidence
- **Primary Key**: composite (`report_id`, `url`).
- **Columns**:
  - `report_id` (FK to `reports.id`)
  - `url` (`text`, not null)
- **Relationship**: One-to-many from reports; represented as array of strings in API.

### report_recommended_actions
- **Primary Key**: composite (`report_id`, `action`).
- **Columns**:
  - `report_id` (FK to `reports.id`)
  - `action` (`text`, not null)
- **Relationship**: One-to-many from reports; represented as array of strings.

## Drizzle Mapping Notes
- Use `pgTable` with snake_case table names; map to camelCase fields during serialization.
- Use `integer` for indexes and `numeric` for decimal coordinates/confidence; convert to `number` in serializer.
- Include Drizzle relations via `relations()` helper for eager loading timeline events, location, evidence, and actions if needed.
- Apply `between` filter on `incident_datetime` using inclusive bounds in repository query.

## Validation Rules
- Ensure `start_time` ≤ `end_time`; inclusive comparisons in SQL (`>=`, `<=`).
- Dates parsed via `zod` schema in request handler to enforce ISO-8601 format.
- Confidence range enforced via database constraint and serializer fallback (default to 0 if null isn't allowed).


