import { Image, StyleSheet, View } from 'react-native';
import { AppButton, AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { ImagePickerAsset } from 'expo-image-picker';

interface AiImageAttachmentPickerProps {
  asset: ImagePickerAsset | null;
  busy: boolean;
  vi: boolean;
  onChoose: () => void;
  onClear: () => void;
}

export function AiImageAttachmentPicker({
  asset,
  busy,
  vi,
  onChoose,
  onClear,
}: AiImageAttachmentPickerProps) {
  return (
    <View style={styles.container}>
      {asset ? (
        <View style={styles.previewRow}>
          <Image
            source={{ uri: asset.uri }}
            accessibilityLabel={vi ? 'Ảnh đính kèm cho AI' : 'Image attached for AI'}
            style={styles.preview}
            resizeMode="cover"
          />
          <View style={styles.previewCopy}>
            <AppText variant="bodyStrong">
              {vi ? 'Ảnh đã sẵn sàng' : 'Image ready'}
            </AppText>
            <AppText color={colors.text.secondary} numberOfLines={1}>
              {asset.fileName || (vi ? 'Ảnh đã chọn' : 'Selected image')}
            </AppText>
          </View>
          <AppButton
            title={vi ? 'Bỏ' : 'Remove'}
            variant="ghost"
            fullWidth={false}
            disabled={busy}
            onPress={onClear}
          />
        </View>
      ) : (
        <AppButton
          title={vi ? 'Đính kèm hình ảnh' : 'Attach image'}
          variant="outline"
          disabled={busy}
          onPress={onChoose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  preview: { width: 64, height: 64, borderRadius: radius.md },
  previewCopy: { flex: 1, minWidth: 0 },
});
