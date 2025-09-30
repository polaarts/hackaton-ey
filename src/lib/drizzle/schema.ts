import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  summary: text("summary"),
  incidentDatetime: timestamp("incident_datetime", { withTimezone: true }).notNull(),
  licensePlate: text("license_plate"),
  vehicleDescription: text("vehicle_description"),
  imageDescriptionRaw: text("image_description_raw"),
  confidence: numeric("confidence").notNull().$type<number>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const reportLocations = pgTable("report_locations", {
  reportId: uuid("report_id").primaryKey().references(() => reports.id),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 6 }).$type<number | null>(),
  longitude: numeric("longitude", { precision: 10, scale: 6 }).$type<number | null>(),
});

export const reportTimelineEvents = pgTable(
  "report_timeline_events",
  {
    reportId: uuid("report_id").references(() => reports.id).notNull(),
    index: integer("index").notNull(),
    address: text("address").notNull(),
    datetime: timestamp("datetime", { withTimezone: true }).notNull(),
    source: text("source"),
    notes: text("notes"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.reportId, table.index] }),
  }),
);

export const reportLastKnownPositions = pgTable("report_last_known_positions", {
  reportId: uuid("report_id").primaryKey().references(() => reports.id),
  address: text("address").notNull(),
  datetime: timestamp("datetime", { withTimezone: true }),
});

export const reportEvidence = pgTable(
  "report_evidence",
  {
    reportId: uuid("report_id").references(() => reports.id).notNull(),
    url: text("url").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.reportId, table.url] }),
  }),
);

export const reportRecommendedActions = pgTable(
  "report_recommended_actions",
  {
    reportId: uuid("report_id").references(() => reports.id).notNull(),
    action: text("action").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.reportId, table.action] }),
  }),
);

export const reportsRelations = relations(reports, ({ one, many }) => ({
  location: one(reportLocations, {
    fields: [reports.id],
    references: [reportLocations.reportId],
  }),
  lastKnownPosition: one(reportLastKnownPositions, {
    fields: [reports.id],
    references: [reportLastKnownPositions.reportId],
  }),
  timelineEvents: many(reportTimelineEvents),
  evidence: many(reportEvidence),
  recommendedActions: many(reportRecommendedActions),
}));

export const reportLocationsRelations = relations(reportLocations, ({ one }) => ({
  report: one(reports, {
    fields: [reportLocations.reportId],
    references: [reports.id],
  }),
}));

export const reportTimelineEventsRelations = relations(
  reportTimelineEvents,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportTimelineEvents.reportId],
      references: [reports.id],
    }),
  }),
);

export const reportLastKnownPositionsRelations = relations(
  reportLastKnownPositions,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportLastKnownPositions.reportId],
      references: [reports.id],
    }),
  }),
);

export const reportEvidenceRelations = relations(reportEvidence, ({ one }) => ({
  report: one(reports, {
    fields: [reportEvidence.reportId],
    references: [reports.id],
  }),
}));

export const reportRecommendedActionsRelations = relations(
  reportRecommendedActions,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportRecommendedActions.reportId],
      references: [reports.id],
    }),
  }),
);

export type ReportRow = typeof reports.$inferSelect;
export type ReportLocationRow = typeof reportLocations.$inferSelect;
export type ReportTimelineEventRow = typeof reportTimelineEvents.$inferSelect;
export type ReportLastKnownPositionRow = typeof reportLastKnownPositions.$inferSelect;
export type ReportEvidenceRow = typeof reportEvidence.$inferSelect;
export type ReportRecommendedActionRow = typeof reportRecommendedActions.$inferSelect;


