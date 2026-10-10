import { StyleSheet, View } from 'react-native';
import type { Href } from 'expo-router';
import { AppText, BackButton } from '@/components';
import { useSafeBack } from '@/hooks';
import { spacing } from '@/theme';

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
  return (
    <View style={styles.container}>
      <BackButton onPress={goBack} />
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
});
