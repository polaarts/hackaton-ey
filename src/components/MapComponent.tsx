'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import type { PointOfInterest } from '@/lib/reportConverter';

// Fix para marcadores por defecto en Leaflet con Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string;
  report: {
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
  };
}

interface MapComponentProps {
  data: PointOfInterest[];
  onMarkerClick: (point: PointOfInterest) => void;
  onMapClick: () => void;
  selectedReport: PointOfInterest | null;
}

/* ─────────────────────────────
   Helpers de estilo y formato
   ───────────────────────────── */

const ensurePopupStyles = (() => {
  let injected = false;
  return () => {
    if (injected) return;
    injected = true;
    const css = `
    .clean-popup .leaflet-popup-content { margin: 0; }
    .clean-popup .card { padding:10px; min-width:260px; font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; }
    .clean-popup .title { margin:0 0 .25rem 0; font-weight:700; font-size:14px; color:#111827;}
    .clean-popup .row { display:flex; align-items:center; gap:.5rem; font-size:12px; color:#374151; }
    .clean-popup .muted { color:#6b7280; }
    .clean-popup .badge { display:inline-flex; align-items:center; gap:.35rem; font-size:11px; font-weight:600; padding:.2rem .45rem; border-radius:.375rem; border:1px solid transparent; }
    .clean-popup .badge.high { background:#ecfdf5; color:#065f46; border-color:#a7f3d0;}
    .clean-popup .badge.med  { background:#fffbeb; color:#92400e; border-color:#fde68a;}
    .clean-popup .badge.low  { background:#fef2f2; color:#991b1b; border-color:#fecaca;}
    .clean-popup .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; font-weight:700;}
    .clean-popup .bar { height:6px; background:#e5e7eb; border-radius:9999px; overflow:hidden; }
    .clean-popup .bar>span { display:block; height:100%; background:#10b981; }
    .clean-popup .bar.med>span { background:#f59e0b; }
    .clean-popup .bar.low>span { background:#ef4444; }
    .clean-popup .actions { display:flex; gap:.5rem; margin-top:.5rem; }
    .clean-popup .btn { display:inline-flex; align-items:center; gap:.35rem; padding:.35rem .6rem; border-radius:.375rem; border:1px solid #e5e7eb; background:#fff; color:#111827; font-size:12px; cursor:pointer; }
    .clean-popup .btn.primary { background:#2563eb; border-color:#1d4ed8; color:#fff; }
    .clean-popup .btn:hover { filter:brightness(0.97); }
    `;
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  };
})();

const fmtCL = (d: string | number | Date) =>
  new Date(d).toLocaleString('es-CL', { hour12: false });

const timeAgo = (d: string | number | Date) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.max(1, Math.round(diff / 60000));
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return `hace ${h} h`;
};

const confidenceClass = (p: number) => (p >= 80 ? 'high' : p >= 60 ? 'med' : 'low');

const getTypeColor = (type: string) => {
  switch (type) {
    case 'high-confidence': return '#dc2626'; // red-600
    case 'medium-confidence': return '#d97706'; // amber-600
    case 'low-confidence': return '#16a34a'; // green-600
    default: return '#6b7280'; // gray-500
  }
};

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'high-confidence': return '🚨';
    case 'medium-confidence': return '⚠️';
    case 'low-confidence': return '📍';
    default: return '📍';
  }
};

const getMarkerIcon = (type: string, isSelected: boolean = false, isRelated: boolean = false) => {
  let color = getTypeColor(type);
  if (isSelected) color = '#3b82f6';      // azul seleccionado
  else if (isRelated) color = '#8b5cf6';  // morado relacionados

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px; height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(45deg); font-size: 12px; color: white;">
          ${getTypeEmoji(type)}
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
};

const MapComponent: React.FC<MapComponentProps> = ({ data, onMarkerClick, onMapClick, selectedReport }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // Agrupar por patente para trazar secuencias
  const groupedByLicense = useMemo(() => {
    const groups: { [key: string]: MapPoint[] } = {};
    data.forEach(point => {
      const license = point.report.licensePlate;
      if (!groups[license]) groups[license] = [];
      groups[license].push(point);
    });
    return groups;
  }, [data]);

  // Eventos relacionados (misma patente)
  const relatedEvents = useMemo(() => {
    if (!selectedReport) return [];
    return groupedByLicense[selectedReport.report.licensePlate] || [];
  }, [selectedReport, groupedByLicense]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Estilos del popup (una sola vez)
    ensurePopupStyles();

    // Inicializar mapa
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([-33.4569, -70.6483], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Click en mapa para deseleccionar
      mapRef.current.on('click', () => onMapClick());
    }

    // Limpiar marcadores y polilíneas
    markersRef.current.forEach(marker => marker.remove());
    polylinesRef.current.forEach(polyline => polyline.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    // Crear marcadores
    data.forEach(point => {
      const isSelected = selectedReport?.id === point.id;
      const isRelated = !!(selectedReport &&
        point.report.licensePlate === selectedReport.report.licensePlate &&
        point.id !== selectedReport.id &&
        relatedEvents.length > 1);

      const marker = L.marker([point.lat, point.lng], {
        icon: getMarkerIcon(point.type, isSelected, isRelated)
      }).addTo(mapRef.current!);

      // Contenido del popup mejorado
      const pct = Math.round((point.report?.confidence ?? point.rating / 100) * 100);
      const cls = confidenceClass(pct);

      const html = `
        <div class="card">
          <div class="title">${point.report.title}</div>

          <div class="row" style="margin:.25rem 0;">
            <span>🚗</span>
            <span class="mono">${point.report.licensePlate}</span>
            <span class="muted" style="margin-left:.25rem;">${point.report.vehicleDescription ?? ''}</span>
          </div>

          <div class="row">
            <span>📍</span>
            <span>${point.report.location.address}</span>
          </div>

          <div class="row muted">
            <span>🕒</span>
            <span>${fmtCL(point.report.incidentDatetime)} · ${timeAgo(point.report.incidentDatetime)}</span>
          </div>

          <div class="row" style="margin-top:.35rem;">
            <span class="badge ${cls}">Confianza: ${pct}%</span>
          </div>
          <div class="bar ${cls}" style="margin:.35rem 0 .1rem 0;">
            <span style="width:${pct}%;"></span>
          </div>
        </div>
      `;

      marker.bindPopup(html, { className: 'clean-popup' });

      // Click del pin → seleccionar
      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        onMarkerClick(point);
      });

      // Handlers de botones dentro del popup
      marker.on('popupopen', () => {
        const container = marker.getPopup()?.getElement();
        if (!container) return;

        const on = (sel: string, fn: () => void) => {
          const el = container.querySelector<HTMLButtonElement>(sel);
          if (el) el.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            fn();
          });
        };
      });

      markersRef.current.push(marker);
    });

    // Trazado de secuencia si hay selección
    if (selectedReport && relatedEvents.length > 1) {
      const sortedEvents = [...relatedEvents].sort(
        (a, b) =>
          new Date(a.report.incidentDatetime).getTime() -
          new Date(b.report.incidentDatetime).getTime()
      );

      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const startPoint = sortedEvents[i];
        const endPoint = sortedEvents[i + 1];

        const polyline = L.polyline(
          [
            [startPoint.lat, startPoint.lng],
            [endPoint.lat, endPoint.lng]
          ],
          { color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '5, 10' }
        ).addTo(mapRef.current!);

        const linePopupContent = `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #3b82f6; font-size: 14px;">
              🔗 Trazado: ${selectedReport.report.licensePlate}
            </h4>
            <div style="font-size: 12px; color: #6b7280;">
              <div><strong>Desde:</strong> ${startPoint.report.location.address}</div>
              <div><strong>Hasta:</strong> ${endPoint.report.location.address}</div>
              <div><strong>Tiempo:</strong> ${new Date(startPoint.report.incidentDatetime).toLocaleTimeString('es-CL')} → ${new Date(endPoint.report.incidentDatetime).toLocaleTimeString('es-CL')}</div>
            </div>
          </div>
        `;
        polyline.bindPopup(linePopupContent);
        polylinesRef.current.push(polyline);
      }

      // Ajustar vista a eventos relacionados
      const group = L.featureGroup(markersRef.current.filter(m => !!m));
      mapRef.current!.fitBounds(group.getBounds().pad(0.1));
    } else if (data.length > 0 && !selectedReport) {
      // Ajustar a todos los marcadores sin selección
      const group = L.featureGroup(markersRef.current);
      mapRef.current!.fitBounds(group.getBounds().pad(0.1));
    }
  }, [data, selectedReport, onMarkerClick, onMapClick, relatedEvents]);

  // Abrir popup y centrar cuando cambia la selección
  useEffect(() => {
    if (!selectedReport || !mapRef.current) return;

    mapRef.current.setView([selectedReport.lat, selectedReport.lng], 15);

    const selectedMarker = markersRef.current.find((marker, index) =>
      data[index]?.id === selectedReport.id
    );
    if (selectedMarker) selectedMarker.openPopup();
  }, [selectedReport, data]);

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full rounded-lg" />

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
        <h4 className="text-sm font-semibold mb-2 text-red-800">🚔 Reportes de Seguridad</h4>
        <div className="space-y-1 text-black">
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#dc2626' }}></div>
            Alta Confianza (80%+)
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#d97706' }}></div>
            Media Confianza (60–79%)
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#16a34a' }}></div>
            Baja Confianza (&lt;60%)
          </div>
          <hr className="my-2 border-gray-200" />
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#3b82f6' }}></div>
            Evento Seleccionado
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#8b5cf6' }}></div>
            Eventos Relacionados
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-1 mr-2 border-t-2 border-dashed" style={{ borderColor: '#3b82f6' }}></div>
            Trazado de Ruta
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
