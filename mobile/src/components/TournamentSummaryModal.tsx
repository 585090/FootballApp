import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupsApi, type GroupTournamentSummary, type GroupTournamentSummaryPlayer } from '@/api/groups';
import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

interface TournamentSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
}

export function TournamentSummaryModal({ visible, onClose, groupId }: TournamentSummaryModalProps) {
  const [summary, setSummary] = useState<GroupTournamentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !groupId) return;
    let alive = true;

    setLoading(true);
    setError(null);

    groupsApi
      .getTournamentSummary(groupId)
      .then((data) => {
        if (alive) setSummary(data);
      })
      .catch((err) => {
        if (alive) setError((err as Error).message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [groupId, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="h2">Tournament summary</Text>
              <Text variant="small" color="muted">How each player did on top scorer and 1-3 place picks.</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.brand.primary} />
              </View>
            ) : error ? (
              <Banner tone="danger" text={error} />
            ) : !summary ? (
              <Banner tone="muted" text="No tournament summary available yet." />
            ) : (
              <>
                {summary.reason ? <Banner tone="muted" text={summary.reason} /> : null}

                <View style={styles.actualCard}>
                  <Text variant="caption" color="brand">OUTCOME</Text>
                  <View style={styles.actualRows}>
                    <SummaryLine
                      label="Top scorer"
                      value={summary.tournamentResult?.goldenBoot?.playerName || pendingLabel(summary.statuses.topScorerResolved)}
                    />
                    <SummaryLine
                      label="Top 3"
                      value={summary.statuses.topThreeResolved ? 'Resolved' : pendingLabel(summary.statuses.topThreeResolved)}
                    />
                  </View>
                </View>

                {summary.players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PlayerCard({
  player,
}: {
  player: GroupTournamentSummaryPlayer;
}) {
  const scorerStatus =
    player.summary.topScorer.correct == null
      ? 'Pending'
      : player.summary.topScorer.correct
        ? 'Correct'
        : 'Missed';
  const scorerPick = player.summary.topScorer.predictedPlayerName || 'No pick';

  return (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerHeaderText}>
          <Text variant="h3">{player.name}</Text>
          <Text variant="caption" color="muted">
            Exact {player.summary.exactCount} · Near miss {player.summary.partialCount} · Answered {player.summary.answeredCount}
          </Text>
        </View>
        <View style={styles.totalBadge}>
          <Text variant="bodyBold" color="brand">{player.points.total} pts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SummaryLine label="Top scorer" value={`${scorerStatus} · ${scorerPick} · ${player.points.topScorer} pts`} />
        <SummaryLine
          label="1-3 place"
          value={`${player.summary.topThree.exactCount}/3 exact · ${player.summary.topThree.wrongSlotCount} wrong-slot hits · ${player.points.topThree} pts`}
        />
      </View>

      <View style={styles.section}>
        <Text variant="caption" color="brand">TOP 3 TEAMS</Text>
        {player.summary.topThree.slots.map((slot) => (
          <SummaryLine
            key={slot.rank}
            label={ordinal(slot.rank)}
            value={formatTopThreeSlot(slot)}
          />
        ))}
      </View>
    </View>
  );
}

function formatTopThreeSlot(slot: GroupTournamentSummaryPlayer['summary']['topThree']['slots'][number]) {
  const predicted = slot.predictedTeamName || 'No pick';
  const outcome = slot.exact == null
    ? 'Pending'
    : slot.exact
      ? 'Correct'
      : slot.wrongSlot
        ? 'Wrong slot'
        : 'Missed';

  let points = 0;
  if (slot.exact) points = 3;
  else if (slot.wrongSlot) points = 2;

  return `${predicted} · ${outcome} · ${points} pts`;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color="secondary" style={styles.rowLabel}>{label}</Text>
      <Text variant="bodyBold" style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Banner({ tone, text }: { tone: 'muted' | 'danger'; text: string }) {
  return (
    <View style={[styles.banner, tone === 'danger' && styles.bannerDanger]}>
      <Text variant="small" color={tone === 'danger' ? 'danger' : 'muted'}>{text}</Text>
    </View>
  );
}

function pendingLabel(resolved: boolean) {
  return resolved ? 'Resolved' : 'Pending';
}

function ordinal(position: number) {
  if (position === 1) return '1st';
  if (position === 2) return '2nd';
  if (position === 3) return '3rd';
  return `${position}th`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.surface.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '88%',
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  headerText: { flex: 1, gap: 2 },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: { paddingVertical: spacing.xl, alignItems: 'center' },
  banner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.cardSubtle,
  },
  bannerDanger: { backgroundColor: colors.state.dangerBg },
  actualCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface.cardSubtle,
  },
  actualRows: { gap: spacing.xs },
  playerCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface.cardSubtle,
  },
  playerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  playerHeaderText: { flex: 1, gap: 2 },
  totalBadge: {
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  section: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  rowLabel: { width: 88 },
  rowValue: { flex: 1 },
});