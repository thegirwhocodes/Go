import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onPress: () => void | Promise<void>;
  children: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function BigButton({ onPress, children, loading, variant = 'primary' }: Props) {
  const palette = variant === 'primary' ? primary : secondary;
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.base, palette.bg, pressed && styles.pressed]}>
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={palette.fg.color} /> : null}
        <Text style={[styles.label, palette.fg]}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 18, fontWeight: '800' },
});

const primary = StyleSheet.create({
  bg: { backgroundColor: '#fb923c' },
  fg: { color: '#fff7ed' },
});

const secondary = StyleSheet.create({
  bg: { backgroundColor: '#ffedd5' },
  fg: { color: '#9a3412' },
});
