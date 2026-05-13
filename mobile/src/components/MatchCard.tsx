import { Image, StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components/ui';
import { CountdownPill } from '@/components/CountdownPill';
import { colors, radii, spacing } from '@/theme';
import { formatKickoff } from '@/utils/date';
import type { Match } from '@/api/matches';
import type { Prediction } from '@/api/predictions';

export interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onPress?: () => void;
}

export function MatchCard({ match, prediction, onPress }: MatchCardProps) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'ongoing';
  const hasPrediction =
    prediction && prediction.score && prediction.score.home != null && prediction.score.away != null;

  return (
    <Card onPress={onPress} padding={'lg'} style={styles.card}>
      <View style={styles.metaRow}>
        <Text variant="caption" color="secondary">{formatKickoff(match.kickoffDateTime)}</Text>
        {isLive ? <LiveDot /> : null}
        {isFinished ? <Text variant="caption" color="muted">FT</Text> : null}
        {!isFinished && !isLive ? <CountdownPill kickoff={match.kickoffDateTime} /> : null}
      </View>

      <View style={styles.teamsRow}>
        <TeamSide name={match.homeTeam} crest={match.homeCrest} />
        <View style={styles.scoreCenter}>
          {isFinished || isLive ? (
            <Text variant="h2">
              {match.score.home ?? '-'} – {match.score.away ?? '-'}
            </Text>
          ) : (
            <Text variant="small" color="muted">vs</Text>
          )}
        </View>
        <TeamSide name={match.awayTeam} crest={match.awayCrest} mirror />
      </View>

      <View style={styles.footerRow}>
        {hasPrediction ? (
          <View style={styles.predRow}>
            <Text variant="caption" color="brand">YOUR PICK</Text>
            <Text variant="bodyBold">
              {prediction!.score.home}–{prediction!.score.away}
            </Text>
            {prediction?.firstGoalScorer?.playerName ? (
              <Text variant="small" color="muted">· 1st: {prediction.firstGoalScorer.playerName}</Text>
            ) : null}
          </View>
        ) : isFinished || isLive ? (
          <Text variant="small" color="muted">No prediction</Text>
        ) : (
          <Text variant="small" color="brand">Tap to predict →</Text>
        )}
      </View>
    </Card>
  );
}

function TeamSide({ name, crest, mirror = false }: { name: string; crest?: string | null; mirror?: boolean }) {
  return (
    <View style={[styles.team, mirror && styles.teamMirrored]}>
      {crest ? (
        <Image source={{ uri: crest }} style={styles.crest} resizeMode="contain" />
      ) : (
        <View style={[styles.crest, styles.crestFallback]} />
      )}
      <Text variant="bodyBold" numberOfLines={1} ellipsizeMode="tail" style={styles.teamName}>
        {name}
      </Text>
    </View>
  );
}

function LiveDot() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text variant="caption" color="inverse" style={{ fontSize: 9 }}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  team: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  teamMirrored: { flexDirection: 'row-reverse' },
  teamName: { flexShrink: 1 },
  crest: { width: 24, height: 24 },
  crestFallback: { backgroundColor: colors.surface.cardSubtle, borderRadius: radii.sm },
  scoreCenter: { alignItems: 'center', minWidth: 56 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.border.subtle, paddingTop: spacing.sm },
  predRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: colors.state.danger },
  liveDot: { width: 6, height: 6, borderRadius: radii.pill, backgroundColor: colors.text.inverse },
});
