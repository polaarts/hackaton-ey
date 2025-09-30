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

// Mock data for Las Condes, Santiago - Chile
const mockData = {
  restaurants: [
    { id: 1, name: 'Boragó', lat: -33.4126, lng: -70.5447, type: 'restaurant', rating: 4.8, description: 'Restaurante galardonado con cocina chilena contemporánea' },
    { id: 2, name: 'Osaka', lat: -33.4156, lng: -70.5389, type: 'restaurant', rating: 4.6, description: 'Fusión nikkei con ingredientes locales' },
    { id: 3, name: 'Aquí Está Coco', lat: -33.4089, lng: -70.5412, type: 'restaurant', rating: 4.4, description: 'Auténtica cocina peruana en Las Condes' },
    { id: 4, name: 'La Mar', lat: -33.4134, lng: -70.5378, type: 'restaurant', rating: 4.5, description: 'Cevichería y cocina marina peruana' },
    { id: 5, name: 'Mestizo', lat: -33.4178, lng: -70.5445, type: 'restaurant', rating: 4.3, description: 'Cocina chilena con vista panorámica' },
  ],
  hotels: [
    { id: 6, name: 'The Ritz-Carlton Santiago', lat: -33.4142, lng: -70.5398, type: 'hotel', rating: 4.9, description: 'Hotel de lujo en el corazón de Las Condes' },
    { id: 7, name: 'Grand Hyatt Santiago', lat: -33.4167, lng: -70.5423, type: 'hotel', rating: 4.7, description: 'Elegante hotel con spa y vistas de la cordillera' },
    { id: 8, name: 'W Santiago', lat: -33.4156, lng: -70.5389, type: 'hotel', rating: 4.6, description: 'Hotel boutique moderno y vibrante' },
    { id: 9, name: 'Hotel Kennedy', lat: -33.4134, lng: -70.5412, type: 'hotel', rating: 4.2, description: 'Hotel ejecutivo en zona comercial' },
  ],
  attractions: [
    { id: 10, name: 'Costanera Center', lat: -33.4178, lng: -70.5456, type: 'attraction', rating: 4.5, description: 'Centro comercial y torre más alta de América Latina' },
    { id: 11, name: 'Parque Araucano', lat: -33.4123, lng: -70.5334, type: 'attraction', rating: 4.4, description: 'Amplio parque urbano ideal para familias' },
    { id: 12, name: 'Centro Comercial Alto Las Condes', lat: -33.4089, lng: -70.5298, type: 'attraction', rating: 4.3, description: 'Exclusivo centro comercial al aire libre' },
    { id: 13, name: 'Kidzania Santiago', lat: -33.4156, lng: -70.5445, type: 'attraction', rating: 4.6, description: 'Ciudad interactiva para niños' },
    { id: 14, name: 'Club de Golf Los Leones', lat: -33.4045, lng: -70.5289, type: 'attraction', rating: 4.7, description: 'Prestigioso club de golf con vista a la cordillera' },
    { id: 15, name: 'Museo de la Moda', lat: -33.4167, lng: -70.5378, type: 'attraction', rating: 4.2, description: 'Museo dedicado a la moda y el diseño' },
  ],
  services: [
    { id: 16, name: 'Clínica Las Condes', lat: -33.4134, lng: -70.5356, type: 'service', rating: 4.8, description: 'Prestigioso centro médico privado' },
    { id: 17, name: 'Universidad Adolfo Ibáñez', lat: -33.4098, lng: -70.5267, type: 'service', rating: 4.5, description: 'Universidad privada de prestigio' },
    { id: 18, name: 'Metro Escuela Militar', lat: -33.4156, lng: -70.5423, type: 'service', rating: 4.0, description: 'Estación de metro línea 1' },
    { id: 19, name: 'Metro Los Leones', lat: -33.4089, lng: -70.5289, type: 'service', rating: 4.0, description: 'Estación de metro línea 1' },
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
          <h1 className="text-lg font-bold text-gray-900">🗺️ Las Condes</h1>
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
