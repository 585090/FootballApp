import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { useAuth } from '@/auth/AuthContext';
import { colors, radii, shadows, spacing } from '@/theme';

/**
 * Top-right profile avatar visible on every tab. Tapping opens the Profile
 * screen where the user can edit name, change password, and sign out.
 */
export function ProfileButton() {
  const router = useRouter();
  const { session } = useAuth();
  if (!session) return null;

  const initial = (session.name || session.email || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push('/profile')}
        accessibilityLabel="Open profile"
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
      >
        <Text variant="bodyBold" color="inverse">{initial}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
