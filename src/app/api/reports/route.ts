import { NextResponse } from "next/server";

import { findReportsByTimeRange } from "@/lib/reports/repository";
import { serializeReports } from "@/lib/reports/serializers";
import { isStartAfterEnd, parseIsoDate } from "@/lib/utils/datetime";

const INVALID_PARAMETERS_RESPONSE = {
  error: {
    code: "INVALID_PARAMETERS",
    message:
      "start_time and end_time must be valid ISO-8601 datetimes with start_time <= end_time.",
  },
};

const INTERNAL_ERROR_RESPONSE = {
  error: {
    code: "INTERNAL_ERROR",
    message: "Unexpected error retrieving reports.",
  },
};

function jsonResponse<T>(body: T, status: number) {
  return NextResponse.json(body, { status });
}

function logInfo(message: string, context: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ level: "info", message, ...context }));
}

function logError(message: string, context: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: "error", message, ...context }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startTime = searchParams.get("start_time");
  const endTime = searchParams.get("end_time");

  if (!startTime || !endTime) {
    logInfo("Missing query parameters", { startTime, endTime });
    return jsonResponse(INVALID_PARAMETERS_RESPONSE, 400);
  }

  let start: Date;
  let end: Date;

  try {
    start = parseIsoDate(startTime);
    end = parseIsoDate(endTime);
  } catch (error) {
    logInfo("Invalid datetime format", { startTime, endTime, error: (error as Error).message });
    return jsonResponse(INVALID_PARAMETERS_RESPONSE, 400);
  }

  if (isStartAfterEnd(start, end)) {
    logInfo("start_time after end_time", {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    return jsonResponse(INVALID_PARAMETERS_RESPONSE, 400);
  }

  logInfo("Fetching reports", {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });

  try {
    const result = await findReportsByTimeRange(start, end);
    const payload = {
      reports: serializeReports(result),
    };
    logInfo("Reports fetched", { startTime: start.toISOString(), endTime: end.toISOString(), count: result.length });
    return jsonResponse(payload, 200);
  } catch (error) {
    logError("Database query failed", {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonResponse(INTERNAL_ERROR_RESPONSE, 500);
  }
}


