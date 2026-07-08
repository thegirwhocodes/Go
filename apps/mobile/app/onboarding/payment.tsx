import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { connectBankAccount, connectCard } from '@/lib/payment';

export default function OnboardingPayment() {
  const router = useRouter();
  const [loading, setLoading] = useState<'card' | 'bank' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect(kind: 'card' | 'bank') {
    setLoading(kind);
    setError(null);
    try {
      if (kind === 'card') await connectCard();
      else await connectBankAccount();
      router.push('/onboarding/permissions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'payment setup failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.title}>set up the penalty</Text>
        <Text style={styles.sub}>
          when you're late, this app charges you $100. you must connect at least one payment
          method. removing one takes 7 days. that's the whole point.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={{ gap: 12 }}>
        <BigButton onPress={() => connect('card')} loading={loading === 'card'}>
          connect card
        </BigButton>
        <BigButton onPress={() => connect('bank')} loading={loading === 'bank'} variant="secondary">
          connect Bank of America
        </BigButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  body: { gap: 16, marginTop: 60 },
  emoji: { fontSize: 80 },
  title: { fontSize: 36, fontWeight: '900', color: '#7c2d12' },
  sub: { fontSize: 17, color: '#9a3412', lineHeight: 24 },
  error: { color: '#b91c1c', fontSize: 14, fontWeight: '700' },
});
