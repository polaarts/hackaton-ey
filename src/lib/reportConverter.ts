import type { ApiReport } from './api';

// Tipos del frontend (existentes)
export type Confidence = 'high-confidence' | 'medium-confidence' | 'low-confidence';

export interface CrimeReport {
  reportId: string;
  title: string;
  summary: string;
  incidentDatetime: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  licensePlate: string;
  vehicleDescription: string;
  imageDescriptionRaw: string;
  timelineDeVistas: Array<{
    index: number;
    address: string;
    datetime: string;
    source: string | null;
    notes: string | null;
  }>;
  lastKnownPosition: {
    address: string;
    datetime: string;
  };
  evidence: string[];
  recommendedActions: string[];
  confidence: number;
  notes: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: Confidence;
  rating: number;
  description: string;
  report: CrimeReport;
}

// Función para determinar el nivel de confianza basado en el score
function getConfidenceLevel(confidence: number): Confidence {
  if (confidence >= 0.85) return 'high-confidence';
  if (confidence >= 0.6) return 'medium-confidence';
  return 'low-confidence';
}

// Función para generar nombre descriptivo del reporte
function generateReportName(report: ApiReport): string {
  const licensePlate = report.licensePlate || 'SIN-PATENTE';
  const confidenceLevel = getConfidenceLevel(report.confidence);
  
  switch (confidenceLevel) {
    case 'high-confidence':
      return `🚨 ${licensePlate} - ${report.title}`;
    case 'medium-confidence':
      return `⚠️ ${licensePlate} - ${report.title}`;
    default:
      return `📍 ${licensePlate} - ${report.title}`;
  }
}

// Función para generar descripción del reporte
function generateDescription(report: ApiReport): string {
  const vehicle = report.vehicleDescription || 'Vehículo no especificado';
  const confidence = Math.round(report.confidence * 100);
  return `${vehicle} - Confianza: ${confidence}%`;
}

// Función principal para convertir ApiReport a PointOfInterest
export function convertApiReportToPointOfInterest(apiReport: ApiReport): PointOfInterest | null {
  // Verificar que el reporte tenga ubicación válida
  if (!apiReport.location || 
      apiReport.location.latitude === null || 
      apiReport.location.longitude === null) {
    console.warn(`Reporte ${apiReport.reportId} no tiene ubicación válida`);
    return null;
  }

  const confidenceLevel = getConfidenceLevel(apiReport.confidence);
  const rating = Math.round(apiReport.confidence * 100);

  // Convertir el reporte de la API al formato del frontend
  const crimeReport: CrimeReport = {
    reportId: apiReport.reportId,
    title: apiReport.title,
    summary: apiReport.summary || '',
    incidentDatetime: apiReport.incidentDatetime,
    location: {
      address: apiReport.location.address,
      latitude: apiReport.location.latitude,
      longitude: apiReport.location.longitude,
    },
    licensePlate: apiReport.licensePlate || '',
    vehicleDescription: apiReport.vehicleDescription || '',
    imageDescriptionRaw: apiReport.imageDescriptionRaw || '',
    timelineDeVistas: apiReport.timelineEvents.map(event => ({
      index: event.index,
      address: event.address,
      datetime: event.datetime,
      source: event.source,
      notes: event.notes,
    })),
    lastKnownPosition: apiReport.lastKnownPosition || {
      address: apiReport.location.address,
      datetime: apiReport.incidentDatetime,
    },
    evidence: apiReport.evidence,
    recommendedActions: apiReport.recommendedActions,
    confidence: apiReport.confidence,
    notes: apiReport.notes || '',
  };

  return {
    id: apiReport.reportId,
    name: generateReportName(apiReport),
    lat: apiReport.location.latitude,
    lng: apiReport.location.longitude,
    type: confidenceLevel,
    rating,
    description: generateDescription(apiReport),
    report: crimeReport,
  };
}

// Función para convertir múltiples reportes
export function convertApiReportsToPointsOfInterest(apiReports: ApiReport[]): PointOfInterest[] {
  return apiReports
    .map(convertApiReportToPointOfInterest)
    .filter((point): point is PointOfInterest => point !== null);
}

// Función para agrupar reportes por nivel de confianza
export function groupReportsByConfidence(reports: PointOfInterest[]): Record<Confidence, PointOfInterest[]> {
  const grouped: Record<Confidence, PointOfInterest[]> = {
    'high-confidence': [],
    'medium-confidence': [],
    'low-confidence': [],
  };

  reports.forEach(report => {
    grouped[report.type].push(report);
  });

  return grouped;
}
