import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { connectApplePay, connectBankAccount } from '@/lib/payment';

export default function OnboardingPayment() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.title}>set up the penalty</Text>
        <Text style={styles.sub}>
          when you're late, this app charges you $100. you must connect at least one payment
          method. removing one takes 7 days — that's the whole point.
        </Text>
      </View>
      <View style={{ gap: 12 }}>
        <BigButton onPress={connectApplePay}>connect Apple Pay</BigButton>
        <BigButton onPress={connectBankAccount} variant="secondary">
          connect Bank of America
        </BigButton>
        <BigButton onPress={() => router.push('/onboarding/permissions')} variant="secondary">
          continue
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
});
