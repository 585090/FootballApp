import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top', 'left', 'right'],
  style,
}: ScreenProps) {
  const inner = padded ? styles.padded : undefined;

  if (scroll) {
    return (
      <SafeAreaView style={[styles.root, style]} edges={edges}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, inner]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      <View style={[styles.flex, inner]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  padded: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
