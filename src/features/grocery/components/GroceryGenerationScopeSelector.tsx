import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { GroceryGenerationScope } from '../types';

const scopes: GroceryGenerationScope[] = ['day', 'week'];

export function GroceryGenerationScopeSelector({
  value,
  disabled,
  onChange,
}: {
  value: GroceryGenerationScope;
  disabled?: boolean;
  onChange: (scope: GroceryGenerationScope) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <AppText variant="bodyStrong">{t('grocery.generateScopeLabel')}</AppText>
      <View style={styles.options} accessibilityRole="tablist">
        {scopes.map((scope) => {
          const selected = scope === value;
          return (
            <Pressable
              key={scope}
              accessibilityRole="tab"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(scope)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressed,
                disabled && styles.disabled,
              ]}
            >
              <View style={styles.optionTitle}>
                <AppText
                  variant="bodyStrong"
                  color={selected ? colors.text.inverse : colors.primary[700]}
                >
                  {t(`grocery.generateScope.${scope}.title`)}
                </AppText>
                {selected ? (
                  <View style={styles.check}>
                    <AppIcon
                      name="check"
                      size={14}
                      color={colors.primary[700]}
                      decorative
                    />
                  </View>
                ) : null}
              </View>
              <AppText
                variant="bodySmall"
                color={selected ? colors.primary[100] : colors.text.secondary}
              >
                {t(`grocery.generateScope.${scope}.description`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: 96,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  selectedOption: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  optionTitle: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  check: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.common.white,
  },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.5 },
});
