import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  addDays,
  formatDayMonthYear,
  parseDayMonthYear,
  toLocalIsoDate,
} from '../trackingState';
import { useTrackingFormat } from '../hooks/useTrackingFormat';

export function DatePickerSheet({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { formatLongDate } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  const [input, setInput] = useState(formatDayMonthYear(selectedDate));
  const [error, setError] = useState<string | null>(null);
  const recentDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(today, -index)),
    [today]
  );

  useEffect(() => {
    if (!visible) return;
    setInput(formatDayMonthYear(selectedDate));
    setError(null);
  }, [selectedDate, visible]);

  const choose = (date: string) => {
    onSelect(date);
    onClose();
  };

  const submit = () => {
    const parsed = parseDayMonthYear(input);
    if (!parsed || parsed > today) {
      setError(t('tracking.day.invalidDate'));
      return;
    }
    choose(parsed);
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('tracking.day.chooseDate')}
      onClose={onClose}
    >
      <AppInput
        label={t('tracking.day.dateLabel')}
        value={input}
        onChangeText={(value) => {
          setInput(value);
          if (error) setError(null);
        }}
        placeholder="DD/MM/YYYY"
        keyboardType="number-pad"
        error={error}
      />
      <View style={styles.recent}>
        {recentDates.map((date) => {
          const selected = date === selectedDate;
          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => choose(date)}
              style={({ pressed }) => [
                styles.day,
                selected && styles.selectedDay,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="bodySmall"
                color={selected ? colors.text.inverse : colors.text.primary}
                style={styles.dayText}
              >
                {formatLongDate(date)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppButton title={t('tracking.day.applyDate')} onPress={submit} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  recent: { gap: spacing.sm },
  day: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.base,
  },
  selectedDay: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  dayText: { textTransform: 'capitalize' },
  pressed: { opacity: 0.68 },
});
