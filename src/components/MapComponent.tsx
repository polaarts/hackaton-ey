'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';

// Fix for default markers in Leaflet with Next.js
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
  data: MapPoint[];
  onMarkerClick: (point: MapPoint) => void;
  selectedReport: MapPoint | null;
}

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

const getMarkerIcon = (type: string, isSelected: boolean = false) => {
  const color = isSelected ? '#3b82f6' : getTypeColor(type);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 12px;
          color: white;
        ">${getTypeEmoji(type)}</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
};

const MapComponent: React.FC<MapComponentProps> = ({ data, onMarkerClick, selectedReport }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize map centered in Región Metropolitana de Santiago
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView([-33.4569, -70.6483], 10);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      data.forEach(point => {
        const isSelected = selectedReport?.id === point.id;
        const marker = L.marker([point.lat, point.lng], {
          icon: getMarkerIcon(point.type, isSelected)
        }).addTo(mapRef.current!);

        // Add popup
        marker.bindPopup(`
          <div style="padding: 10px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #dc2626; font-size: 16px;">${point.report.title}</h3>
            <div style="margin-bottom: 8px;">
              <strong style="color: #374151;">🚗 ${point.report.licensePlate}</strong>
              <span style="margin-left: 8px; color: #6b7280; font-size: 14px;">${point.report.vehicleDescription}</span>
            </div>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📍 ${point.report.location.address}</p>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">🕒 ${new Date(point.report.incidentDatetime).toLocaleString('es-CL')}</p>
            <div style="display: flex; align-items: center; justify-content: between; margin-top: 8px;">
              <span style="background-color: ${point.rating >= 80 ? '#fef2f2' : point.rating >= 50 ? '#fefce8' : '#f0fdf4'}; 
                           color: ${point.rating >= 80 ? '#dc2626' : point.rating >= 50 ? '#d97706' : '#16a34a'}; 
                           padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                Confianza: ${point.rating}%
              </span>
            </div>
          </div>
        `);

        // Add click event
        marker.on('click', () => {
          onMarkerClick(point);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers if there are any
      if (data.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [data, selectedReport, onMarkerClick]);

  useEffect(() => {
    // Center map on selected point
    if (selectedReport && mapRef.current) {
      mapRef.current.setView([selectedReport.lat, selectedReport.lng], 15);
      
      // Open popup for selected marker
      const selectedMarker = markersRef.current.find((marker, index) => 
        data[index]?.id === selectedReport.id
      );
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [selectedReport, data]);

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
        <h4 className="text-sm font-semibold mb-2 text-red-800">🚔 Reportes de Seguridad</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#dc2626' }}></div>
            Alta Confianza (80%+)
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#d97706' }}></div>
            Media Confianza (50-79%)
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#16a34a' }}></div>
            Baja Confianza (&lt;50%)
          </div>
        </div>
      </div>

    </div>
  );
};

export default MapComponent;
