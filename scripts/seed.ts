import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../src/lib/drizzle/schema";
import {
  reportEvidence,
  reportLastKnownPositions,
  reportLocations,
  reportRecommendedActions,
  reportTimelineEvents,
  reports,
} from "../src/lib/drizzle/schema";
import reportsSeedJson from "../src/data/reports.seed.json";

config({ path: "../.env.local" });

type SeedReport = {
  reportId: string;
  title: string;
  summary?: string | null;
  incidentDatetime: string;
  licensePlate?: string | null;
  vehicleDescription?: string | null;
  imageDescriptionRaw?: string | null;
  confidence: number;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  location?: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  lastKnownPosition?: {
    address: string;
    datetime?: string | null;
  } | null;
  timelineEvents?: Array<{
    index: number;
    address: string;
    datetime: string;
    source?: string | null;
    notes?: string | null;
  }>;
  evidence?: string[] | null;
  recommendedActions?: string[] | null;
};

const reportsSeed = reportsSeedJson as SeedReport[];

type Database = NodePgDatabase<typeof schema>;
type TransactionCallback = Parameters<Database["transaction"]>[0];
type TransactionClient = TransactionCallback extends (tx: infer T) => Promise<unknown> ? T : never;

type NullableDate = Date | null;

function parseDate(value: string | null | undefined): NullableDate {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid datetime value encountered: ${value}`);
  }

  return parsed;
}

async function seedReport(tx: TransactionClient, report: SeedReport) {
  await tx.insert(reports).values({
    id: report.reportId,
    title: report.title,
    summary: report.summary ?? null,
    incidentDatetime: parseDate(report.incidentDatetime)!,
    licensePlate: report.licensePlate ?? null,
    vehicleDescription: report.vehicleDescription ?? null,
    imageDescriptionRaw: report.imageDescriptionRaw ?? null,
    confidence: report.confidence,
    notes: report.notes ?? null,
    createdAt: parseDate(report.createdAt) ?? undefined,
    updatedAt: parseDate(report.updatedAt) ?? undefined,
  });

  if (report.location) {
    await tx.insert(reportLocations).values({
      reportId: report.reportId,
      address: report.location.address,
      latitude: report.location.latitude ?? null,
      longitude: report.location.longitude ?? null,
    });
  }

  if (report.lastKnownPosition) {
    await tx.insert(reportLastKnownPositions).values({
      reportId: report.reportId,
      address: report.lastKnownPosition.address,
      datetime: parseDate(report.lastKnownPosition.datetime ?? null),
    });
  }

  if (report.timelineEvents?.length) {
    await tx.insert(reportTimelineEvents).values(
      report.timelineEvents.map((event) => ({
        reportId: report.reportId,
        index: event.index,
        address: event.address,
        datetime: parseDate(event.datetime)!,
        source: event.source ?? null,
        notes: event.notes ?? null,
      })),
    );
  }

  if (report.evidence?.length) {
    await tx.insert(reportEvidence).values(
      report.evidence.map((url) => ({
        reportId: report.reportId,
        url,
      })),
    );
  }

  if (report.recommendedActions?.length) {
    await tx.insert(reportRecommendedActions).values(
      report.recommendedActions.map((action) => ({
        reportId: report.reportId,
        action,
      })),
    );
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to your environment before running the seed script.");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  const db: Database = drizzle(pool, { schema });

  console.log(`Seeding ${reportsSeed.length} report records...`);

  try {
    await db.transaction(async (tx) => {
      await tx.delete(reportTimelineEvents);
      await tx.delete(reportEvidence);
      await tx.delete(reportRecommendedActions);
      await tx.delete(reportLastKnownPositions);
      await tx.delete(reportLocations);
      await tx.delete(reports);

      for (const report of reportsSeed) {
        await seedReport(tx, report);
      }
    });

    console.log("Database seeded successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});
