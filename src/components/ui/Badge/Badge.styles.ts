import { StyleSheet } from 'react-native';
import { coreTokens } from '@/theme';
const t = coreTokens.badge;
export const styles = StyleSheet.create({
  base: { ...t.default, minHeight: t.minHeight, alignSelf: 'flex-start' },
  sizeSm: t.small,
  sizeMd: {},
  primary: t.selected,
  secondary: t.default,
  neutral: t.default,
  success: { borderColor: t.status.success },
  warning: { borderColor: t.status.warning },
  danger: { borderColor: t.status.danger },
  text: t.label,
  textPrimary: t.selectedLabel,
  textSecondary: t.label,
  textNeutral: t.label,
  textSuccess: { color: t.status.success },
  textWarning: { color: t.status.warning },
  textDanger: { color: t.status.danger },
});
