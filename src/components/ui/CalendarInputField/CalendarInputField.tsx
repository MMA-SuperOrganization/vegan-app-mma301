import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { formatDateInput } from '@/utils/dateInput';
import { CalendarDatePicker } from '../CalendarDatePicker';
import { Input } from '../Input';

export type CalendarInputFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY';

interface CalendarInputFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  format?: CalendarInputFormat;
  helper?: string;
  error?: string | null;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  defaultDate?: Date;
  testID?: string;
}

const DEFAULT_MINIMUM_DATE = new Date(1900, 0, 1);
const DEFAULT_MAXIMUM_DATE = new Date(2100, 11, 31);

/** A manually editable date field with the same branded calendar across the app. */
export function CalendarInputField({
  label,
  value,
  onChangeText,
  format = 'YYYY-MM-DD',
  helper,
  error,
  disabled = false,
  minimumDate = DEFAULT_MINIMUM_DATE,
  maximumDate = DEFAULT_MAXIMUM_DATE,
  defaultDate,
  testID,
}: CalendarInputFieldProps) {
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const pickerValue = useMemo(
    () =>
      parseCalendarDate(value, format) ??
      clampDate(defaultDate ?? new Date(), minimumDate, maximumDate),
    [defaultDate, format, maximumDate, minimumDate, value]
  );

  return (
    <>
      <Input
        testID={testID}
        label={label}
        placeholder={format}
        value={value}
        onChangeText={(next) =>
          onChangeText(
            format === 'DD/MM/YYYY' ? formatDateInput(next, value) : next
          )
        }
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        helper={helper}
        error={error}
        disabled={disabled}
        trailingIcon="calendar"
        trailingAccessibilityLabel={t('calendar.chooseDate')}
        onTrailingPress={() => setPickerVisible(true)}
      />
      <CalendarDatePicker
        visible={pickerVisible}
        title={t('calendar.title')}
        value={pickerValue}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={(selected) => {
          onChangeText(formatCalendarDate(selected, format));
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

function parseCalendarDate(value: string, format: CalendarInputFormat) {
  const match =
    format === 'YYYY-MM-DD'
      ? value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      : value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [year, month, day] =
    format === 'YYYY-MM-DD'
      ? [Number(match[1]), Number(match[2]), Number(match[3])]
      : [Number(match[3]), Number(match[2]), Number(match[1])];
  const candidate = new Date(year, month - 1, day);
  return candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
    ? candidate
    : null;
}

function formatCalendarDate(value: Date, format: CalendarInputFormat) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return format === 'YYYY-MM-DD'
    ? `${value.getFullYear()}-${month}-${day}`
    : `${day}/${month}/${value.getFullYear()}`;
}

function clampDate(value: Date, minimumDate: Date, maximumDate: Date) {
  if (value < minimumDate) return minimumDate;
  if (value > maximumDate) return maximumDate;
  return value;
}
