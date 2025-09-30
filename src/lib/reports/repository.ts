import { and, asc, inArray, gte, lte } from "drizzle-orm";

import { getDb } from "../drizzle/client";
import {
  reportEvidence,
  reportLastKnownPositions,
  reportLocations,
  reportRecommendedActions,
  reportTimelineEvents,
  reports,
  type ReportEvidenceRow,
  type ReportLastKnownPositionRow,
  type ReportLocationRow,
  type ReportRecommendedActionRow,
  type ReportTimelineEventRow,
  type ReportRow,
} from "../drizzle/schema";

export type ReportAggregate = {
  report: ReportRow;
  location?: ReportLocationRow | null;
  lastKnownPosition?: ReportLastKnownPositionRow | null;
  timelineEvents: ReportTimelineEventRow[];
  evidence: ReportEvidenceRow[];
  recommendedActions: ReportRecommendedActionRow[];
};

export type {
  ReportEvidenceRow,
  ReportRecommendedActionRow,
  ReportTimelineEventRow,
} from "../drizzle/schema";

export async function findReportsByTimeRange(
  start: Date,
  end: Date,
): Promise<ReportAggregate[]> {
  const db = getDb();

  const reportRows = await db
    .select()
    .from(reports)
    .where(
      and(gte(reports.incidentDatetime, start), lte(reports.incidentDatetime, end)),
    )
    .orderBy(asc(reports.incidentDatetime), asc(reports.id));

  if (reportRows.length === 0) {
    return [];
  }

  const reportIds = reportRows.map((row) => row.id);

  const [locations, lastKnownPositions, timelineEventsRows, evidenceRows, actionRows] =
    await Promise.all([
      db
        .select()
        .from(reportLocations)
        .where(inArray(reportLocations.reportId, reportIds)),
      db
        .select()
        .from(reportLastKnownPositions)
        .where(inArray(reportLastKnownPositions.reportId, reportIds)),
      db
        .select()
        .from(reportTimelineEvents)
        .where(inArray(reportTimelineEvents.reportId, reportIds))
        .orderBy(asc(reportTimelineEvents.reportId), asc(reportTimelineEvents.index)),
      db.select().from(reportEvidence).where(inArray(reportEvidence.reportId, reportIds)),
      db
        .select()
        .from(reportRecommendedActions)
        .where(inArray(reportRecommendedActions.reportId, reportIds))
        .orderBy(asc(reportRecommendedActions.reportId), asc(reportRecommendedActions.action)),
    ]);

  const locationMap = new Map<string, ReportLocationRow>();
  locations.forEach((loc) => locationMap.set(loc.reportId, loc));

  const lastKnownMap = new Map<string, ReportLastKnownPositionRow>();
  lastKnownPositions.forEach((item) => lastKnownMap.set(item.reportId, item));

  const timelineMap = new Map<string, ReportTimelineEventRow[]>();
  timelineEventsRows.forEach((entry) => {
    const list = timelineMap.get(entry.reportId) ?? [];
    list.push(entry);
    timelineMap.set(entry.reportId, list);
  });

  const evidenceMap = new Map<string, ReportEvidenceRow[]>();
  evidenceRows.forEach((item) => {
    const list = evidenceMap.get(item.reportId) ?? [];
    list.push(item);
    evidenceMap.set(item.reportId, list);
  });

  const actionsMap = new Map<string, ReportRecommendedActionRow[]>();
  actionRows.forEach((item) => {
    const list = actionsMap.get(item.reportId) ?? [];
    list.push(item);
    actionsMap.set(item.reportId, list);
  });

  return reportRows.map((report) => ({
    report,
    location: locationMap.get(report.id) ?? null,
    lastKnownPosition: lastKnownMap.get(report.id) ?? null,
    timelineEvents: timelineMap.get(report.id) ?? [],
    evidence: evidenceMap.get(report.id) ?? [],
    recommendedActions: actionsMap.get(report.id) ?? [],
  }));
}
