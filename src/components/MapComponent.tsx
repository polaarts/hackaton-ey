'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string;
}

interface MapComponentProps {
  data: MapPoint[];
  onPointClick: (point: MapPoint) => void;
  selectedPoint: MapPoint | null;
}

const getMarkerIcon = (type: string, isSelected: boolean = false) => {
  const color = isSelected ? '#ef4444' : getTypeColor(type);
  
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
    iconAnchor: [12.5, 25],
  });
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'restaurant': return '#f59e0b';
    case 'hotel': return '#3b82f6';
    case 'attraction': return '#10b981';
    default: return '#6b7280';
  }
};

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'restaurant': return '🍽️';
    case 'hotel': return '🏨';
    case 'attraction': return '🎭';
    default: return '📍';
  }
};

const MapComponent: React.FC<MapComponentProps> = ({ data, onPointClick, selectedPoint }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize map
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView([40.4168, -3.7038], 13);

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
        const isSelected = selectedPoint?.id === point.id;
        const marker = L.marker([point.lat, point.lng], {
          icon: getMarkerIcon(point.type, isSelected)
        }).addTo(mapRef.current!);

        // Add popup
        marker.bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${point.name}</h3>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${point.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center;">
                <span style="color: #fbbf24;">⭐</span>
                <span style="margin-left: 4px; font-size: 14px; color: #374151;">${point.rating}</span>
              </div>
              <span style="font-size: 12px; color: #9ca3af; text-transform: capitalize;">${point.type}</span>
            </div>
          </div>
        `);

        // Add click event
        marker.on('click', () => {
          onPointClick(point);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers if there are any
      if (data.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [data, selectedPoint, onPointClick]);

  useEffect(() => {
    // Center map on selected point
    if (selectedPoint && mapRef.current) {
      mapRef.current.setView([selectedPoint.lat, selectedPoint.lng], 15);
      
      // Open popup for selected marker
      const selectedMarker = markersRef.current.find((marker, index) => 
        data[index]?.id === selectedPoint.id
      );
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [selectedPoint, data]);

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
        <h4 className="text-sm font-semibold mb-2">Leyenda</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#f59e0b' }}></div>
            Restaurantes
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#3b82f6' }}></div>
            Hoteles
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#10b981' }}></div>
            Atracciones
          </div>
        </div>
      </div>

      {/* Map Controls Info */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-lg border z-[1000]">
        <p className="text-xs text-gray-600">Haz clic en los marcadores para más información</p>
      </div>
    </div>
  );
};

export default MapComponent;
