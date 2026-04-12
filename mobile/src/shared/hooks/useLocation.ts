import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useLocationPermission } from './usePermissions';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const { granted } = useLocationPermission();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!granted) return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 20,
      },
      (loc) => {
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      },
    )
      .then((sub) => {
        subRef.current = sub;
      })
      .catch(() => setError('Konum alınamadı'));

    return () => {
      subRef.current?.remove();
    };
  }, [granted]);

  return { location, error };
}
