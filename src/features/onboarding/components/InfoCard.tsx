import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

export function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.card}>
      <AppText variant="heading4">{title}</AppText>
      <AppText
        variant="bodyDefault"
        color={colors.text.secondary}
        style={styles.description}
      >
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  description: { marginTop: spacing.sm },
});
