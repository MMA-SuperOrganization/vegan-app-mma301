import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, spacing } from '@/theme';

export function SectionLabel({ children }: { children: string }) {
  return (
    <AppText
      variant="caption"
      color={colors.text.secondary}
      style={styles.sectionLabel}
    >
      {children.toUpperCase()}
    </AppText>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText
        variant="caption"
        color={colors.text.secondary}
        style={styles.infoLabel}
      >
        {label}
      </AppText>
      <AppText style={styles.infoValue}>{value}</AppText>
    </View>
  );
}

export function ReportDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  sectionLabel: { letterSpacing: 0.6 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  infoLabel: { width: 84 },
  infoValue: { flex: 1, minWidth: 0 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
  },
});
