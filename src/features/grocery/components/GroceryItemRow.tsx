import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { GroceryItem } from '../types';

export function GroceryItemRow({
  item,
  quantityLabel,
  toggleLabel,
  disabled,
  onToggle,
  onOpen,
}: {
  item: GroceryItem;
  quantityLabel: string;
  toggleLabel: string;
  disabled?: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={toggleLabel}
        accessibilityState={{ checked: item.checked, disabled }}
        disabled={disabled}
        onPress={onToggle}
        hitSlop={8}
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
      >
        {item.checked ? (
          <AppText color={colors.text.inverse} style={styles.checkmark}>✓</AppText>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.nameSnapshot}
        onPress={onOpen}
        style={styles.content}
      >
        <AppText
          variant="bodyStrong"
          numberOfLines={2}
          style={item.checked ? styles.checkedText : undefined}
        >
          {item.nameSnapshot}
        </AppText>
        <AppText
          variant="bodySmall"
          color={colors.text.secondary}
          style={item.checked ? styles.checkedText : undefined}
        >
          {quantityLabel}{item.note ? ` · ${item.note}` : ''}
        </AppText>
      </Pressable>
      <AppText color={colors.text.secondary}>›</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary[700] },
  checkmark: { fontSize: 17, lineHeight: 20 },
  content: { flex: 1, gap: 2 },
  checkedText: { textDecorationLine: 'line-through', color: colors.text.disabled },
});
