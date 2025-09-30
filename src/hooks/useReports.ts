import { useState, useEffect, useCallback } from 'react';
import { getLastWeekReports, getTodaysReports, type ApiReport } from '@/lib/api';
import { convertApiReportsToPointsOfInterest, groupReportsByConfidence, type PointOfInterest, type Confidence } from '@/lib/reportConverter';
import { mockApiReports } from '@/lib/mockData';

interface UseReportsState {
  // Estados de carga
  loading: boolean;
  error: string | null;
  usingMockData: boolean;
  
  // Datos
  allReports: PointOfInterest[];
  groupedReports: Record<Confidence, PointOfInterest[]>;
  
  // Funciones
  refreshReports: () => Promise<void>;
  loadTodaysReports: () => Promise<void>;
  loadLastWeekReports: () => Promise<void>;
}

export function useReports(): UseReportsState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [allReports, setAllReports] = useState<PointOfInterest[]>([]);

  // Función para cargar reportes
  const loadReports = useCallback(async (apiCall: () => Promise<ApiReport[]>) => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      const apiReports = await apiCall();
      const convertedReports = convertApiReportsToPointsOfInterest(apiReports);
      
      setAllReports(convertedReports);
      
      console.log(`Cargados ${convertedReports.length} reportes desde la API`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error cargando reportes desde API, usando datos mock:', errorMessage);
      
      // Fallback a datos mock cuando la API falla
      setError(`API no disponible: ${errorMessage}`);
      setUsingMockData(true);
      
      const mockReports = convertApiReportsToPointsOfInterest(mockApiReports);
      setAllReports(mockReports);
      
      console.log(`Usando ${mockReports.length} reportes mock como fallback`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funciones específicas para diferentes rangos de tiempo
  const loadTodaysReports = useCallback(() => loadReports(getTodaysReports), [loadReports]);
  const loadLastWeekReports = useCallback(() => loadReports(getLastWeekReports), [loadReports]);
  const refreshReports = useCallback(() => loadLastWeekReports(), [loadLastWeekReports]);

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadLastWeekReports();
  }, [loadLastWeekReports]);

  // Agrupar reportes por confianza
  const groupedReports = groupReportsByConfidence(allReports);

  return {
    loading,
    error,
    usingMockData,
    allReports,
    groupedReports,
    refreshReports,
    loadTodaysReports,
    loadLastWeekReports,
  };
}
