import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { AiSafetyNotice } from '../types';

export function AiSafetyNotices({
  notices,
  vi,
}: {
  notices?: AiSafetyNotice[];
  vi: boolean;
}) {
  if (!notices?.length) return null;
  return (
    <View style={styles.list}>
      {notices.map((notice) => (
        <View key={notice.code} accessibilityRole="alert" style={styles.notice}>
          <AppText variant="bodyStrong" color={colors.status.warning}>
            {vi ? 'Cảnh báo dị nguyên' : 'Allergen caution'}
          </AppText>
          <AppText variant="bodySmall">
            {notice.code === 'ALLERGEN_CAUTION'
              ? vi
                ? 'Đã loại trừ món khớp với dị nguyên bạn lưu. Dữ liệu thành phần và lây nhiễm chéo có thể chưa đầy đủ; hãy kiểm tra nhãn và cách chế biến trước khi ăn.'
                : 'Items matching your saved allergens were excluded. Ingredient and cross-contact data may be incomplete; verify labels and preparation before eating.'
              : notice.message}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function AiMedicalDisclaimer({ vi }: { vi: boolean }) {
  return (
    <View accessibilityRole="alert" style={styles.medical}>
      <AppText variant="bodyStrong">
        {vi ? 'Giới hạn tư vấn sức khỏe' : 'Health advice limits'}
      </AppText>
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {vi
          ? 'AI không chẩn đoán bệnh, kê đơn hoặc thay thế chuyên gia y tế. Với triệu chứng khẩn cấp, hãy liên hệ cơ sở y tế hoặc dịch vụ cấp cứu.'
          : 'AI does not diagnose illness, prescribe treatment, or replace a healthcare professional. For urgent symptoms, contact medical or emergency services.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warning,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  medical: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
});
