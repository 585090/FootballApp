import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

/**
 * Use as `headerLeft` on Stack screens. Always shows a back chevron and falls
 * back to the tabs root when there's no history (e.g. after a page refresh
 * on web, or a `router.replace` chain that cleared the stack).
 */
export function HeaderBackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  pressed: { opacity: 0.55 },
});
