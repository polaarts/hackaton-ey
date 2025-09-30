'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Type definitions for crime reports
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
  lastKnownPosition: {
    address: string;
    datetime: string;
  };
  evidence: string[];
  recommendedActions: string[];
  confidence: number;
  notes: string;
}

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string;
  report: CrimeReport;
}

interface Category {
  key: string;
  label: string;
  icon: string;
}

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 flex items-center justify-center">Cargando mapa...</div>
});

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
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Robo Confirmado - XYZ789",
      lat: -33.4178,
      lng: -70.5456,
      type: "high-confidence",
      rating: 95,
      description: "SUV negro Hyundai - Confianza: 95%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440001",
        title: "Robo de vehículo confirmado",
        summary: "Robo de SUV negro en estacionamiento comercial.",
        incidentDatetime: "2025-09-30T14:15:00Z",
        location: {
          address: "Costanera Center, Las Condes",
          latitude: -33.4178,
          longitude: -70.5456
        },
        licensePlate: "XYZ789",
        vehicleDescription: "SUV negro, marca Hyundai",
        imageDescriptionRaw: "Múltiples ángulos de cámaras de seguridad",
        timelineDeVistas: [
          {
            index: 1,
            address: "Costanera Center - Estacionamiento",
            datetime: "2025-09-30T14:15:00Z",
            source: "cámara privada",
            notes: "Robo en proceso"
          }
        ],
        lastKnownPosition: {
          address: "Av. Apoquindo 3000",
          datetime: "2025-09-30T14:30:00Z"
        },
        evidence: ["https://ejemplo.com/robo1.mp4", "https://ejemplo.com/robo2.jpg"],
        recommendedActions: ["Alerta inmediata", "Bloqueo de vías"],
        confidence: 0.95,
        notes: "Robo confirmado por múltiples fuentes"
      }
    }
  ],
  'medium-confidence': [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Actividad Sospechosa - DEF456",
      lat: -33.4378,
      lng: -70.6504,
      type: "medium-confidence",
      rating: 65,
      description: "Hatchback blanco Chevrolet - Confianza: 65%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440002",
        title: "Actividad sospechosa detectada",
        summary: "Comportamiento inusual en zona comercial.",
        incidentDatetime: "2025-09-30T16:45:00Z",
        location: {
          address: "Plaza de Armas, Santiago Centro",
          latitude: -33.4378,
          longitude: -70.6504
        },
        licensePlate: "DEF456",
        vehicleDescription: "Hatchback blanco, marca Chevrolet",
        imageDescriptionRaw: "Imagen parcialmente obstruida",
        timelineDeVistas: [
          {
            index: 1,
            address: "Plaza de Armas",
            datetime: "2025-09-30T16:45:00Z",
            source: "cámara municipal",
            notes: "Movimientos erráticos"
          }
        ],
        lastKnownPosition: {
          address: "Calle Estado 200",
          datetime: "2025-09-30T17:00:00Z"
        },
        evidence: ["https://ejemplo.com/sospecha1.jpg"],
        recommendedActions: ["Monitoreo continuo"],
        confidence: 0.65,
        notes: "Requiere verificación adicional"
      }
    }
  ],
  'low-confidence': [
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Posible Incidente - GHI123",
      lat: -33.4567,
      lng: -70.5989,
      type: "low-confidence",
      rating: 35,
      description: "Pickup roja Ford - Confianza: 35%",
      report: {
        reportId: "550e8400-e29b-41d4-a716-446655440003",
        title: "Posible incidente vehicular",
        summary: "Detección automática requiere verificación.",
        incidentDatetime: "2025-09-30T19:20:00Z",
        location: {
          address: "Ñuñoa, Santiago",
          latitude: -33.4567,
          longitude: -70.5989
        },
        licensePlate: "GHI123",
        vehicleDescription: "Pickup roja, marca Ford",
        imageDescriptionRaw: "Imagen de baja calidad",
        timelineDeVistas: [
          {
            index: 1,
            address: "Av. Grecia 1500",
            datetime: "2025-09-30T19:20:00Z",
            source: "detección automática",
            notes: "Algoritmo de detección"
          }
        ],
        lastKnownPosition: {
          address: "Av. Grecia 1500",
          datetime: "2025-09-30T19:20:00Z"
        },
        evidence: ["https://ejemplo.com/auto1.jpg"],
        recommendedActions: ["Revisión manual"],
        confidence: 0.35,
        notes: "Baja confianza, posible falso positivo"
      }
    }
  ]
};

const categories: Category[] = [
  { key: 'all', label: 'Todos los Reportes', icon: '🚨' },
  { key: 'high-confidence', label: 'Alta Confianza', icon: '🔴' },
  { key: 'medium-confidence', label: 'Media Confianza', icon: '🟡' },
  { key: 'low-confidence', label: 'Baja Confianza', icon: '🟢' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredData, setFilteredData] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredData([
        ...mockCrimeData['high-confidence'], 
        ...mockCrimeData['medium-confidence'], 
        ...mockCrimeData['low-confidence']
      ]);
    } else {
      setFilteredData((mockCrimeData as any)[selectedCategory] || []);
    }
  }, [selectedCategory]);

  const handlePointClick = (point: MapPoint) => {
    setSelectedPoint(point);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-red-600 bg-red-50';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="h-screen flex">
      {/* Map Container - Full Screen */}
      <div className="flex-1 relative">
        <MapComponent 
          data={filteredData}
          onPointClick={handlePointClick}
          selectedPoint={selectedPoint}
        />
      </div>

      {/* Sidebar - Right Side */}
      <div className="w-96 bg-white shadow-lg border-l flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-red-50">
          <h1 className="text-lg font-bold text-red-900">🚔 Monitor de Seguridad</h1>
          <p className="text-xs text-red-700 mt-1">
            Región Metropolitana • {filteredData.length} reportes activos
          </p>
        </div>

        {/* Categories */}
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Nivel de Confianza</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                  selectedCategory === category.key
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Point Info */}
        {selectedPoint && (
          <div className="p-4 border-b bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-red-900 text-sm">{selectedPoint.report.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(selectedPoint.rating)}`}>
                {selectedPoint.rating}%
              </span>
            </div>
            <p className="text-xs text-red-700 mb-2">{selectedPoint.report.licensePlate} - {selectedPoint.report.vehicleDescription}</p>
            <p className="text-xs text-gray-600 mb-2">{selectedPoint.report.location.address}</p>
            <p className="text-xs text-red-600">{formatDateTime(selectedPoint.report.incidentDatetime)}</p>
          </div>
        )}

        {/* Reports List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">
              {selectedCategory === 'all' ? 'Todos los Reportes' : categories.find(c => c.key === selectedCategory)?.label}
            </h2>
            <div className="space-y-3">
              {filteredData.map((point) => (
                <div 
                  key={point.id}
                  className={`bg-white rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedPoint?.id === point.id ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handlePointClick(point)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{point.report.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(point.rating)}`}>
                      {point.rating}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium mb-1">
                    📋 {point.report.licensePlate} - {point.report.vehicleDescription}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">📍 {point.report.location.address}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      🕒 {formatDateTime(point.report.incidentDatetime)}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      point.type === 'high-confidence' ? 'bg-red-100 text-red-700' :
                      point.type === 'medium-confidence' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {point.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
