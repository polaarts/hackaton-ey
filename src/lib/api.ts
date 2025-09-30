// Tipos para la respuesta de la API
export interface ApiReport {
  reportId: string;
  title: string;
  summary: string | null;
  incidentDatetime: string;
  location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  licensePlate: string | null;
  vehicleDescription: string | null;
  imageDescriptionRaw: string | null;
  timelineEvents: Array<{
    index: number;
    address: string;
    datetime: string;
    source: string | null;
    notes: string | null;
  }>;
  lastKnownPosition: {
    address: string;
    datetime: string;
  } | null;
  evidence: string[];
  recommendedActions: string[];
  confidence: number;
  notes: string | null;
}

export interface ApiResponse {
  reports: ApiReport[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// Función para obtener reportes por rango de tiempo
export async function getReports(startTime: Date, endTime: Date): Promise<ApiReport[]> {
  const params = new URLSearchParams({
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  });

  const response = await fetch(`/api/reports?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(`API Error: ${errorData.error.message}`);
  }

  const data: ApiResponse = await response.json();
  return data.reports;
}

// Función para obtener reportes del día actual
export async function getTodaysReports(): Promise<ApiReport[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  
  return await getReports(startOfDay, endOfDay);
}

// Función para obtener reportes de la última semana
export async function getLastWeekReports(): Promise<ApiReport[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return await getReports(weekAgo, now);
}
