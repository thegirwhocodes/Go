import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { ensureBackgroundLocation } from '@/lib/location';
import { ensurePushPermission } from '@/lib/notifications';

export default function OnboardingPermissions() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>two more things</Text>
        <Text style={styles.sub}>
          we need always-on location to wake you up at the right moment, and notifications so
          you'll see the alert.
        </Text>
      </View>
      <BigButton
        onPress={async () => {
          await ensureBackgroundLocation();
          await ensurePushPermission();
          router.replace('/');
        }}
      >
        grant permissions
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
