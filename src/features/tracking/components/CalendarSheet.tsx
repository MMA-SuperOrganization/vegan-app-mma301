import { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { monthGrid, toLocalIsoDate, weekDays } from '../trackingState';

/** How many months, ending with the current one, the calendar lists. */
const MONTHS_SHOWN = 12;

export interface CalendarSheetProps {
  visible: boolean;
  /** Selected local day, `YYYY-MM-DD`. */
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

/** Scrollable month calendar; picking a day closes it. Future days are disabled. */
export function CalendarSheet({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: CalendarSheetProps) {
  const { t, locale } = useTranslation();
  const { formatLongDate, formatMonthYear } = useTrackingFormat();
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const today = toLocalIsoDate(new Date());
  const scrollRef = useRef<ScrollView>(null);
  const monthOffsets = useRef(new Map<string, number>());

  // Oldest first, so the list reads top to bottom like a calendar.
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_SHOWN }, (_, index) => {
      const value = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS_SHOWN - 1 - index),
        1
      );
      return { year: value.getFullYear(), month: value.getMonth() + 1 };
    });
  }, []);
  const weekdayLabels = weekDays(today).map((day) =>
    new Date(`${day}T12:00:00`).toLocaleDateString(localeTag, { weekday: 'narrow' })
  );
  const selectedMonthKey = selectedDate.slice(0, 7);

  const scrollToSelectedMonth = () => {
    const offset = monthOffsets.current.get(selectedMonthKey);
    if (offset != null) scrollRef.current?.scrollTo({ y: offset, animated: false });
  };
  useEffect(() => {
    if (visible) scrollToSelectedMonth();
  }, [visible, selectedMonthKey]);

  return (
    <BottomSheet
      visible={visible}
      title={t('tracking.day.chooseDate')}
      onClose={onClose}
      tall
    >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator>
        {months.map(({ year, month }) => {
          const key = `${year}-${String(month).padStart(2, '0')}`;
          return (
            <View
              key={key}
              style={styles.month}
              onLayout={(event) => {
                monthOffsets.current.set(key, event.nativeEvent.layout.y);
                if (key === selectedMonthKey) scrollToSelectedMonth();
              }}
            >
              <AppText variant="heading3" style={styles.monthTitle}>
                {formatMonthYear(`${key}-01`)}
              </AppText>
              <View style={styles.grid}>
                {weekdayLabels.map((label, index) => (
                  <View key={index} style={styles.cell}>
                    <AppText variant="caption" color={colors.text.secondary}>
                      {label}
                    </AppText>
                  </View>
                ))}
                {monthGrid(year, month).map((day, index) => {
                  if (!day) return <View key={`pad-${index}`} style={styles.cell} />;
                  const selected = day === selectedDate;
                  const future = day > today;
                  return (
                    <Pressable
                      key={day}
                      accessibilityRole="button"
                      accessibilityLabel={formatLongDate(day)}
                      accessibilityState={{ selected, disabled: future }}
                      disabled={future}
                      onPress={() => {
                        onSelect(day);
                        onClose();
                      }}
                      style={({ pressed }) => [
                        styles.cell,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[styles.dayCircle, selected && styles.selectedCircle]}
                      >
                        <AppText
                          variant={day === today ? 'bodyStrong' : 'bodyDefault'}
                          color={
                            selected
                              ? colors.text.inverse
                              : future
                                ? colors.text.disabled
                                : day === today
                                  ? colors.primary[700]
                                  : colors.text.primary
                          }
                        >
                          {Number(day.slice(8))}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  month: { paddingBottom: spacing.xl },
  monthTitle: { textTransform: 'capitalize', marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: { backgroundColor: colors.primary[700] },
  pressed: { opacity: 0.6 },
});
