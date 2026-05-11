import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { BigButton } from '@/components/BigButton';
import { useTodaysEvents } from '@/hooks/useTodaysEvents';
import { confirmEvent } from '@/lib/api';

// Sunsama-style single-column list. One event per row. Big record button per
// event. Recording auto-stops on 1.5s of silence (Day One's tuning). The
// transcript is shown live so she sees what the app heard her say.

type Status =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'classifying' }
  | { kind: 'confirmed' }
  | { kind: 'cancelled'; feeCents: number }
  | { kind: 'unclear'; reason: string }
  | { kind: 'error'; message: string };

export default function RollCallScreen() {
  const events = useTodaysEvents();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" style={styles.back}>
          ← back
        </Link>
        <Text style={styles.title}>roll call</Text>
        <Text style={styles.sub}>
          confirm each one out loud. say "yes" or "no, I'm not going."
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {events.length === 0 ? (
          <Text style={styles.empty}>no commitments today — enjoy.</Text>
        ) : (
          events.map((ev) => <EventRow key={ev.id} event={ev} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EventRow({ event }: { event: { id: string; title: string; requiredArrivalAt: Date } }) {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useSpeechRecognitionEvent('result', (e) => {
    const last = e.results.at(-1);
    if (last) setTranscript(last.transcript);
  });
  useSpeechRecognitionEvent('end', async () => {
    if (!transcript.trim() || status.kind !== 'recording') return;
    setStatus({ kind: 'classifying' });
    try {
      const res = await confirmEvent(event.id, transcript);
      if (res.action === 'confirmed') setStatus({ kind: 'confirmed' });
      else if (res.action === 'cancelled')
        setStatus({ kind: 'cancelled', feeCents: res.feeCents ?? 0 });
      else setStatus({ kind: 'unclear', reason: res.reason ?? '' });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'failed' });
    }
  });

  async function startRecording() {
    setTranscript('');
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      setStatus({ kind: 'error', message: 'mic permission denied' });
      return;
    }
    setStatus({ kind: 'recording' });
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: true,
    });
  }

  function stopRecording() {
    ExpoSpeechRecognitionModule.stop();
  }

  const isDone = status.kind === 'confirmed' || status.kind === 'cancelled';

  return (
    <View style={[styles.row, isDone && styles.rowDone]}>
      <Text style={styles.rowTitle}>{event.title}</Text>
      <Text style={styles.rowTime}>
        be there by{' '}
        {event.requiredArrivalAt.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>

      {transcript.length > 0 && <Text style={styles.transcript}>"{transcript}"</Text>}

      {status.kind === 'idle' && (
        <BigButton onPress={startRecording}>tap to speak</BigButton>
      )}
      {status.kind === 'recording' && (
        <BigButton onPress={stopRecording} variant="secondary">
          listening… tap to stop
        </BigButton>
      )}
      {status.kind === 'classifying' && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#9a3412" />
          <Text style={styles.statusText}>checking what you said…</Text>
        </View>
      )}
      {status.kind === 'confirmed' && (
        <Text style={styles.confirmed}>✓ confirmed — geofence is armed</Text>
      )}
      {status.kind === 'cancelled' && (
        <Text style={styles.cancelled}>
          ✕ cancelled — ${(status.feeCents / 100).toFixed(0)} fee
        </Text>
      )}
      {status.kind === 'unclear' && (
        <View style={{ gap: 8 }}>
          <Text style={styles.unclear}>couldn't tell — try again with a clear yes or no.</Text>
          <BigButton onPress={startRecording} variant="secondary">
            re-record
          </BigButton>
        </View>
      )}
      {status.kind === 'error' && (
        <Text style={styles.unclear}>{status.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, gap: 8 },
  back: { fontSize: 16, color: '#9a3412', fontWeight: '600' },
  title: { fontSize: 36, fontWeight: '900', color: '#7c2d12' },
  sub: { fontSize: 15, color: '#9a3412', lineHeight: 22 },
  list: { padding: 16, gap: 16 },
  empty: { textAlign: 'center', color: '#9a3412', fontSize: 16 },
  row: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#ffedd5',
    gap: 12,
  },
  rowDone: { opacity: 0.6 },
  rowTitle: { fontSize: 20, fontWeight: '800', color: '#7c2d12' },
  rowTime: { fontSize: 15, color: '#9a3412' },
  transcript: {
    fontSize: 16,
    color: '#7c2d12',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#fed7aa',
    borderRadius: 16,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { color: '#9a3412', fontWeight: '600' },
  confirmed: { color: '#15803d', fontSize: 16, fontWeight: '700' },
  cancelled: { color: '#b91c1c', fontSize: 16, fontWeight: '700' },
  unclear: { color: '#9a3412', fontSize: 15 },
});
