'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface TimelineEntry {
  index: number;
  address: string;
  datetime: string;
  source: string | null;
  notes: string | null;
}

interface LastKnownPosition {
  address: string;
  datetime: string;
}

interface CrimeReport {
  reportId: string;
  title: string;
  summary: string;
  incidentDatetime: string;
  location: Location;
  licensePlate: string;
  vehicleDescription: string;
  imageDescriptionRaw: string;
  timelineDeVistas: TimelineEntry[];
  lastKnownPosition: LastKnownPosition;
  evidence: string[];
  recommendedActions: string[];
  confidence: number;
  notes: string;
}

interface PointOfInterest {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string;
  report: CrimeReport;
}

// Dynamic import of MapComponent
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-gray-500">Cargando mapa...</div>
  </div>
})

// Mock crime data for Región Metropolitana de Santiago - Vehicle Theft Reports
const mockCrimeData = {
  'high-confidence': [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Vehículo Sospechoso - ABCD12",
      lat: -33.4263,
      lng: -70.6200,
      type: "high-confidence",
      rating: 87,
      description: "Sedán gris Toyota - Confianza: 87%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440000",
        title: "Vehículo sospechoso",
        summary: "Avistamiento de un vehículo sospechoso en la vía pública.",
        incidentDatetime: "2025-09-30T10:30:00Z",
        location: {
          address: "Av. Providencia 1234, Santiago, Chile",
          latitude: -33.4263,
          longitude: -70.6200
        },
        licensePlate: "ABCD12",
        vehicleDescription: "Sedán gris, marca Toyota",
        imageDescriptionRaw: "Imagen borrosa captada por cámara de seguridad",
        timelineDeVistas: [
          {
            index: 1,
            address: "Av. Providencia 1234",
            datetime: "2025-09-30T10:30:00Z",
            source: "cámara municipal",
            notes: "Avistado cerca de la esquina"
          }
        ],
        lastKnownPosition: {
          address: "Av. Los Leones 456",
          datetime: "2025-09-30T11:00:00Z"
        },
        evidence: ["https://ejemplo.com/evidencia1.jpg"],
        recommendedActions: ["Alertar a Carabineros", "Monitorear cámaras cercanas"],
        confidence: 0.87,
        notes: "Posible coincidencia con otro reporte previo"
      }
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "ABCD12 - Avistamiento Los Leones",
      lat: -33.4089,
      lng: -70.5289,
      type: "high-confidence",
      rating: 92,
      description: "Sedán gris Toyota - Secuencia del mismo vehículo",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440004",
        title: "Avistamiento posterior - mismo vehículo",
        summary: "El mismo vehículo sospechoso avistado en nueva ubicación.",
        incidentDatetime: "2025-09-30T11:15:00Z",
        location: {
          address: "Av. Los Leones 456, Las Condes",
          latitude: -33.4089,
          longitude: -70.5289
        },
        licensePlate: "ABCD12",
        vehicleDescription: "Sedán gris, marca Toyota",
        imageDescriptionRaw: "Mayor claridad en imagen de seguimiento",
        timelineDeVistas: [
          {
            index: 1,
            address: "Av. Los Leones 456",
            datetime: "2025-09-30T11:15:00Z",
            source: "cámara de tráfico",
            notes: "Vehículo moviéndose hacia el oriente"
          }
        ],
        lastKnownPosition: {
          address: "Av. Apoquindo 4500",
          datetime: "2025-09-30T11:30:00Z"
        },
        evidence: ["https://ejemplo.com/seguimiento1.jpg"],
        recommendedActions: ["Continuar seguimiento", "Coordinar interceptación"],
        confidence: 0.92,
        notes: "Confirmada secuencia del vehículo original"
      }
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "ABCD12 - Avistamiento Apoquindo",
      lat: -33.4056,
      lng: -70.5112,
      type: "high-confidence",
      rating: 89,
      description: "Sedán gris Toyota - Continuación de secuencia",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440005",
        title: "Tercer avistamiento - confirmación de ruta",
        summary: "Confirmación de la ruta del vehículo sospechoso hacia Las Condes.",
        incidentDatetime: "2025-09-30T11:45:00Z",
        location: {
          address: "Av. Apoquindo 4500, Las Condes",
          latitude: -33.4056,
          longitude: -70.5112
        },
        licensePlate: "ABCD12",
        vehicleDescription: "Sedán gris, marca Toyota",
        imageDescriptionRaw: "Imagen clara de perfil del vehículo",
        timelineDeVistas: [
          {
            index: 1,
            address: "Av. Apoquindo 4500",
            datetime: "2025-09-30T11:45:00Z",
            source: "cámara de tráfico",
            notes: "Vehículo avanzando hacia el oriente"
          }
        ],
        lastKnownPosition: {
          address: "Av. El Bosque Norte 500",
          datetime: "2025-09-30T12:00:00Z"
        },
        evidence: ["https://ejemplo.com/seguimiento2.jpg"],
        recommendedActions: ["Interceptar en siguiente semáforo", "Coordinar patrullas"],
        confidence: 0.89,
        notes: "Ruta confirmada hacia sector empresarial"
      }
    }
  ],
  'medium-confidence': [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Robo Confirmado - XYZ789",
      lat: -33.4178,
      lng: -70.5456,
      type: "medium-confidence",
      rating: 75,
      description: "SUV negro Hyundai - Confianza: 75%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440001",
        title: "Posible robo de vehículo",
        summary: "Posible robo de SUV negro en estacionamiento comercial.",
        incidentDatetime: "2025-09-30T14:15:00Z",
        location: {
          address: "Costanera Center, Las Condes",
          latitude: -33.4178,
          longitude: -70.5456
        },
        licensePlate: "ABCD12",
        vehicleDescription: "SUV negro, marca Hyundai",
        imageDescriptionRaw: "Imagen parcialmente obstruida",
        timelineDeVistas: [
          {
            index: 1,
            address: "Costanera Center - Estacionamiento",
            datetime: "2025-09-30T14:15:00Z",
            source: "cámara privada",
            notes: "Actividad sospechosa en estacionamiento"
          }
        ],
        lastKnownPosition: {
          address: "Av. Apoquindo 3000",
          datetime: "2025-09-30T14:30:00Z"
        },
        evidence: ["https://ejemplo.com/sospecha1.jpg"],
        recommendedActions: ["Verificar con propietario", "Monitorear área"],
        confidence: 0.75,
        notes: "Requiere confirmación adicional"
      }
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Actividad Sospechosa - DEFG34",
      lat: -33.4372,
      lng: -70.6506,
      type: "medium-confidence",
      rating: 68,
      description: "Pickup blanca Ford - Confianza: 68%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440002",
        title: "Actividad sospechosa",
        summary: "Vehículo en actividad sospechosa cerca de residencias.",
        incidentDatetime: "2025-09-30T16:20:00Z",
        location: {
          address: "Calle Merced 456, Santiago Centro",
          latitude: -33.4372,
          longitude: -70.6506
        },
        licensePlate: "DEFG34",
        vehicleDescription: "Pickup blanca, marca Ford",
        imageDescriptionRaw: "Imagen nocturna con baja visibilidad",
        timelineDeVistas: [
          {
            index: 1,
            address: "Calle Merced 456",
            datetime: "2025-09-30T16:20:00Z",
            source: "cámara residencial",
            notes: "Vehículo detenido por tiempo prolongado"
          }
        ],
        lastKnownPosition: {
          address: "Av. Libertador B. O'Higgins 1000",
          datetime: "2025-09-30T16:45:00Z"
        },
        evidence: ["https://ejemplo.com/nocturna1.jpg"],
        recommendedActions: ["Patrullaje en la zona", "Verificar antecedentes"],
        confidence: 0.68,
        notes: "Imagen de baja calidad, requiere verificación"
      }
    }
  ],
  'low-confidence': [
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Alerta Menor - HIJK56",
      lat: -33.4489,
      lng: -70.6693,
      type: "low-confidence",
      rating: 45,
      description: "Hatchback azul Nissan - Confianza: 45%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440003",
        title: "Alerta de bajo nivel",
        summary: "Posible coincidencia con patrón de búsqueda.",
        incidentDatetime: "2025-09-30T18:10:00Z",
        location: {
          address: "Av. Matta 789, Santiago",
          latitude: -33.4489,
          longitude: -70.6693
        },
        licensePlate: "HIJK56",
        vehicleDescription: "Hatchback azul, marca Nissan",
        imageDescriptionRaw: "Imagen muy borrosa, difícil identificación",
        timelineDeVistas: [
          {
            index: 1,
            address: "Av. Matta 789",
            datetime: "2025-09-30T18:10:00Z",
            source: "cámara móvil",
            notes: "Posible coincidencia en algoritmo"
          }
        ],
        lastKnownPosition: {
          address: "Av. Matta 789",
          datetime: "2025-09-30T18:10:00Z"
        },
        evidence: ["https://ejemplo.com/borrosa1.jpg"],
        recommendedActions: ["Revisar manualmente", "Descartar si no hay coincidencias"],
        confidence: 0.45,
        notes: "Confianza muy baja, posible falso positivo"
      }
    }
  ]
}

export default function Home() {
  const [selectedConfidence, setSelectedConfidence] = useState<string[]>(['high-confidence', 'medium-confidence', 'low-confidence'])
  const [selectedReport, setSelectedReport] = useState<PointOfInterest | null>(null)

  // Flatten all data based on selected confidence levels
  const filteredData = selectedConfidence.reduce((acc, confidence) => {
    return [...acc, ...mockCrimeData[confidence as keyof typeof mockCrimeData]]
  }, [] as PointOfInterest[])

  const getConfidenceColor = (type: string) => {
    switch (type) {
      case 'high-confidence': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium-confidence': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low-confidence': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceLabel = (type: string) => {
    switch (type) {
      case 'high-confidence': return 'Alta Confianza'
      case 'medium-confidence': return 'Confianza Media'
      case 'low-confidence': return 'Baja Confianza'
      default: return 'Desconocido'
    }
  }

  const handleMarkerClick = (report: PointOfInterest) => {
    setSelectedReport(report)
  }

  const handleMapClick = () => {
    setSelectedReport(null)
  }

  const handleConfidenceChange = (confidence: string) => {
    setSelectedConfidence(prev => 
      prev.includes(confidence)
        ? prev.filter(c => c !== confidence)
        : [...prev, confidence]
    )
  }

  return (
    <div className="h-screen flex">
      {/* Main map area */}
      <div className="flex-1 relative">
        <MapComponent 
          data={filteredData}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          selectedReport={selectedReport}
        />
      </div>

      {/* Right sidebar */}
      <div className="w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-800">Monitor de Seguridad</h1>
          <p className="text-sm text-gray-600">Detección de Robos Vehiculares</p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Filtros por Confianza</h3>
          <div className="space-y-2">
            {['high-confidence', 'medium-confidence', 'low-confidence'].map(confidence => (
              <label key={confidence} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedConfidence.includes(confidence)}
                  onChange={() => handleConfidenceChange(confidence)}
                  className="rounded border-gray-300"
                />
                <span className={`px-2 py-1 rounded text-xs border ${getConfidenceColor(confidence)}`}>
                  {getConfidenceLabel(confidence)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reports list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Reportes Activos ({filteredData.length})
            </h3>
            <div className="space-y-3">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReport?.id === item.id 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleMarkerClick(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs border ${getConfidenceColor(item.type)}`}>
                      {item.rating}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    Patente: <span className="font-mono font-medium">{item.report.licensePlate}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.report.incidentDatetime).toLocaleString('es-CL')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected report details */}
        {selectedReport && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-2">Detalles del Reporte</h3>
            <div className="space-y-2 text-black text-sm">
              <div>
                <span className="font-medium">Título:</span> {selectedReport.report.title}
              </div>
              <div>
                <span className="font-medium">Resumen:</span> {selectedReport.report.summary}
              </div>
              <div>
                <span className="font-medium">Ubicación:</span> {selectedReport.report.location.address}
              </div>
              <div>
                <span className="font-medium">Vehículo:</span> {selectedReport.report.vehicleDescription}
              </div>
              <div>
                <span className="font-medium">Patente:</span> 
                <span className="font-mono font-medium ml-1">{selectedReport.report.licensePlate}</span>
              </div>
              <div>
                <span className="font-medium">Confianza:</span> {Math.round(selectedReport.report.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">Notas:</span> {selectedReport.report.notes}
              </div>
            </div>

            {/* Evidence Section */}
            {selectedReport.report.evidence && selectedReport.report.evidence.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                  📸 Evidencia ({selectedReport.report.evidence.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedReport.report.evidence.map((evidenceUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={evidenceUrl}
                        alt={`Evidencia ${index + 1}`}
                        className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100" height="100" fill="#f3f4f6"/>
                              <text x="50" y="45" font-family="Arial" font-size="10" text-anchor="middle" fill="#9ca3af">📷</text>
                              <text x="50" y="60" font-family="Arial" font-size="8" text-anchor="middle" fill="#9ca3af">Imagen no</text>
                              <text x="50" y="72" font-family="Arial" font-size="8" text-anchor="middle" fill="#9ca3af">disponible</text>
                            </svg>
                          `)}`;
                        }}
                        onClick={() => {
                          // Open image in new tab/window
                          window.open(evidenceUrl, '_blank');
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b">
                        Evidencia {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Image description */}
                {selectedReport.report.imageDescriptionRaw && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <span className="font-medium text-blue-800">Descripción:</span>
                    <span className="text-blue-700 ml-1">{selectedReport.report.imageDescriptionRaw}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
