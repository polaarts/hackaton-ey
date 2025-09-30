# Research: Reports Time-Range API Endpoint

## Decision: Next.js Runtime & Hosting Strategy
- **Choice**: Use the Node.js (Edge disabled) runtime for `src/app/api/reports/route.ts`.
- **Rationale**: Drizzle ORM with the Supabase Postgres client relies on Node drivers (`pg`). Edge runtime lacks full Node APIs and TCP sockets required for Postgres connections.
- **Alternatives Considered**:
  - Edge runtime with HTTP-based Supabase REST calls — rejected due to higher latency and reduced query flexibility (no complex joins, limited filtering).
  - Serverless functions with Prisma — rejected because project already standardizes on Drizzle.

## Decision: Drizzle Client Initialization Pattern
- **Choice**: Create a singleton `supabaseDrizzle` factory in `src/lib/drizzle/client.ts` that reuses a pooled connection (cached across invocations) and reads configuration from `process.env.NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
- **Rationale**: Minimizes connection churn in serverless contexts, prevents exceeding Supabase connection limits, and centralizes Drizzle configuration.
- **Alternatives Considered**:
  - Instantiating a new client per request — rejected due to connection overhead and risk of exhausting pool.
  - Relying on Supabase JS client without Drizzle — rejected because typed SQL builder and schema mapping ease maintenance.

## Decision: Operational Verification Strategy
- **Choice**: Use manual verification via curl/Postman combined with Supabase dashboard inspection. Record commands and expected responses in `quickstart.md`.
- **Rationale**: Team opted to skip automated tests; manual steps ensure coverage of success, empty, and failure paths before release.
- **Alternatives Considered**:
  - Automated Vitest + Supertest suite — rejected per stakeholder direction to omit tests.
  - Rely solely on Supabase dashboard views — rejected because it does not validate HTTP payload formatting or error handling.


