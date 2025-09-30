import type { ApiReport } from './api';

// Datos mock para cuando la API no está disponible
export const mockApiReports: ApiReport[] = [
  {
    reportId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Vehículo sospechoso",
    summary: "Avistamiento de un vehículo sospechoso en la vía pública.",
    incidentDatetime: "2025-09-30T10:30:00Z",
    location: {
      address: "Av. Providencia 1234, Santiago, Chile",
      latitude: -33.4263,
      longitude: -70.6200,
    },
    licensePlate: "ABCD12",
    vehicleDescription: "Sedán gris, marca Toyota",
    imageDescriptionRaw: "Imagen borrosa captada por cámara de seguridad",
    timelineEvents: [
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
    evidence: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=3"
    ],
    recommendedActions: ["Alertar a Carabineros", "Monitorear cámaras cercanas"],
    confidence: 0.87,
    notes: "Posible coincidencia con otro reporte previo"
  },
  {
    reportId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Seguimiento de vehículo",
    summary: "El mismo vehículo sospechoso avistado en nueva ubicación.",
    incidentDatetime: "2025-09-30T11:15:00Z",
    location: {
      address: "Av. Los Leones 456, Las Condes",
      latitude: -33.4089,
      longitude: -70.5289,
    },
    licensePlate: "ABCD12",
    vehicleDescription: "Sedán gris, marca Toyota",
    imageDescriptionRaw: "Mayor claridad en imagen de seguimiento",
    timelineEvents: [
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
    evidence: [
      "https://picsum.photos/400/300?random=4",
      "https://picsum.photos/400/300?random=5"
    ],
    recommendedActions: ["Continuar seguimiento", "Coordinar interceptación"],
    confidence: 0.92,
    notes: "Confirmada secuencia del vehículo original"
  },
  {
    reportId: "550e8400-e29b-41d4-a716-446655440002",
    title: "Actividad sospechosa",
    summary: "Vehículo en actividad sospechosa cerca de zona comercial.",
    incidentDatetime: "2025-09-30T14:20:00Z",
    location: {
      address: "Av. Libertador B. O'Higgins 123, Santiago Centro",
      latitude: -33.4448,
      longitude: -70.6382,
    },
    licensePlate: "EFGH78",
    vehicleDescription: "SUV negra, marca Chevrolet",
    imageDescriptionRaw: "Imagen con condiciones de luz media",
    timelineEvents: [
      {
        index: 1,
        address: "Av. Libertador B. O'Higgins 123",
        datetime: "2025-09-30T14:20:00Z",
        source: "cámara comercial",
        notes: "Vehículo merodeando por la zona"
      }
    ],
    lastKnownPosition: {
      address: "Calle Estado 200",
      datetime: "2025-09-30T14:35:00Z"
    },
    evidence: [
      "https://picsum.photos/400/300?random=6"
    ],
    recommendedActions: ["Monitoreo adicional", "Verificar con autoridades locales"],
    confidence: 0.72,
    notes: "Requiere confirmación adicional"
  },
  {
    reportId: "550e8400-e29b-41d4-a716-446655440003",
    title: "Alerta de bajo nivel",
    summary: "Posible coincidencia con patrón de búsqueda.",
    incidentDatetime: "2025-09-30T18:10:00Z",
    location: {
      address: "Av. Matta 789, Santiago",
      latitude: -33.4489,
      longitude: -70.6693,
    },
    licensePlate: "HIJK56",
    vehicleDescription: "Hatchback azul, marca Nissan",
    imageDescriptionRaw: "Imagen muy borrosa, difícil identificación",
    timelineEvents: [
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
    evidence: [
      "https://picsum.photos/400/300?random=7"
    ],
    recommendedActions: ["Revisar manualmente", "Descartar si no hay coincidencias"],
    confidence: 0.45,
    notes: "Confianza muy baja, posible falso positivo"
  }
];
