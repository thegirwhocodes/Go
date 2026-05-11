import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
