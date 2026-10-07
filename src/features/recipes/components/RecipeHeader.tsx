import { Pressable, StyleSheet, View } from 'react-native';
import type { Href } from 'expo-router';
import { AppText } from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function RecipeHeader({
  title,
  subtitle,
  backFallbackHref = '/(tabs)',
}: {
  title: string;
  subtitle?: string;
  backFallbackHref?: Href;
}) {
  const goBack = useSafeBack(backFallbackHref);
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={8}
        onPress={goBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <AppText variant="heading2" color={colors.primary[700]}>‹</AppText>
      </Pressable>
      <View style={styles.text}>
        <AppText variant="heading2">{title}</AppText>
        {subtitle ? <AppText variant="bodySmall">{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1 },
  back: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.background.selected, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
