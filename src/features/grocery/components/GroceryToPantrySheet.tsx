import { StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { GroceryItem } from '../types';

interface GroceryToPantrySheetProps {
  visible: boolean;
  items: GroceryItem[];
  skippedCount: number;
  loading: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GroceryToPantrySheet({
  visible,
  items,
  skippedCount,
  loading,
  error,
  onClose,
  onConfirm,
}: GroceryToPantrySheetProps) {
  const { t } = useTranslation();
  const preview = items.slice(0, 4);

  return (
    <BottomSheet
      visible={visible}
      title={t('grocery.transferTitle')}
      onClose={onClose}
      showFooterClose={false}
    >
      <View style={styles.intro}>
        <View style={styles.iconCircle}>
          <AppIcon name="pantry" size={26} color={colors.primary[700]} decorative />
        </View>
        <View style={styles.introText}>
          <AppText variant="bodyStrong">
            {t('grocery.transferCount', { count: items.length })}
          </AppText>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t('grocery.transferDescription')}
          </AppText>
        </View>
      </View>

      <View style={styles.preview}>
        {preview.map((item) => (
          <View key={item.itemId} style={styles.previewRow}>
            <View style={styles.dot} />
            <AppText style={styles.itemName} numberOfLines={1}>
              {item.nameSnapshot}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {item.quantity} {t(`grocery.unit.${item.unit}`)}
            </AppText>
          </View>
        ))}
        {items.length > preview.length ? (
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t('grocery.transferMore', { count: items.length - preview.length })}
          </AppText>
        ) : null}
      </View>

      {skippedCount > 0 ? (
        <View style={styles.warning}>
          <AppText variant="bodyStrong" color={colors.status.warning}>
            !
          </AppText>
          <AppText variant="bodySmall" style={styles.warningText}>
            {t('grocery.transferSkipped', { count: skippedCount })}
          </AppText>
        </View>
      ) : null}

      {error ? (
        <AppText accessibilityRole="alert" color={colors.status.danger}>
          {t('grocery.transferError')}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title={t('grocery.transferConfirm')}
          loading={loading}
          disabled={!items.length}
          onPress={onConfirm}
        />
        <AppButton
          title={t('common.close')}
          variant="ghost"
          disabled={loading}
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  introText: { flex: 1, gap: spacing.xs },
  preview: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.muted,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.primary[600],
  },
  itemName: { flex: 1 },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.soft,
  },
  warningText: { flex: 1 },
  actions: { gap: spacing.sm },
});
