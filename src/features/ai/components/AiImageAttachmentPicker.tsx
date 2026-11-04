import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { ImagePickerAsset } from 'expo-image-picker';
import { AI_TRANSLATION_KEYS } from '../aiConstants';

interface AiImageAttachmentPickerProps {
  asset: ImagePickerAsset | null;
  busy: boolean;
  onChoose: () => void;
  onClear: () => void;
  compact?: boolean;
}

export function AiImageAttachmentPicker({
  asset,
  busy,
  onChoose,
  onClear,
  compact = false,
}: AiImageAttachmentPickerProps) {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.ATTACHMENT;

  if (asset) {
    return (
      <View style={styles.previewRow}>
        <Image
          source={{ uri: asset.uri }}
          accessibilityLabel={t(keys.PREVIEW_A11Y)}
          style={styles.preview}
          resizeMode="cover"
        />
        <View style={styles.previewCopy}>
          <View style={styles.previewBadgeRow}>
            <AppIcon name="image" size={14} color={colors.primary[700]} decorative />
            <AppText variant="bodyStrong" color={colors.primary[800]}>
              {t(keys.ATTACHED_TITLE)}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {asset.fileName || t(keys.READY_HINT)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(keys.REMOVE_A11Y)}
          disabled={busy}
          onPress={onClear}
          hitSlop={8}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <AppIcon name="close" size={16} color={colors.text.secondary} decorative />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(keys.ATTACH_A11Y)}
      disabled={busy}
      onPress={onChoose}
      hitSlop={compact ? 4 : 0}
      style={({ pressed }) => [
        compact ? styles.iconButton : styles.attachChip,
        pressed && styles.pressed,
        busy && styles.disabled,
      ]}
    >
      <AppIcon
        name="attach"
        size={compact ? 22 : 18}
        color={colors.primary[700]}
        decorative
      />
      {!compact ? (
        <AppText
          variant="bodySmall"
          color={colors.primary[800]}
          style={styles.chipLabel}
        >
          {t(keys.ATTACH_LABEL)}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  attachChip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  chipLabel: { fontWeight: '600' },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  preview: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.background.muted,
  },
  previewCopy: { flex: 1, minWidth: 0, gap: 2 },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
});
