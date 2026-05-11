import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox, { Camera, LocationPuck, MapView, MarkerView } from '@rnmapbox/maps';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
Mapbox.setAccessToken(MAPBOX_TOKEN);

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  location: Coords | null;
  destination: Coords | null;
}

// Mapbox Standard style with `lightPreset: "dusk"` and `show3dObjects: true`
// is the cartoon-illustrated 3D look the user picked from her reference shots
// (low-poly trees, soft shadows, Munich-like roads). Same engine handles
// the dark navigation look — just swap lightPreset to "night."
export function SpriteMap({ location, destination }: Props) {
  if (!location) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>turn on location to see your map</Text>
      </View>
    );
  }

  const mapRef = useRef<MapView>(null);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL="mapbox://styles/mapbox/standard"
        scaleBarEnabled={false}
        compassEnabled={false}
        attributionPosition={{ bottom: 8, right: 8 }}
        logoPosition={{ bottom: 8, left: 8 }}
        onDidFinishLoadingStyle={() => {
          // Use `setConfigProperty` on the Standard style to hit the
          // illustrated cartoon look from the reference screenshots
          // (dusk lighting, low-poly 3D buildings + trees). Cast to any
          // because @rnmapbox/maps types haven't caught up with this
          // Mapbox v3 API yet.
          const m = mapRef.current as unknown as {
            setConfigProperty?: (i: string, k: string, v: unknown) => void;
          } | null;
          m?.setConfigProperty?.('basemap', 'lightPreset', 'dusk');
          m?.setConfigProperty?.('basemap', 'show3dObjects', true);
          m?.setConfigProperty?.('basemap', 'showPedestrianRoads', true);
          m?.setConfigProperty?.('basemap', 'showTransitLabels', false);
        }}
      >
        <Camera
          centerCoordinate={[location.lng, location.lat]}
          zoomLevel={17}
          pitch={55}
          heading={0}
          animationMode="flyTo"
          animationDuration={800}
        />
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
        {destination && (
          <MarkerView coordinate={[destination.lng, destination.lat]}>
            <Text style={styles.sprite}>🏫</Text>
          </MarkerView>
        )}
        <MarkerView coordinate={[location.lng, location.lat]} anchor={{ x: 0.5, y: 1 }}>
          <Text style={styles.sprite}>🚶‍♀️</Text>
        </MarkerView>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden' },
  map: { flex: 1 },
  placeholder: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffedd5',
  },
  placeholderText: { color: '#9a3412', fontSize: 16, fontWeight: '600' },
  sprite: { fontSize: 36 },
});
