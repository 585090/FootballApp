import { StyleSheet, View } from 'react-native';
import { Card, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme';

export default function WCBracket() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" color="brand">WORLD CUP · STAGE 2</Text>
        <Text variant="h1">Bracket</Text>
      </View>
      <Card>
        <Text variant="body" color="secondary">
          R32 → R16 → QF → SF → Final + 3rd place. Tap a slot to advance your pick.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg, gap: spacing.xs },
});
