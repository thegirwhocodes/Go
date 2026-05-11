import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TodayEvent {
  id: string;
  title: string;
  startsAt: Date;
  requiredArrivalAt: Date;
}

export function useTodaysEvents(): TodayEvent[] {
  const [events, setEvents] = useState<TodayEvent[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const upcoming = await api.getUpcomingEvents();
      if (cancelled) return;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      const filtered = upcoming
        .filter((e) => {
          const t = new Date(e.startsAt);
          return t >= startOfDay && t < endOfDay;
        })
        .map((e) => ({
          id: e.id,
          title: e.title,
          startsAt: new Date(e.startsAt),
          requiredArrivalAt: new Date(e.requiredArrivalAt),
        }));
      setEvents(filtered);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);
  return events;
}
