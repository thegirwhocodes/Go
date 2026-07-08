import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { setArrivalGeofences } from '@/lib/location';

interface NextEvent {
  id: string;
  title: string;
  startsAt: Date;
  requiredArrivalAt: Date;
  destination: { lat: number; lng: number } | null;
}

// Polls the server for the next upcoming event with a location. Once
// websockets/SSE are wired up we can swap this for a push subscription.
export function useNextEvent(): NextEvent | null {
  const [next, setNext] = useState<NextEvent | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const events = await api.getUpcomingEvents();
      if (cancelled) return;
      const geofenceTargets = events
        .filter((e) => e.destinationLat != null && e.destinationLng != null)
        .map((e) => ({ eventId: e.id, lat: e.destinationLat!, lng: e.destinationLng! }));
      if (geofenceTargets.length > 0) {
        await setArrivalGeofences(geofenceTargets).catch(() => undefined);
      }
      const ev = events[0];
      if (!ev) return setNext(null);
      setNext({
        id: ev.id,
        title: ev.title,
        startsAt: new Date(ev.startsAt),
        requiredArrivalAt: new Date(ev.requiredArrivalAt),
        destination:
          ev.destinationLat != null && ev.destinationLng != null
            ? { lat: ev.destinationLat, lng: ev.destinationLng }
            : null,
      });
    }
    void tick();
    const interval = setInterval(() => void tick(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  return next;
}
