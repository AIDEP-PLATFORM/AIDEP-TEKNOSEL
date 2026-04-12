import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocationPermission() {
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      setGranted(status === 'granted');
      setLoading(false);
    });
  }, []);

  const request = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === 'granted';
    setGranted(ok);
    return ok;
  };

  return { granted, loading, request };
}
