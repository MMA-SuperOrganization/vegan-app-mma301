import { CalendarInputField } from '../CalendarInputField';

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
  return (
    <CalendarInputField
      label={label}
      value={value}
      onChangeText={onChange}
      format="DD/MM/YYYY"
      error={error}
      disabled={disabled}
      minimumDate={new Date(1900, 0, 1)}
      maximumDate={new Date()}
      defaultDate={defaultBirthDate()}
    />
  );
}

function defaultBirthDate() {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}
