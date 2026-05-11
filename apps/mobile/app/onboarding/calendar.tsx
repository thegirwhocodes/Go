import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { startGoogleSignIn } from '@/lib/auth';

export default function OnboardingCalendar() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>connect your calendar</Text>
        <Text style={styles.sub}>
          we read your Google Calendar (read-only) so we know when and where your classes are.
        </Text>
      </View>
      <BigButton
        onPress={async () => {
          await startGoogleSignIn();
          router.push('/onboarding/payment');
        }}
      >
        sign in with Google
      </BigButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  body: { gap: 16, marginTop: 80 },
  emoji: { fontSize: 80 },
  title: { fontSize: 36, fontWeight: '900', color: '#7c2d12' },
  sub: { fontSize: 17, color: '#9a3412', lineHeight: 24 },
});
