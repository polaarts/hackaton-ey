'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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

const categories = [
  { key: 'all', label: 'Todos', icon: '🗺️' },
  { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  { key: 'hotels', label: 'Hoteles', icon: '🏨' },
  { key: 'attractions', label: 'Atracciones', icon: '🎭' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredData([...mockData.restaurants, ...mockData.hotels, ...mockData.attractions]);
    } else {
      setFilteredData(mockData[selectedCategory] || []);
    }
  }, [selectedCategory]);

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">🗺️ Explorador de Ciudad</h1>
            <div className="text-sm text-gray-500">
              Datos mockeados para demostración
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Categorías</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
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

              {/* Results Count */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{filteredData.length}</strong> resultados encontrados
                </p>
              </div>

              {/* Selected Point Info */}
              {selectedPoint && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900">{selectedPoint.name}</h3>
                  <p className="text-sm text-blue-700 mt-1">{selectedPoint.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-sm text-blue-700">{selectedPoint.rating}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <MapComponent 
                  data={filteredData}
                  onPointClick={handlePointClick}
                  selectedPoint={selectedPoint}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Points List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory === 'all' ? 'Todos los lugares' : categories.find(c => c.key === selectedCategory)?.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((point) => (
              <div 
                key={point.id}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPoint?.id === point.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePointClick(point)}
              >
                <h3 className="font-semibold text-gray-900">{point.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-sm text-gray-700">{point.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{point.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
