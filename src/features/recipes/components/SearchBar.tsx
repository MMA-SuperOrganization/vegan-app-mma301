import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from '@/components';
import { colors, fontFamily, radius, spacing } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  autoFocus = false,
  style,
  inputStyle,
  accessibilityLabel = 'Search',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const hasValue = value.length > 0;

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        style,
      ]}
    >
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={accessibilityLabel}
        style={[styles.input, inputStyle]}
      />

      {hasValue ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
          style={styles.clearButton}
        >
          <AppIcon
            name="close"
            size={14}
            color={colors.text.secondary}
            decorative
          />
        </Pressable>
      ) : null}

      <Pressable
        onPress={onSubmit}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Perform search"
        style={styles.searchButton}
      >
        <AppIcon name="search" size={20} color="#FFFFFF" decorative />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    paddingLeft: spacing.lg,
    paddingRight: 7,
    gap: spacing.sm,
  },
  containerFocused: {
    borderColor: colors.primary[700],
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
