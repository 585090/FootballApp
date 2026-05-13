import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Text } from '@/components/ui';
import { useAuth } from '@/auth/AuthContext';
import { groupsApi, type GroupDetail } from '@/api/groups';
import { activitiesApi, type ActivityEntry } from '@/api/activities';
import { colors, radii, spacing } from '@/theme';
import { timeAgo } from '@/utils/timeAgo';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      setLoading(true);
      Promise.all([
        groupsApi.get(id),
        activitiesApi.forGroup(id, 15).catch(() => [] as ActivityEntry[]),
      ])
        .then(([g, acts]) => {
          if (cancelled) return;
          setGroup(g);
          setActivity(acts);
          setError(null);
        })
        .catch((e) => {
          if (!cancelled) setError((e as Error).message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const copyCode = async () => {
    if (!group?.joinCode) return;
    await Clipboard.setStringAsync(group.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareGroup = async () => {
    if (!group?.joinCode) return;
    const deepLink = `footyguru://group/join?code=${group.joinCode}`;
    try {
      await Share.share({
        message: `Join my FootyGuru group "${group.groupName}"!\nOpen the app: ${deepLink}\nOr enter code ${group.joinCode} manually.`,
        url: deepLink,
      });
    } catch {
      // User cancelled or platform doesn't support — fall back to copy.
      await copyCode();
    }
  };

  if (loading && !group) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      </Screen>
    );
  }
  if (error || !group) {
    return (
      <Screen>
        <Card><Text variant="body" color="danger">{error ?? 'Group not found.'}</Text></Card>
      </Screen>
    );
  }

  const sortedMembers = [...group.members].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" color="brand">{group.tournament.toUpperCase()}</Text>
        <Text variant="h1">{group.groupName}</Text>
      </View>

      <Card style={styles.codeCard}>
        <Text variant="caption" color="secondary">JOIN CODE</Text>
        <Text style={styles.codeText}>{group.joinCode || '—'}</Text>
        <View style={styles.codeActions}>
          <Pressable
            onPress={copyCode}
            accessibilityLabel="Copy join code"
            hitSlop={6}
            style={({ pressed }) => [styles.codeAction, pressed && styles.codeActionPressed]}
          >
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={16}
              color={copied ? colors.state.success : colors.text.primary}
            />
            <Text variant="bodyBold" color={copied ? 'success' : 'primary'}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
          <Pressable
            onPress={shareGroup}
            accessibilityLabel="Share group invite"
            hitSlop={6}
            style={({ pressed }) => [styles.codeAction, styles.codeActionPrimary, pressed && styles.codeActionPressed]}
          >
            <Ionicons name="share-outline" size={16} color={colors.text.inverse} />
            <Text variant="bodyBold" color="inverse">Share</Text>
          </Pressable>
        </View>
      </Card>

      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Leaderboard</Text>
        <Card padding={0}>
          {sortedMembers.map((m, idx) => {
            const isYou = session?.email?.toLowerCase() === m.email.toLowerCase();
            return (
              <View
                key={m._id}
                style={[styles.memberRow, idx === sortedMembers.length - 1 && styles.memberRowLast]}
              >
                <View style={[styles.rank, idx === 0 && styles.rankFirst]}>
                  <Text variant="bodyBold" color={idx === 0 ? 'inverse' : 'primary'}>{idx + 1}</Text>
                </View>
                <View style={styles.memberNameWrap}>
                  <Text variant="bodyBold">{m.name}</Text>
                  {isYou ? <Text variant="caption" color="brand">YOU</Text> : null}
                </View>
                <Text variant="bodyBold">{m.points ?? 0}</Text>
              </View>
            );
          })}
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Recent activity</Text>
        {activity && activity.length > 0 ? (
          <Card padding={0}>
            {activity.map((a, idx) => (
              <ActivityRow
                key={a.id}
                entry={a}
                isLast={idx === activity.length - 1}
                isYou={!!session?.email && session.email.toLowerCase() === a.actorEmail.toLowerCase()}
              />
            ))}
          </Card>
        ) : (
          <Card>
            <Text variant="small" color="muted">
              Nothing yet — predictions and member joins will show up here.
            </Text>
          </Card>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push({ pathname: '/group/settings', params: { groupId: group.id } })}
          style={({ pressed }) => [styles.settingsLink, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="settings-outline" size={14} color={colors.text.muted} />
          <Text variant="small" color="muted">Group settings</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function ActivityRow({ entry, isLast, isYou }: { entry: ActivityEntry; isLast: boolean; isYou: boolean }) {
  const description = describeActivity(entry);
  const icon = iconForActivity(entry.type);
  return (
    <View style={[styles.activityRow, isLast && styles.activityRowLast]}>
      <View style={styles.activityIcon}>
        <Ionicons name={icon} size={16} color={colors.brand.primary} />
      </View>
      <View style={styles.activityText}>
        <Text variant="small" numberOfLines={2}>
          <Text variant="bodyBold">{entry.actorName}{isYou ? ' (you)' : ''}</Text>
          {' '}{description}
        </Text>
        <Text variant="caption" color="muted">{timeAgo(entry.createdAt)}</Text>
      </View>
    </View>
  );
}

function describeActivity(a: ActivityEntry): string {
  const p = a.payload;
  switch (a.type) {
    case 'PREDICTION_SAVED': {
      const h = p.score?.home ?? '?';
      const aw = p.score?.away ?? '?';
      return `predicted ${p.homeTeam ?? 'home'} ${h}–${aw} ${p.awayTeam ?? 'away'}`;
    }
    case 'GROUP_JOINED':
      return `joined ${p.groupName ?? 'the group'}`;
    case 'GROUP_CREATED':
      return `created ${p.groupName ?? 'the group'}`;
    case 'POINTS_AWARDED':
      return `earned ${p.points ?? 0} pts on ${p.homeTeam ?? '?'} vs ${p.awayTeam ?? '?'}`;
    default:
      return '';
  }
}

function iconForActivity(type: ActivityEntry['type']): React.ComponentProps<typeof Ionicons>['name'] {
  switch (type) {
    case 'PREDICTION_SAVED': return 'create-outline';
    case 'GROUP_JOINED': return 'person-add-outline';
    case 'GROUP_CREATED': return 'star-outline';
    case 'POINTS_AWARDED': return 'trophy-outline';
    default: return 'ellipse-outline';
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: spacing.sm, marginBottom: spacing.lg, gap: spacing.xs },
  codeCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl, marginBottom: spacing.lg },
  codeText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.brand.primary,
    fontVariant: ['tabular-nums'],
  },
  codeActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  codeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.cardSubtle,
  },
  codeActionPrimary: { backgroundColor: colors.brand.primary },
  codeActionPressed: { opacity: 0.7 },
  section: { gap: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { marginLeft: spacing.xs },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  memberRowLast: { borderBottomWidth: 0 },
  rank: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.cardSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankFirst: { backgroundColor: colors.brand.accent },
  memberNameWrap: { flex: 1, gap: 2 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  activityRowLast: { borderBottomWidth: 0 },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityText: { flex: 1, gap: 2 },
  footer: { alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.xl },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
