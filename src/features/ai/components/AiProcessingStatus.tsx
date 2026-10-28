import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { getAiProgressStage } from '../aiProgress';

const labels = {
  vi: {
    sending: 'Đang gửi yêu cầu',
    checking: 'Đang kiểm tra hồ sơ và dữ liệu món ăn',
    generating: 'Đang tạo và kiểm tra câu trả lời',
    seconds: 'giây',
  },
  en: {
    sending: 'Sending your request',
    checking: 'Checking your profile and food data',
    generating: 'Generating and reviewing the answer',
    seconds: 'seconds',
  },
} as const;

export function AiProcessingStatus({ vi }: { vi: boolean }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 1_000);
    return () => clearInterval(timer);
  }, []);

  const copy = labels[vi ? 'vi' : 'en'];
  const stage = getAiProgressStage(elapsedMs);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={copy[stage]}
      accessibilityValue={{ text: copy[stage] }}
      style={styles.container}
    >
      <ActivityIndicator size="small" color={colors.primary[700]} />
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{copy[stage]}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {Math.floor(elapsedMs / 1_000)} {copy.seconds}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  copy: { flex: 1, gap: spacing.xs },
});
