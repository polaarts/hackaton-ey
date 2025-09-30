# Quickstart: Reports Time-Range API Endpoint

## Prerequisites
- Node.js 18+
- Supabase project with reports data and service role key
- Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill Supabase credentials.
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```

## Manual Verification Scenarios

### 1. Happy Path (Reports Found)
- **Request**:
  ```bash
  curl "http://localhost:3000/api/reports?start_time=2025-09-01T00:00:00Z&end_time=2025-09-30T23:59:59Z"
  ```
- **Expected**:
  - HTTP 200
  - JSON payload with `reports` array sorted ascending by `incidentDatetime`.

### 2. Empty Result
- **Request**:
  ```bash
  curl "http://localhost:3000/api/reports?start_time=1990-01-01T00:00:00Z&end_time=1990-01-02T00:00:00Z"
  ```
- **Expected**:
  - HTTP 200
  - `reports: []`

### 3. Invalid Parameters
- **Request**:
  ```bash
  curl "http://localhost:3000/api/reports?start_time=invalid&end_time=2025-09-30T23:59:59Z"
  ```
- **Expected**:
  - HTTP 400
  - Error payload matching OpenAPI contract (`INVALID_PARAMETERS`).

### 4. Simulated Database Error
- Temporarily throw an error in repository or set Supabase credentials invalid.
- **Expected**:
  - HTTP 500
  - Error payload `{ error: { code: "INTERNAL_ERROR", message: "Unexpected error retrieving reports." } }`

## Post-Verification
- Ensure the dev server is running (`npm run dev`) before issuing curl/Postman requests; the endpoint requires Supabase credentials and seed data to return reports.
- Restore any temporary code changes used for error simulation.
- Record observed outputs here once implementation is complete, noting whether each scenario matched expectations.


