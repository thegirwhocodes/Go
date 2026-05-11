import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';

export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.emoji}>🚶‍♀️</Text>
        <Text style={styles.title}>be 30 minutes early.{`\n`}every time.</Text>
        <Text style={styles.sub}>
          this app reads your calendar, walks you to class, and charges you $100 if you don't make
          it 30 minutes early.
        </Text>
      </View>
      <BigButton onPress={() => router.push('/onboarding/calendar')}>let's go</BigButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  body: { gap: 16, marginTop: 80 },
  emoji: { fontSize: 80 },
  title: { fontSize: 42, fontWeight: '900', color: '#7c2d12', lineHeight: 48 },
  sub: { fontSize: 17, color: '#9a3412', lineHeight: 24 },
});
