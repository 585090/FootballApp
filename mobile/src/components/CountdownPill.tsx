import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

const MAX_VISIBLE_MS = 24 * 60 * 60 * 1000; // only show within 24h of kickoff
const URGENT_MS = 60 * 60 * 1000; // <60min remaining → urgent styling

export function CountdownPill({ kickoff }: { kickoff: string | Date }) {
  const target = typeof kickoff === 'string' ? new Date(kickoff).getTime() : kickoff.getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const diff = target - now;

  if (diff <= 0) {
    return (
      <View style={[styles.pill, styles.pillLocked]}>
        <Ionicons name="lock-closed-outline" size={11} color={colors.text.muted} />
        <Text variant="caption" color="muted" style={styles.label}>LOCKED</Text>
      </View>
    );
  }
  if (diff > MAX_VISIBLE_MS) return null;

  const minutes = Math.floor(diff / 60_000);
  const label = minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const urgent = diff <= URGENT_MS;

  return (
    <View style={[styles.pill, urgent ? styles.pillUrgent : styles.pillSoft]}>
      <Ionicons
        name="time-outline"
        size={11}
        color={urgent ? colors.text.inverse : colors.brand.primary}
      />
      <Text
        variant="caption"
        color={urgent ? 'inverse' : 'brand'}
        style={styles.label}
      >
        CLOSES IN {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  pillSoft: { backgroundColor: colors.brand.primaryLight },
  pillUrgent: { backgroundColor: colors.brand.primary },
  pillLocked: { backgroundColor: colors.surface.cardSubtle },
  label: { fontSize: 10 },
});

void spacing;
