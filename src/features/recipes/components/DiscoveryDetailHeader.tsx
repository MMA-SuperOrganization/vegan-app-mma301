import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText, CustomHeader } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';

export function DiscoveryDetailHeader({
  title,
  subtitle,
  backFallbackHref = '/(discover)/explore',
}: {
  title: string;
  subtitle?: string;
  backFallbackHref?: Href;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View>
      <CustomHeader
        title={title}
        showBack
        backFallbackHref={backFallbackHref}
        rightAction={{
          icon: 'home',
          accessibilityLabel: t('common.backHome'),
          onPress: () => {
            router.dismissAll();
            router.replace('/(tabs)');
          },
        }}
      />
      {subtitle ? (
        <AppText
          variant="bodySmall"
          color={colors.text.secondary}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
});
