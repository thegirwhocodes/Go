import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocationAlias, PaymentMethod } from '@class-on-time/shared';
import { BigButton } from '@/components/BigButton';
import { api } from '@/lib/api';
import { connectBankAccount } from '@/lib/payment';

export default function Settings() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [locationAliases, setLocationAliases] = useState<LocationAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const pendingAliases = locationAliases.filter((alias) => !alias.confirmedByUser);

  async function load() {
    setLoading(true);
    try {
      const [methods, aliases] = await Promise.all([
        api.getPaymentMethods(),
        api.getLocationAliases(),
      ]);
      setPaymentMethods(methods);
      setLocationAliases(aliases);
    } catch {
      setPaymentMethods([]);
      setLocationAliases([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Link href="/" style={styles.back}>
        ← back
      </Link>
      <Text style={styles.title}>settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>payment methods</Text>
        {loading ? <ActivityIndicator color="#9a3412" /> : null}
        {!loading && paymentMethods.length === 0 ? (
          <View style={styles.lockout}>
            <Text style={styles.lockoutTitle}>payment method required</Text>
            <Text style={styles.lockoutCopy}>
              no active card or bank account means Go cannot enforce the commitment.
            </Text>
            <BigButton
              onPress={async () => {
                setBusy('add');
                try {
                  await connectBankAccount();
                  await load();
                } finally {
                  setBusy(null);
                }
              }}
              loading={busy === 'add'}
            >
              reconnect payment
            </BigButton>
          </View>
        ) : null}
        {paymentMethods.map((pm) => (
          <View key={pm.id} style={styles.pmRow}>
            <View>
              <Text style={styles.pmTitle}>
                {pm.type === 'us_bank_account' ? 'bank account' : 'card'}
              </Text>
              <Text style={styles.pmSub}>
                {pm.last4 ? `**** ${pm.last4}` : 'saved method'} - {pm.status.replace('_', ' ')}
              </Text>
              {pm.removableAt ? (
                <Text style={styles.pmSub}>
                  removable {new Date(pm.removableAt).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
            {pm.status === 'active' ? (
              <BigButton
                variant="secondary"
                loading={busy === pm.id}
                onPress={async () => {
                  setBusy(pm.id);
                  try {
                    await api.removePaymentMethod(pm.id);
                    await load();
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                remove
              </BigButton>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>location memory</Text>
        {!loading && pendingAliases.length === 0 ? (
          <Text style={styles.placeholder}>no location confirmations pending.</Text>
        ) : null}
        {pendingAliases.map((alias) => (
          <View key={alias.id} style={styles.aliasRow}>
            <Text style={styles.pmTitle}>"{alias.normalizedPhrase}"</Text>
            <Text style={styles.pmSub}>use {alias.resolvedLocationText}?</Text>
            <View style={styles.aliasActions}>
              <BigButton
                loading={busy === `alias:${alias.id}:yes`}
                onPress={async () => {
                  setBusy(`alias:${alias.id}:yes`);
                  try {
                    await api.confirmLocationAlias(alias.id, true);
                    await load();
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                yes
              </BigButton>
              <BigButton
                variant="secondary"
                loading={busy === `alias:${alias.id}:no`}
                onPress={async () => {
                  setBusy(`alias:${alias.id}:no`);
                  try {
                    await api.confirmLocationAlias(alias.id, false);
                    await load();
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                not this
              </BigButton>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>history</Text>
        <Text style={styles.placeholder}>
          (recent arrivals + on-time/late + any charges incurred.)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 24 },
  back: { fontSize: 16, color: '#9a3412', fontWeight: '600' },
  title: { fontSize: 36, fontWeight: '900', color: '#7c2d12' },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 12,
    color: '#9a3412',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  placeholder: { fontSize: 15, color: '#9a3412', lineHeight: 22 },
  pmRow: {
    backgroundColor: '#ffedd5',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  aliasRow: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  aliasActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pmTitle: { color: '#7c2d12', fontSize: 17, fontWeight: '800' },
  pmSub: { color: '#9a3412', fontSize: 14 },
  lockout: { backgroundColor: '#111827', borderRadius: 4, padding: 18, gap: 12 },
  lockoutTitle: { color: '#fff7ed', fontSize: 22, fontWeight: '900' },
  lockoutCopy: { color: '#fed7aa', fontSize: 15, lineHeight: 22 },
});
