import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';

type PickerView = 'calendar' | 'month' | 'year';

interface CalendarDatePickerProps {
  visible: boolean;
  title: string;
  value: Date;
  minimumDate: Date;
  maximumDate: Date;
  onConfirm: (value: Date) => void;
  onClose: () => void;
}

export function CalendarDatePicker({
  visible,
  title,
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onClose,
}: CalendarDatePickerProps) {
  const { t, locale } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [view, setView] = useState<PickerView>('calendar');

  useEffect(() => {
    if (!visible) return;
    setDraft(clampDate(value, minimumDate, maximumDate));
    setView('calendar');
  }, [maximumDate, minimumDate, value, visible]);

  const localeName = locale === 'vi' ? 'vi-VN' : 'en-US';
  const years = useMemo(
    () =>
      Array.from(
        { length: maximumDate.getFullYear() - minimumDate.getFullYear() + 1 },
        (_, index) => maximumDate.getFullYear() - index
      ),
    [maximumDate, minimumDate]
  );
  const calendar = useMemo(() => monthCalendar(draft), [draft]);
  const monthNames = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) =>
        new Intl.DateTimeFormat(localeName, { month: 'short' }).format(
          new Date(2024, month, 1)
        )
      ),
    [localeName]
  );
  const weekdayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(localeName, { weekday: 'narrow' }).format(
          new Date(2024, 0, index + 1)
        )
      ),
    [localeName]
  );

  const changeMonth = (offset: number) => {
    const next = new Date(draft.getFullYear(), draft.getMonth() + offset, 1);
    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0
    ).getDate();
    next.setDate(Math.min(draft.getDate(), lastDay));
    setDraft(clampDate(next, minimumDate, maximumDate));
  };
  const selectMonth = (month: number) => {
    const lastDay = new Date(draft.getFullYear(), month + 1, 0).getDate();
    const next = new Date(
      draft.getFullYear(),
      month,
      Math.min(draft.getDate(), lastDay)
    );
    setDraft(clampDate(next, minimumDate, maximumDate));
    setView('calendar');
  };
  const selectYear = (year: number) => {
    const lastDay = new Date(year, draft.getMonth() + 1, 0).getDate();
    const next = new Date(
      year,
      draft.getMonth(),
      Math.min(draft.getDate(), lastDay)
    );
    setDraft(clampDate(next, minimumDate, maximumDate));
    setView('calendar');
  };
  const canMovePrevious =
    new Date(draft.getFullYear(), draft.getMonth(), 1) >
    new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
  const canMoveNext =
    new Date(draft.getFullYear(), draft.getMonth() + 1, 0) <
    new Date(maximumDate.getFullYear(), maximumDate.getMonth() + 1, 0);

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      tall
      height="82%"
      showFooterClose={false}
    >
      <View style={styles.content}>
        <View style={styles.periodRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.previousMonth')}
            disabled={!canMovePrevious || view !== 'calendar'}
            onPress={() => changeMonth(-1)}
            style={({ pressed }) => [
              styles.navButton,
              (!canMovePrevious || view !== 'calendar') && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon name="back" size={22} decorative />
          </Pressable>
          <View style={styles.periodSelectors}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView(view === 'month' ? 'calendar' : 'month')}
              style={[styles.periodChip, view === 'month' && styles.selectedChip]}
            >
              <AppText variant="bodyStrong">
                {new Intl.DateTimeFormat(localeName, { month: 'long' }).format(
                  draft
                )}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView(view === 'year' ? 'calendar' : 'year')}
              style={[styles.periodChip, view === 'year' && styles.selectedChip]}
            >
              <AppText variant="bodyStrong">{draft.getFullYear()}</AppText>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.nextMonth')}
            disabled={!canMoveNext || view !== 'calendar'}
            onPress={() => changeMonth(1)}
            style={({ pressed }) => [
              styles.navButton,
              (!canMoveNext || view !== 'calendar') && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name="back"
              size={22}
              decorative
              style={styles.forwardIcon}
            />
          </Pressable>
        </View>

        {view === 'calendar' ? (
          <View style={styles.calendar}>
            <View style={styles.weekRow}>
              {weekdayNames.map((name, index) => (
                <AppText
                  key={`${name}:${index}`}
                  variant="bodySmall"
                  color={colors.text.secondary}
                  style={styles.weekday}
                >
                  {name}
                </AppText>
              ))}
            </View>
            {calendar.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((date, dayIndex) => {
                  const disabled =
                    !date || date < startOfDay(minimumDate) || date > startOfDay(maximumDate);
                  const selected = date ? sameDay(date, draft) : false;
                  return (
                    <View key={dayIndex} style={styles.daySlot}>
                      {date ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled }}
                          disabled={disabled}
                          onPress={() => setDraft(date)}
                          style={({ pressed }) => [
                            styles.day,
                            selected && styles.selectedDay,
                            disabled && styles.disabled,
                            pressed && styles.pressed,
                          ]}
                        >
                          <AppText
                            variant={selected ? 'bodyStrong' : 'bodyDefault'}
                            color={selected ? colors.text.inverse : undefined}
                          >
                            {date.getDate()}
                          </AppText>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {view === 'month' ? (
          <View style={styles.monthGrid}>
            {monthNames.map((name, month) => {
              const selected = month === draft.getMonth();
              const disabled =
                new Date(draft.getFullYear(), month + 1, 0) < minimumDate ||
                new Date(draft.getFullYear(), month, 1) > maximumDate;
              return (
                <Pressable
                  key={month}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => selectMonth(month)}
                  style={({ pressed }) => [
                    styles.gridChoice,
                    selected && styles.selectedChoice,
                    disabled && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    variant={selected ? 'bodyStrong' : 'bodyDefault'}
                    color={selected ? colors.text.inverse : undefined}
                  >
                    {name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {view === 'year' ? (
          <FlatList
            data={years}
            key="year-grid"
            numColumns={4}
            keyExtractor={(year) => String(year)}
            contentContainerStyle={styles.yearGrid}
            renderItem={({ item: year }) => {
              const selected = year === draft.getFullYear();
              return (
                <View style={styles.yearSlot}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => selectYear(year)}
                    style={({ pressed }) => [
                      styles.gridChoice,
                      selected && styles.selectedChoice,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant={selected ? 'bodyStrong' : 'bodyDefault'}
                      color={selected ? colors.text.inverse : undefined}
                    >
                      {year}
                    </AppText>
                  </Pressable>
                </View>
              );
            }}
          />
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          title={t('calendar.confirmDate')}
          icon="check"
          onPress={() => onConfirm(draft)}
        />
        <Button title={t('common.close')} variant="ghost" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

function monthCalendar(value: Date) {
  const first = new Date(value.getFullYear(), value.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const lastDay = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from(
      { length: lastDay },
      (_, index) => new Date(value.getFullYear(), value.getMonth(), index + 1)
    ),
  ];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7)
  );
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function clampDate(value: Date, minimumDate: Date, maximumDate: Date) {
  const date = startOfDay(value);
  if (date < startOfDay(minimumDate)) return startOfDay(minimumDate);
  if (date > startOfDay(maximumDate)) return startOfDay(maximumDate);
  return date;
}

function sameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: 0, gap: spacing.lg },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodSelectors: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  forwardIcon: { transform: [{ rotate: '180deg' }] },
  periodChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  selectedChip: { backgroundColor: colors.background.selected },
  calendar: { gap: spacing.xs },
  weekRow: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center' },
  daySlot: { width: `${100 / 7}%`, alignItems: 'center' },
  day: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  selectedDay: { backgroundColor: colors.primary[700] },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridChoice: {
    minHeight: 46,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  selectedChoice: { backgroundColor: colors.primary[700] },
  yearGrid: { paddingBottom: spacing.md },
  yearSlot: { width: '25%', height: 56, alignItems: 'center' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.72 },
  actions: { gap: spacing.sm },
});
