import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { useAuth } from '@/auth/AuthContext';
import { groupsApi } from '@/api/groups';
import { ApiError } from '@/api/client';
import { colors, radii, spacing } from '@/theme';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { code: codeParam } = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(codeParam?.toUpperCase() ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the screen was opened via a deep link with a code, prefill it.
  useEffect(() => {
    if (codeParam) setCode(codeParam.toUpperCase());
  }, [codeParam]);

  const handleJoin = async () => {
    if (!session) {
      setError('You need to sign in first.');
      return;
    }
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 0) {
      setError('Enter the code your friend shared.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await groupsApi.join({ joinCode: trimmed, email: session.email });
      router.replace(`/group/${res.group._id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.status === 404 ? 'No group with that code.' : e.message);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" color="brand">JOIN A GROUP</Text>
        <Text variant="h1">Got a code?</Text>
        <Text variant="body" color="secondary" style={styles.sub}>
          Paste the 6-character code your friend shared. Codes look like R7HKQ4.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Input
          label="Join code"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="R7HKQ4"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleJoin}
          style={styles.codeInput}
        />
        {error ? (
          <View style={styles.errorBox}>
            <Text variant="small" color="danger">{error}</Text>
          </View>
        ) : null}
        <Button label="Join" onPress={handleJoin} loading={submitting} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg, gap: spacing.xs },
  sub: { marginTop: spacing.xs, lineHeight: 21 },
  formCard: { gap: spacing.md },
  codeInput: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.brand.primary,
  },
  errorBox: {
    backgroundColor: colors.state.dangerBg,
    padding: spacing.md,
    borderRadius: radii.md,
  },
});
