import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';

export function useCurrentLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [requesting, setRequesting] = useState(false);

  async function request() {
    setRequesting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      if (await getCurrentUserId()) {
        await api.pushLocation(coords.lat, coords.lng).catch(() => undefined);
      }
    } finally {
      setRequesting(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        if (await getCurrentUserId()) {
          await api.pushLocation(coords.lat, coords.lng).catch(() => undefined);
        }
      }
    })();
  }, []);

  return { location, requesting, request };
}
