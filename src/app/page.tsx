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

// Mock data for different categories
const mockData = {
  restaurants: [
    { id: 1, name: 'Restaurante El Buen Sabor', lat: 40.4168, lng: -3.7038, type: 'restaurant', rating: 4.5, description: 'Cocina tradicional española' },
    { id: 2, name: 'Pizzería Napoli', lat: 40.4178, lng: -3.7028, type: 'restaurant', rating: 4.2, description: 'Auténtica pizza italiana' },
    { id: 3, name: 'Sushi Zen', lat: 40.4158, lng: -3.7048, type: 'restaurant', rating: 4.7, description: 'Sushi fresco y delicioso' },
  ],
  hotels: [
    { id: 4, name: 'Hotel Plaza Mayor', lat: 40.4152, lng: -3.7077, type: 'hotel', rating: 4.3, description: 'Hotel boutique en el centro histórico' },
    { id: 5, name: 'Gran Hotel Príncipe', lat: 40.4187, lng: -3.7018, type: 'hotel', rating: 4.8, description: 'Lujo y confort en el corazón de la ciudad' },
  ],
  attractions: [
    { id: 6, name: 'Museo del Prado', lat: 40.4138, lng: -3.6921, type: 'attraction', rating: 4.9, description: 'Uno de los museos más importantes del mundo' },
    { id: 7, name: 'Parque del Retiro', lat: 40.4152, lng: -3.6844, type: 'attraction', rating: 4.6, description: 'Hermoso parque para pasear y relajarse' },
    { id: 8, name: 'Palacio Real', lat: 40.4179, lng: -3.7142, type: 'attraction', rating: 4.7, description: 'Majestuoso palacio real con visitas guiadas' },
  ]
};

const categories: Category[] = [
  { key: 'all', label: 'Todos', icon: '🗺️' },
  { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  { key: 'hotels', label: 'Hoteles', icon: '🏨' },
  { key: 'attractions', label: 'Atracciones', icon: '🎭' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredData, setFilteredData] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredData([...mockData.restaurants, ...mockData.hotels, ...mockData.attractions]);
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
          <h1 className="text-lg font-bold text-gray-900">🗺️ Explorador</h1>
          <p className="text-xs text-gray-500 mt-1">
            {filteredData.length} resultados encontrados
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
