// Walking-direction ETA via Mapbox Directions API.
// https://docs.mapbox.com/api/navigation/directions/

export interface WalkingDirections {
  durationSeconds: number;
  distanceMeters: number;
  geometryPolyline: string | null;
}

export async function getWalkingDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<WalkingDirections> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('MAPBOX_ACCESS_TOKEN is not set');
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/walking/${coords}`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('geometries', 'polyline');
  url.searchParams.set('overview', 'full');
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Mapbox directions failed: ${res.status}`);
  const json = (await res.json()) as {
    routes: { duration: number; distance: number; geometry?: string }[];
  };
  const route = json.routes[0];
  if (!route) throw new Error('No walking route found');
  return {
    durationSeconds: Math.round(route.duration),
    distanceMeters: Math.round(route.distance),
    geometryPolyline: route.geometry ?? null,
  };
}
