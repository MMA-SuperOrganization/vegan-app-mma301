import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppInput, AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';

export function SelectionField<T extends string>({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? '';
  return (
    <>
      <AppInput
        type="select"
        label={label}
        value={selectedLabel}
        placeholder={placeholder}
        onChangeText={() => undefined}
        onSelect={() => setOpen(true)}
        error={error}
      />
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <Pressable>
              <AppText variant="heading3" style={styles.heading}>
                {label}
              </AppText>
              <ScrollView
                style={styles.optionsScroll}
                contentContainerStyle={styles.options}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: option.value === value }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      option.value === value && styles.selected,
                    ]}
                  >
                    <AppText
                      variant={option.value === value ? 'bodyStrong' : 'bodyDefault'}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
              <AppButton
                title={t('common.close')}
                variant="ghost"
                onPress={() => setOpen(false)}
              />
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay.modal,
  },
  sheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  heading: { marginBottom: spacing.lg },
  optionsScroll: { maxHeight: 360, marginBottom: spacing.md },
  options: { gap: spacing.sm },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  selected: { backgroundColor: colors.background.selected },
});
