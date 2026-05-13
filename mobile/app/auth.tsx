import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';
import { useAuth } from '@/auth/AuthContext';
import { signIn, signUp } from '@/api/players';
import { ApiError } from '@/api/client';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn: storeSession } = useAuth();

  const submit = async () => {
    setError(null);

    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Fill every field to continue.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const session = mode === 'signup'
        ? await signUp(name, email, password)
        : await signIn(email, password);
      await storeSession(session);
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError) {
        setError(humanize(e));
      } else {
        setError((e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="cover"
            accessibilityLabel="FootyGuru"
          />
          <Text variant="display" style={styles.headline}>
            Predict the{'\n'}beautiful game.
          </Text>
          <Text variant="body" color="secondary" style={styles.sub}>
            Pick scores, climb your group leaderboard, earn bragging rights.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.tabs}>
            <TabPill label="Sign in" active={mode === 'signin'} onPress={() => { setMode('signin'); setError(null); }} />
            <TabPill label="Sign up" active={mode === 'signup'} onPress={() => { setMode('signup'); setError(null); }} />
          </View>

          <View style={styles.fields}>
            {mode === 'signup' ? (
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your display name"
                autoCapitalize="words"
                returnKeyType="next"
              />
            ) : null}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              returnKeyType="next"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              returnKeyType="done"
              hint={mode === 'signup' ? 'At least 6 characters.' : undefined}
              onSubmitEditing={submit}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text variant="small" color="danger">{error}</Text>
            </View>
          ) : null}

          <Button
            label={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={submit}
            loading={submitting}
            size="lg"
          />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Text
      variant="bodyBold"
      color={active ? 'brand' : 'muted'}
      onPress={onPress}
      style={[pillStyles.pill, active && pillStyles.active]}
    >
      {label}
    </Text>
  );
}

function humanize(err: ApiError): string {
  if (err.status === 401) return 'Wrong email or password.';
  if (err.status === 409) return 'An account with that email already exists.';
  if (err.status === 400) return err.message || 'Missing required fields.';
  return err.message || 'Something went wrong. Try again.';
}

const styles = StyleSheet.create({
  hero: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.sm },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  headline: { marginTop: spacing.xs },
  sub: { marginTop: spacing.xs, lineHeight: 22 },
  formCard: { gap: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xs },
  fields: { gap: spacing.md },
  errorBox: {
    backgroundColor: colors.state.dangerBg,
    padding: spacing.md,
    borderRadius: 10,
  },
});

const pillStyles = StyleSheet.create({
  pill: { paddingVertical: spacing.xs },
  active: { borderBottomWidth: 2, borderBottomColor: colors.brand.primary },
});
