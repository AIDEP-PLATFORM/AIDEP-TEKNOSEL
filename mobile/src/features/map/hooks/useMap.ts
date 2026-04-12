import { useEffect, useCallback } from 'react';
import { useMapStore } from '../../../core/stores/map.store';
import api from '../../../core/api/axiosInstance';
import { ENDPOINTS } from '../../../core/api/endpoints';
import type { DamageReportListResponse, RouteCalculateRequest, Route } from '../types';

export function useMap() {
  const {
    damageReports,
    activeRoute,
    loading,
    error,
    setDamageReports,
    setActiveRoute,
    setLoading,
    setError,
    clearRoute,
  } = useMapStore();

  const fetchDamageReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DamageReportListResponse>(ENDPOINTS.DAMAGE.LIST, {
        params: { limit: 200, skip: 0 },
      });
      setDamageReports(res.data.items.filter((r) => r.lat != null && r.lng != null));
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Hasar raporları alınamadı');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateRoute = useCallback(
    async (params: RouteCalculateRequest): Promise<Route> => {
      const res = await api.post<Route>(ENDPOINTS.ROUTES.CALCULATE, params);
      setActiveRoute(res.data);
      return res.data;
    },
    [],
  );

  useEffect(() => {
    fetchDamageReports();
  }, []);

  return {
    damageReports,
    activeRoute,
    loading,
    error,
    fetchDamageReports,
    calculateRoute,
    clearRoute,
  };
}
