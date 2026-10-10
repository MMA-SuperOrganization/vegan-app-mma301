import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { getTimezoneOptions } from '@/utils/timezones';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { Input } from '../Input';

export function TimezonePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (timezone: string) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const options = useMemo(() => getTimezoneOptions(value), [value]);
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () =>
      normalizedQuery
        ? options.filter((option) =>
            option.label.toLocaleLowerCase().includes(normalizedQuery)
          )
        : options,
    [normalizedQuery, options]
  );
  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Input
        type="select"
        label={label}
        value={selected?.label ?? value}
        placeholder={t('timezone.select')}
        helper={t('timezone.offsetHint')}
        onChangeText={() => undefined}
        onSelect={() => setOpen(true)}
        error={error}
      />
      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <Pressable style={styles.content}>
              <AppText variant="heading3">{label}</AppText>
              <Input
                type="search"
                value={query}
                onChangeText={setQuery}
                placeholder={t('timezone.search')}
                autoFocus
              />
              <FlatList
                data={filtered}
                keyExtractor={(option) => option.value}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.options}
                ListEmptyComponent={
                  <AppText color={colors.text.secondary} style={styles.empty}>
                    {t('timezone.empty')}
                  </AppText>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: item.value === value }}
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}
                    style={[styles.option, item.value === value && styles.selected]}
                  >
                    <AppText
                      variant={item.value === value ? 'bodyStrong' : 'bodyDefault'}
                    >
                      {item.label}
                    </AppText>
                  </Pressable>
                )}
              />
              <Button title={t('common.close')} variant="ghost" onPress={close} />
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
    maxHeight: '82%',
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  content: { flexShrink: 1, gap: spacing.md },
  options: { gap: spacing.xs, paddingBottom: spacing.sm },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  selected: { backgroundColor: colors.background.selected },
  empty: { padding: spacing.xl, textAlign: 'center' },
});
