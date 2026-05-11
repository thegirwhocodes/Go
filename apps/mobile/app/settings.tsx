import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      <Link href="/" style={styles.back}>
        ← back
      </Link>
      <Text style={styles.title}>settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>payment methods</Text>
        <Text style={styles.placeholder}>
          (list of connected Apple Pay + bank accounts goes here. each one shows a "remove"
          button that schedules removal 7 days out.)
        </Text>
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
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 12,
    color: '#9a3412',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  placeholder: { fontSize: 15, color: '#9a3412', lineHeight: 22 },
});
