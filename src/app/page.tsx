'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Type definitions
interface MapPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string;
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

// Mock data for Región Metropolitana de Santiago - Chile
const mockData = {
  restaurants: [
    // Las Condes
    { id: 1, name: 'Boragó', lat: -33.4126, lng: -70.5447, type: 'restaurant', rating: 4.8, description: 'Restaurante galardonado con cocina chilena contemporánea - Las Condes' },
    { id: 2, name: 'Osaka', lat: -33.4156, lng: -70.5389, type: 'restaurant', rating: 4.6, description: 'Fusión nikkei con ingredientes locales - Las Condes' },
    // Providencia
    { id: 3, name: 'Ambrosía', lat: -33.4372, lng: -70.6106, type: 'restaurant', rating: 4.5, description: 'Bistró francés con ambiente acogedor - Providencia' },
    // Santiago Centro
    { id: 4, name: 'Galindo', lat: -33.4378, lng: -70.6504, type: 'restaurant', rating: 4.3, description: 'Comida chilena tradicional desde 1896 - Santiago Centro' },
    // Vitacura
    { id: 5, name: 'Mestizo', lat: -33.3978, lng: -70.5445, type: 'restaurant', rating: 4.4, description: 'Cocina chilena con vista panorámica - Vitacura' },
    // Ñuñoa
    { id: 6, name: 'Fuente Alemana', lat: -33.4578, lng: -70.5978, type: 'restaurant', rating: 4.2, description: 'Famosos completos italianos - Ñuñoa' },
  ],
  hotels: [
    // Las Condes
    { id: 7, name: 'The Ritz-Carlton Santiago', lat: -33.4142, lng: -70.5398, type: 'hotel', rating: 4.9, description: 'Hotel de lujo en el corazón financiero - Las Condes' },
    // Providencia
    { id: 8, name: 'Hotel Orly', lat: -33.4322, lng: -70.6156, type: 'hotel', rating: 4.1, description: 'Hotel boutique en barrio Providencia' },
    // Santiago Centro
    { id: 9, name: 'Hotel Plaza San Francisco', lat: -33.4428, lng: -70.6506, type: 'hotel', rating: 4.3, description: 'Hotel histórico en el centro de Santiago' },
    // Vitacura
    { id: 10, name: 'W Santiago', lat: -33.4056, lng: -70.5289, type: 'hotel', rating: 4.6, description: 'Hotel moderno y vibrante - Vitacura' },
    // Lo Barnechea
    { id: 11, name: 'Hotel Cumbres Vitacura', lat: -33.3789, lng: -70.5234, type: 'hotel', rating: 4.4, description: 'Hotel con vista a la cordillera - Lo Barnechea' },
  ],
  attractions: [
    // Las Condes
    { id: 12, name: 'Costanera Center', lat: -33.4178, lng: -70.5456, type: 'attraction', rating: 4.5, description: 'Torre más alta de América Latina - Las Condes' },
    { id: 13, name: 'Parque Araucano', lat: -33.4123, lng: -70.5334, type: 'attraction', rating: 4.4, description: 'Amplio parque urbano - Las Condes' },
    // Santiago Centro
    { id: 14, name: 'Plaza de Armas', lat: -33.4378, lng: -70.6504, type: 'attraction', rating: 4.3, description: 'Plaza principal de Santiago - Centro Histórico' },
    { id: 15, name: 'Palacio de La Moneda', lat: -33.4428, lng: -70.6506, type: 'attraction', rating: 4.6, description: 'Palacio presidencial de Chile - Santiago Centro' },
    { id: 16, name: 'Cerro San Cristóbal', lat: -33.4234, lng: -70.6334, type: 'attraction', rating: 4.7, description: 'Mirador con vista panorámica de Santiago' },
    // Providencia
    { id: 17, name: 'Cerro San Cristóbal - Teleférico', lat: -33.4156, lng: -70.6234, type: 'attraction', rating: 4.5, description: 'Teleférico al cerro más famoso - Providencia' },
    // Maipú
    { id: 18, name: 'Templo Votivo de Maipú', lat: -33.5067, lng: -70.7589, type: 'attraction', rating: 4.2, description: 'Santuario nacional de Chile - Maipú' },
    // Pirque
    { id: 19, name: 'Viña Concha y Toro', lat: -33.6667, lng: -70.5789, type: 'attraction', rating: 4.6, description: 'Viña histórica y tours - Pirque' },
  ],
  services: [
    // Las Condes
    { id: 20, name: 'Clínica Las Condes', lat: -33.4134, lng: -70.5356, type: 'service', rating: 4.8, description: 'Centro médico de excelencia - Las Condes' },
    // Santiago Centro
    { id: 21, name: 'Hospital Salvador', lat: -33.4445, lng: -70.6234, type: 'service', rating: 4.2, description: 'Hospital público de referencia - Santiago Centro' },
    // Providencia
    { id: 22, name: 'Universidad Católica', lat: -33.4389, lng: -70.6378, type: 'service', rating: 4.6, description: 'Universidad pontificia - Providencia' },
    // Ñuñoa
    { id: 23, name: 'Estadio Nacional', lat: -33.4634, lng: -70.6098, type: 'service', rating: 4.4, description: 'Estadio nacional de Chile - Ñuñoa' },
    // Vitacura
    { id: 24, name: 'Clínica Alemana', lat: -33.3889, lng: -70.5456, type: 'service', rating: 4.7, description: 'Centro médico privado - Vitacura' },
    // Puente Alto
    { id: 25, name: 'Hospital Sótero del Río', lat: -33.6123, lng: -70.5789, type: 'service', rating: 4.1, description: 'Hospital de alta complejidad - Puente Alto' },
  ]
};

const categories: Category[] = [
  { key: 'all', label: 'Todos', icon: '🗺️' },
  { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  { key: 'hotels', label: 'Hoteles', icon: '🏨' },
  { key: 'attractions', label: 'Atracciones', icon: '🎭' },
  { key: 'services', label: 'Servicios', icon: '🏥' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredData, setFilteredData] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredData([...mockData.restaurants, ...mockData.hotels, ...mockData.attractions, ...mockData.services]);
    } else {
      setFilteredData((mockData as any)[selectedCategory] || []);
    }
  }, [selectedCategory]);

  const handlePointClick = (point: MapPoint) => {
    setSelectedPoint(point);
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
      <div className="w-80 bg-white shadow-lg border-l flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <h1 className="text-lg font-bold text-gray-900">🗺️ Región Metropolitana</h1>
          <p className="text-xs text-gray-500 mt-1">
            Santiago, Chile • {filteredData.length} lugares
          </p>
        </div>

        {/* Categories */}
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Categorías</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                  selectedCategory === category.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
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
          <div className="p-4 border-b bg-blue-50">
            <h3 className="font-semibold text-blue-900 text-sm">{selectedPoint.name}</h3>
            <p className="text-xs text-blue-700 mt-1">{selectedPoint.description}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500 text-sm">⭐</span>
              <span className="ml-1 text-xs text-blue-700">{selectedPoint.rating}</span>
              <span className="ml-auto text-xs text-blue-600 capitalize">{selectedPoint.type}</span>
            </div>
          </div>
        )}

        {/* Points List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">
              {selectedCategory === 'all' ? 'Todos los lugares' : categories.find(c => c.key === selectedCategory)?.label}
            </h2>
            <div className="space-y-3">
              {filteredData.map((point) => (
                <div 
                  key={point.id}
                  className={`bg-white rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedPoint?.id === point.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handlePointClick(point)}
                >
                  <h3 className="font-semibold text-gray-900 text-sm">{point.name}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{point.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="ml-1 text-xs text-gray-700">{point.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {point.type}
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
