import { create } from 'zustand';
import type { DamageReport, Route } from '../../features/map/types';

interface MapState {
  damageReports: DamageReport[];
  activeRoute: Route | null;
  loading: boolean;
  error: string | null;
  pendingRouteModal: boolean; // rota modal'ını otomatik aç

  setDamageReports: (reports: DamageReport[]) => void;
  setActiveRoute: (route: Route | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRoute: () => void;
  triggerRouteModal: () => void;
  clearRouteModalTrigger: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  damageReports: [],
  activeRoute: null,
  loading: false,
  error: null,
  pendingRouteModal: false,

  setDamageReports:      (reports) => set({ damageReports: reports }),
  setActiveRoute:        (route)   => set({ activeRoute: route }),
  setLoading:            (loading) => set({ loading }),
  setError:              (error)   => set({ error }),
  clearRoute:            ()        => set({ activeRoute: null }),
  triggerRouteModal:     ()        => set({ pendingRouteModal: true }),
  clearRouteModalTrigger: ()       => set({ pendingRouteModal: false }),
}));
