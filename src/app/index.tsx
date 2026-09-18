import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Button, Loading } from '@/components';
import { colors, spacing, radius, typography } from '@/theme';

export default function HomeScreen() {
  const { isAuthenticated, isRestoringSession, currentUser, logout, isLoading } =
    useAuthStore((state) => ({
      isAuthenticated: state.isAuthenticated,
      isRestoringSession: state.isRestoringSession,
      currentUser: state.user,
      logout: state.logout,
      isLoading: state.isLoading,
    }));

  if (isRestoringSession) {
    return <Loading fullScreen message="Loading your session..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>🌱 VEGAN APP MMA302</Text>
          <Text style={styles.greeting}>
            Welcome back, {currentUser?.name || 'Explorer'}!
          </Text>
          <Text style={styles.subGreeting}>
            Your everyday companion for clean, compassionate living.
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{currentUser?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{currentUser?.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Session Status:</Text>
            <Text style={[styles.value, styles.statusActive]}>
              Active (Mock Auth)
            </Text>
          </View>
        </View>

        {/* Vegan Tip Card */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.tipIcon}>🥗</Text>
          <Text style={styles.tipTitle}>Daily Vegan Nutrition Insight</Text>
          <Text style={styles.tipText}>
            Pair iron-rich legumes and dark leafy greens with vitamin C sources (like
            bell peppers or lemon juice) to optimize plant-based iron absorption!
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Sign Out"
            variant="outline"
            loading={isLoading}
            onPress={logout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  badge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusActive: {
    color: colors.success,
  },
  tipCard: {
    backgroundColor: '#F1F8E9',
    borderColor: '#DCEDC8',
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  tipTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.gray700,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
});
