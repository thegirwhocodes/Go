import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpriteMap } from '@/components/SpriteMap';
import { BigButton } from '@/components/BigButton';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useNextEvent } from '@/hooks/useNextEvent';
import { api } from '@/lib/api';
import { ensurePushPermission } from '@/lib/notifications';

export default function HomeScreen() {
  const { location, requesting, request } = useCurrentLocation();
  const next = useNextEvent();
  const [paymentLocked, setPaymentLocked] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = await ensurePushPermission();
      if (token) await api.updatePushToken(token).catch(() => undefined);
      const me = await api.getMe().catch(() => null);
      setPaymentLocked(me?.paymentLocked ?? false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Go</Text>
        <View style={styles.headerActions}>
          <Link href="/rollcall" style={styles.headerLink}>
            roll call
          </Link>
          <Link href="/settings" style={styles.headerLink}>
            settings
          </Link>
        </View>
      </View>

      {paymentLocked ? (
        <View style={styles.lockout}>
          <Text style={styles.lockoutTitle}>payment method required</Text>
          <Text style={styles.lockoutCopy}>
            Go is paused until there is an active card or bank account again.
          </Text>
          <Link href="/settings" style={styles.lockoutLink}>
            fix payment
          </Link>
        </View>
      ) : (
        <>
          <SpriteMap location={location} destination={next?.destination ?? null} />

          <View style={styles.card}>
            {next ? (
              <>
                <Text style={styles.cardLabel}>up next</Text>
                <Text style={styles.cardTitle}>{next.title}</Text>
                <Text style={styles.cardSub}>
                  be there by{' '}
                  {next.requiredArrivalAt.toLocaleTimeString([], { timeStyle: 'short' })}
                </Text>
              </>
            ) : (
              <Text style={styles.cardSub}>no upcoming events with a location</Text>
            )}
            {!location && (
              <BigButton onPress={request} loading={requesting}>
                turn on location
              </BigButton>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#7c2d12' },
  headerActions: { flexDirection: 'row', gap: 16 },
  headerLink: { color: '#9a3412', fontSize: 14, fontWeight: '600' },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#ffedd5',
    gap: 4,
  },
  cardLabel: { color: '#9a3412', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { color: '#7c2d12', fontSize: 22, fontWeight: '800' },
  cardSub: { color: '#9a3412', fontSize: 16 },
  lockout: {
    margin: 16,
    padding: 20,
    borderRadius: 4,
    backgroundColor: '#111827',
    gap: 12,
  },
  lockoutTitle: { color: '#fff7ed', fontSize: 24, fontWeight: '900' },
  lockoutCopy: { color: '#fed7aa', fontSize: 16, lineHeight: 22 },
  lockoutLink: { color: '#fdba74', fontSize: 18, fontWeight: '800' },
});
