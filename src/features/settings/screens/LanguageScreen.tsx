import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, SettingsScreenLayout } from '@/components';
import { useTranslation, type Locale } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

const localeOptions: Array<{ value: Locale; labelKey: 'language.vietnamese' | 'language.english' }> = [
  { value: 'vi', labelKey: 'language.vietnamese' },
  { value: 'en', labelKey: 'language.english' },
];

export function LanguageScreen() {
  const { locale, setLocale, error, t } = useTranslation();
  return (
    <SettingsScreenLayout
      title={t('language.title')}
      subtitle={t('language.subtitle')}
      scrollable={false}
    >
      <View style={styles.options}>
        {localeOptions.map((option) => {
          const selected = option.value === locale;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => void setLocale(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="heading4">{t(option.labelKey)}</AppText>
              {selected ? (
                <AppText variant="bodySmall" color={colors.primary[700]}>
                  ✓ {t('language.selected')}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {error ? <AppText color={colors.status.danger}>{error}</AppText> : null}
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.md },
  option: {
    minHeight: 76,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  selected: { borderColor: colors.primary[700], backgroundColor: colors.background.selected },
  pressed: { opacity: 0.72 },
});
