import { StyleSheet, Text, View } from 'react-native';

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  location: Coords | null;
  destination: Coords | null;
}

export function SpriteMap({ location, destination }: Props) {
  if (!location) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>turn on location to see your map</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.road, styles.roadNorth]} />
      <View style={[styles.road, styles.roadEast]} />
      <View style={[styles.road, styles.roadHill]} />

      <View style={[styles.green, styles.greenTop]} />
      <View style={[styles.green, styles.greenBottom]} />

      <View style={[styles.building, styles.buildingOlin]}>
        <Text style={styles.buildingText}>{destination ? 'next' : 'campus'}</Text>
      </View>
      <View style={[styles.building, styles.buildingUsdan]} />
      <View style={[styles.building, styles.buildingExley]} />

      {destination ? (
        <View style={styles.destination}>
          <View style={styles.destinationPulse} />
          <Text style={styles.destinationSprite}>class</Text>
        </View>
      ) : null}

      <View style={styles.routeA} />
      <View style={styles.routeB} />
      <View style={styles.routeC} />

      <View style={styles.walker}>
        <Text style={styles.walkerFace}>go</Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>walking map</Text>
        <Text style={styles.statusText}>
          {destination ? 'route locked to your next commitment' : 'waiting for next destination'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#24332d',
  },
  placeholder: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffedd5',
  },
  placeholderText: { color: '#9a3412', fontSize: 16, fontWeight: '600' },
  road: {
    position: 'absolute',
    backgroundColor: '#45505a',
    opacity: 0.9,
    borderRadius: 999,
  },
  roadNorth: {
    width: 32,
    height: '120%',
    left: '27%',
    top: '-10%',
    transform: [{ rotate: '-8deg' }],
  },
  roadEast: {
    width: '130%',
    height: 38,
    left: '-15%',
    top: '62%',
    transform: [{ rotate: '7deg' }],
  },
  roadHill: {
    width: 26,
    height: '100%',
    right: '18%',
    top: '4%',
    transform: [{ rotate: '18deg' }],
  },
  green: {
    position: 'absolute',
    width: 150,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#2f6b4f',
    opacity: 0.55,
  },
  greenTop: { top: 34, left: 24 },
  greenBottom: { bottom: 42, right: 28 },
  building: {
    position: 'absolute',
    backgroundColor: '#fef3c7',
    borderColor: '#7c2d12',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  buildingOlin: {
    width: 112,
    height: 74,
    right: 44,
    top: 82,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingUsdan: { width: 80, height: 62, left: 54, top: 136, borderRadius: 6 },
  buildingExley: { width: 96, height: 92, right: 64, bottom: 86, borderRadius: 6 },
  buildingText: { color: '#7c2d12', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  destination: {
    position: 'absolute',
    right: 76,
    top: 102,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fb923c',
    opacity: 0.24,
  },
  destinationSprite: {
    color: '#fff7ed',
    backgroundColor: '#fb923c',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  routeA: {
    position: 'absolute',
    left: 86,
    bottom: 92,
    width: 108,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#fb923c',
    transform: [{ rotate: '-28deg' }],
  },
  routeB: {
    position: 'absolute',
    left: 166,
    bottom: 140,
    width: 92,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#fb923c',
    transform: [{ rotate: '-8deg' }],
  },
  routeC: {
    position: 'absolute',
    right: 108,
    top: 150,
    width: 98,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#fb923c',
    transform: [{ rotate: '-42deg' }],
  },
  walker: {
    position: 'absolute',
    left: 70,
    bottom: 74,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff7ed',
    borderWidth: 3,
  },
  walkerFace: { color: '#fff7ed', fontSize: 13, fontWeight: '900' },
  status: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusLabel: { color: '#9a3412', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusText: { color: '#7c2d12', fontSize: 14, fontWeight: '700', marginTop: 2 },
});
