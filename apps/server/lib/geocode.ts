// Forward geocoding. Mapbox returns the campus centroid for every Wesleyan
// building query, so for known places on/near campus we use a hardcoded
// lookup keyed on substrings of the query. Mapbox is the fallback for
// anything that doesn't match.

const WESLEYAN_LAT = 41.5559;
const WESLEYAN_LNG = -72.6553;

// Coordinates pulled from OpenStreetMap / Wesleyan's campus map. Refine
// later by walking the campus with the app open.
const WESLEYAN_VENUES: Array<{ match: RegExp; lat: number; lng: number; canonical: string }> = [
  { match: /olin/i, lat: 41.5543, lng: -72.6588, canonical: 'Olin Memorial Library, Wesleyan University' },
  { match: /usdan/i, lat: 41.5556, lng: -72.6572, canonical: 'Usdan University Center, Wesleyan University' },
  { match: /freeman|gym/i, lat: 41.5564, lng: -72.6606, canonical: 'Freeman Athletic Center, Wesleyan University' },
  { match: /exley/i, lat: 41.5558, lng: -72.6595, canonical: 'Exley Science Center, Wesleyan University' },
  { match: /\bpac\b|public affairs/i, lat: 41.5566, lng: -72.6577, canonical: 'Public Affairs Center, Wesleyan University' },
  { match: /fayerweather/i, lat: 41.5572, lng: -72.6580, canonical: 'Fayerweather, Wesleyan University' },
  { match: /foss/i, lat: 41.5567, lng: -72.6581, canonical: 'Foss Hill, Wesleyan University' },
  { match: /main\s*st(reet)?/i, lat: 41.5623, lng: -72.6506, canonical: 'Main Street, Middletown CT' },
  { match: /center\s+for\s+the\s+arts|\bCFA\b/i, lat: 41.5566, lng: -72.6549, canonical: 'Center for the Arts, Wesleyan University' },
  { match: /science\s+library/i, lat: 41.5558, lng: -72.6593, canonical: 'Science Library, Wesleyan University' },
  { match: /\bzelnick\b/i, lat: 41.5564, lng: -72.6557, canonical: 'Zelnick Pavilion, Wesleyan University' },
  { match: /\bjudd\b/i, lat: 41.5573, lng: -72.6587, canonical: 'Judd Hall, Wesleyan University' },
  { match: /\bbroad\s*st(reet)?/i, lat: 41.5588, lng: -72.6557, canonical: 'Broad Street, Middletown CT' },
  { match: /\bwillys?\b/i, lat: 41.5598, lng: -72.6580, canonical: 'Willy Mitchell Field / Wadsworth Mansion area' },
];

export interface GeocodeResult {
  lat: number;
  lng: number;
  placeName: string;
  source: 'wesleyan_table' | 'mapbox';
}

export async function geocode(query: string): Promise<GeocodeResult | null> {
  for (const v of WESLEYAN_VENUES) {
    if (v.match.test(query)) {
      return { lat: v.lat, lng: v.lng, placeName: v.canonical, source: 'wesleyan_table' };
    }
  }
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set('access_token', token);
  url.searchParams.set('proximity', `${WESLEYAN_LNG},${WESLEYAN_LAT}`);
  url.searchParams.set('limit', '1');
  url.searchParams.set('types', 'poi,address');
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    features: Array<{ place_name: string; center: [number, number] }>;
  };
  const top = json.features[0];
  if (!top) return null;
  return {
    lat: top.center[1],
    lng: top.center[0],
    placeName: top.place_name,
    source: 'mapbox',
  };
}
