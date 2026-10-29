import { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from '@/i18n';
import { formatDateInput } from '@/utils/dateInput';
import { spacing } from '@/theme';
import { Button } from '../Button';
import { Input } from '../Input';

interface DateInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function DateInputField({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: DateInputFieldProps) {
  const { t, locale } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const pickerValue = useMemo(
    () => parseDateInput(value) ?? defaultBirthDate(),
    [value]
  );

  const chooseDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerVisible(false);
    if (event.type !== 'set' || !selected) return;
    onChange(formatSelectedDate(selected));
  };

  return (
    <View style={styles.container}>
      <Input
        label={label}
        placeholder="DD/MM/YYYY"
        value={value}
        onChangeText={(next) => onChange(formatDateInput(next, value))}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={error}
        disabled={disabled}
      />
      <Button
        title={t('tracking.day.chooseDate')}
        variant="outline"
        fullWidth={false}
        disabled={disabled}
        onPress={() => setPickerVisible(true)}
      />
      {pickerVisible ? (
        <View style={styles.picker}>
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            locale={locale === 'vi' ? 'vi-VN' : 'en-US'}
            minimumDate={new Date(1900, 0, 1)}
            maximumDate={new Date()}
            onChange={chooseDate}
          />
          {Platform.OS === 'ios' ? (
            <Button
              title={t('common.close')}
              variant="ghost"
              fullWidth={false}
              onPress={() => setPickerVisible(false)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function parseDateInput(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const candidate = new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1])
  );
  return candidate.getFullYear() === Number(match[3]) &&
    candidate.getMonth() === Number(match[2]) - 1 &&
    candidate.getDate() === Number(match[1])
    ? candidate
    : null;
}

function defaultBirthDate() {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}

function formatSelectedDate(value: Date) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${value.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  picker: { alignItems: 'flex-start', gap: spacing.sm },
});
