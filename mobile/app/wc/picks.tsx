import { StyleSheet, View } from 'react-native';
import { Card, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme';

export default function WCPicks() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" color="brand">WORLD CUP · EXTRAS</Text>
        <Text variant="h1">Tournament picks</Text>
      </View>
      <Card>
        <Text variant="body" color="secondary">
          Golden Boot, Golden Glove, tournament winner, dark horse — set before kickoff.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg, gap: spacing.xs },
});
