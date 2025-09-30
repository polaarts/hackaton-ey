import type {
  ReportAggregate,
  ReportEvidenceRow,
  ReportRecommendedActionRow,
  ReportTimelineEventRow,
} from "./repository";
import { toIsoString } from "../utils/datetime";

function serializeEvidence(items: ReportEvidenceRow[]): string[] {
  return items.map((item) => item.url);
}

function serializeActions(items: ReportRecommendedActionRow[]): string[] {
  return items.map((item) => item.action);
}

function serializeTimelineEvents(items: ReportTimelineEventRow[]) {
  return items.map((item) => ({
    index: item.index,
    address: item.address,
    datetime: toIsoString(item.datetime),
    source: item.source ?? null,
    notes: item.notes ?? null,
  }));
}

export function serializeReport(aggregate: ReportAggregate) {
  const { report, location, lastKnownPosition, timelineEvents, evidence, recommendedActions } =
    aggregate;

  return {
    reportId: report.id,
    title: report.title,
    summary: report.summary ?? null,
    incidentDatetime: toIsoString(report.incidentDatetime),
    location: location
      ? {
          address: location.address,
          latitude: location.latitude as number | null,
          longitude: location.longitude as number | null,
        }
      : null,
    licensePlate: report.licensePlate ?? null,
    vehicleDescription: report.vehicleDescription ?? null,
    imageDescriptionRaw: report.imageDescriptionRaw ?? null,
    timelineEvents: serializeTimelineEvents(timelineEvents),
    lastKnownPosition: lastKnownPosition
      ? {
          address: lastKnownPosition.address,
          datetime: toIsoString(lastKnownPosition.datetime),
        }
      : null,
    evidence: serializeEvidence(evidence),
    recommendedActions: serializeActions(recommendedActions),
    confidence: Number(report.confidence),
    notes: report.notes ?? null,
  };
}

export function serializeReports(aggregates: ReportAggregate[]) {
  return aggregates.map(serializeReport);
}


