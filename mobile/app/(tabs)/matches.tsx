import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Screen, Text } from '@/components/ui';
import { MatchCard } from '@/components/MatchCard';
import { ProfileButton } from '@/components/ProfileButton';
import { useAuth } from '@/auth/AuthContext';
import { useGamemode } from '@/gamemode';
import { matchesApi, type Match } from '@/api/matches';
import { predictionsApi, type Prediction } from '@/api/predictions';
import { colors, radii, spacing } from '@/theme';

const PL_MATCHWEEKS = Array.from({ length: 38 }, (_, i) => i + 1);

const WC_STAGES: Array<{ value: string; label: string }> = [
  { value: 'GROUP_STAGE', label: 'Group stage' },
  { value: 'LAST_16', label: 'Round of 16' },
  { value: 'QUARTER_FINALS', label: 'Quarter-finals' },
  { value: 'SEMI_FINALS', label: 'Semi-finals' },
  { value: 'THIRD_PLACE', label: '3rd place' },
  { value: 'FINAL', label: 'Final' },
];

const CL_STAGES: Array<{ value: string; label: string }> = [
  { value: 'LAST_16', label: 'Round of 16' },
  { value: 'QUARTER_FINALS', label: 'Quarter-finals' },
  { value: 'SEMI_FINALS', label: 'Semi-finals' },
  { value: 'FINAL', label: 'Final' },
];

export default function MatchesTab() {
  const router = useRouter();
  const { session } = useAuth();
  const { meta } = useGamemode();
  const competition = meta.competition;
  const usesStages = competition !== 'PL';
  const stages = competition === 'WC' ? WC_STAGES : CL_STAGES;

  const [plMW, setPlMW] = useState<number>(1);
  const [stage, setStage] = useState<string>(stages[0].value);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset the selected stage when switching tournament-style competitions.
  useEffect(() => {
    if (usesStages) setStage(stages[0].value);
  }, [usesStages, stages]);

  // Default to current matchweek for PL on first load
  useEffect(() => {
    if (competition !== 'PL') return;
    matchesApi.currentMatchweek('PL').then(({ matchweek }) => setPlMW(matchweek)).catch(() => {});
  }, [competition]);

  const fetcher = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const data = usesStages
        ? await matchesApi.byStage(stage, competition)
        : await matchesApi.byMatchweek(plMW, competition);
      const sorted = [...data].sort(
        (a, b) => new Date(a.kickoffDateTime).getTime() - new Date(b.kickoffDateTime).getTime(),
      );
      setMatches(sorted);

      const preds = await Promise.all(
        sorted.map((m) => predictionsApi.get(session.email, m.matchId).catch(() => null)),
      );
      const map: Record<number, Prediction | null> = {};
      sorted.forEach((m, i) => {
        map[m.matchId] = preds[i] ?? null;
      });
      setPredictions(map);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [session, usesStages, stage, plMW, competition]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return (
    <Screen>
      <ProfileButton />
      <View style={styles.header}>
        <Text variant="caption" color="brand">{meta.shortLabel} · FIXTURES</Text>
        <Text variant="h1">Matches</Text>
      </View>

      {usesStages ? (
        <StageSelector value={stage} onChange={setStage} options={stages} />
      ) : (
        <MatchweekSelector value={plMW} onChange={setPlMW} />
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brand.primary} /></View>
      ) : error ? (
        <Card><Text variant="body" color="danger">{error}</Text></Card>
      ) : matches.length === 0 ? (
        <Card>
          <Text variant="body" color="muted">No matches yet for this selection.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {matches.map((m) => (
            <MatchCard
              key={m.matchId}
              match={m}
              prediction={predictions[m.matchId]}
              onPress={() => router.push(`/match/${m.matchId}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function MatchweekSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
      {PL_MATCHWEEKS.map((mw) => {
        const active = mw === value;
        return (
          <Pressable key={mw} onPress={() => onChange(mw)} style={[styles.pill, active && styles.pillActive]}>
            <Text variant="bodyBold" color={active ? 'inverse' : 'secondary'}>MW {mw}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function StageSelector({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
      {options.map((s) => {
        const active = s.value === value;
        return (
          <Pressable key={s.value} onPress={() => onChange(s.value)} style={[styles.pill, active && styles.pillActive]}>
            <Text variant="bodyBold" color={active ? 'inverse' : 'secondary'}>{s.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg, gap: spacing.xs },
  selector: { gap: spacing.sm, paddingBottom: spacing.lg, paddingHorizontal: 2 },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.surface.cardSubtle },
  pillActive: { backgroundColor: colors.brand.primary },
  center: { paddingVertical: spacing.xxl, alignItems: 'center' },
  list: { gap: spacing.md },
});
