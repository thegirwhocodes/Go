import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const BG_LOCATION_TASK = 'cot.bg-location';
const ARRIVAL_GEOFENCE_TASK = 'cot.geofence';

TaskManager.defineTask(BG_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const last = locations.at(-1);
  if (!last) return;
  // TODO: forward to /api/me/location with stored userId.
  console.log('bg location', last.coords);
});

TaskManager.defineTask(ARRIVAL_GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data) return;
  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };
  if (eventType !== Location.GeofencingEventType.Enter) return;
  // TODO: POST to /api/arrivals with the event id stored on the region identifier.
  console.log('arrived at', region.identifier);
});

export async function ensureBackgroundLocation(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') return false;
  const started = await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK);
  if (!started) {
    await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5 * 60 * 1000,
      distanceInterval: 100,
      showsBackgroundLocationIndicator: false,
    });
  }
  return true;
}

export async function setArrivalGeofences(
  destinations: { eventId: string; lat: number; lng: number }[],
) {
  await Location.startGeofencingAsync(
    ARRIVAL_GEOFENCE_TASK,
    destinations.map((d) => ({
      identifier: d.eventId,
      latitude: d.lat,
      longitude: d.lng,
      radius: 50,
      notifyOnEnter: true,
      notifyOnExit: false,
    })),
  );
}
