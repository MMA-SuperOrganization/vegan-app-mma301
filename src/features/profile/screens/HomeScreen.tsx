import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, CustomHeader, ScreenWrapper } from '@/components';
import { useAuthStore } from '@/features/auth';
import { colors, sizes, spacing, typography } from '@/theme';

export function HomeScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <ScreenWrapper
      scrollable
      edges={['top', 'left', 'right']}
      keyboardAvoiding={false}
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <CustomHeader title="Trang chủ" showBack={false} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Badge
            label="🌱 VEGETA UI · MMA302"
            variant="primary"
            style={styles.badge}
          />
          <Text style={styles.greeting}>
            Welcome back, {currentUser?.name || 'Explorer'}!
          </Text>
          <Text style={styles.subGreeting}>
            Your everyday companion for clean, compassionate living.
          </Text>
        </View>

        <Card variant="default" style={styles.card}>
          <Text style={styles.cardTitle}>Account Overview</Text>
          <InfoRow label="Email:" value={currentUser?.email} />
          <InfoRow label="User ID:" value={currentUser?.id} />
          <InfoRow label="Session Status:" value="Active (Mock Auth)" isSuccess />
        </Card>

        <Card variant="accent" style={styles.card}>
          <Text style={styles.tipIcon}>🥗</Text>
          <Text style={styles.tipTitle}>Daily Vegan Nutrition Insight</Text>
          <Text style={styles.tipText}>
            Pair iron-rich legumes and dark leafy greens with vitamin C sources (like
            bell peppers or lemon juice) to optimize plant-based iron absorption!
          </Text>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Sign Out"
            variant="outline"
            loading={isLoading}
            onPress={logout}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

function InfoRow({
  label,
  value,
  isSuccess = false,
}: {
  label: string;
  value?: string;
  isSuccess?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isSuccess && styles.statusActive]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flexGrow: 1 },
  body: { padding: spacing.lg },
  header: { marginBottom: spacing.xl },
  badge: {
    marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subGreeting: { ...typography.bodyDefault, color: colors.text.secondary },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: { ...typography.bodySmall, color: colors.text.secondary },
  value: {
    ...typography.bodyStrong,
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  statusActive: { color: colors.status.success },
  tipIcon: { fontSize: sizes.icon.lg, marginBottom: spacing.xs },
  tipTitle: {
    ...typography.bodyStrong,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  tipText: { ...typography.bodyDefault, color: colors.text.secondary },
  actionsContainer: { marginTop: spacing.md },
});
