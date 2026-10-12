import { useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

const ITEM_HEIGHT = 48;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * 3;

export type WheelOption = {
  value: number;
  label: string;
};

export function WheelPicker({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: WheelOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
}) {
  const list = useRef<FlatList<WheelOption>>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue)
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      list.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex]);

  const selectSnappedOption = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.max(
      0,
      Math.min(
        options.length - 1,
        Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)
      )
    );
    onSelect(options[index].value);
  };

  return (
    <View style={styles.column}>
      <AppText variant="bodyStrong" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.viewport}>
        <View pointerEvents="none" style={styles.selection} />
        <FlatList
          ref={list}
          data={options}
          keyExtractor={(option) => String(option.value)}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={styles.content}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={selectSnappedOption}
          renderItem={({ item }) => {
            const selected = item.value === selectedValue;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${item.label}`}
                accessibilityState={{ selected }}
                onPress={() => onSelect(item.value)}
                style={({ pressed }) => [
                  styles.option,
                  !selected && styles.unselectedOption,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant={selected ? 'heading4' : 'bodyStrong'}
                  color={selected ? colors.primary[800] : colors.text.secondary}
                  numberOfLines={1}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, gap: spacing.xs },
  label: { textAlign: 'center' },
  viewport: {
    height: VIEWPORT_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.base,
  },
  selection: {
    position: 'absolute',
    zIndex: 0,
    top: ITEM_HEIGHT,
    right: spacing.xs,
    left: spacing.xs,
    height: ITEM_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: colors.background.selected,
  },
  content: { paddingVertical: ITEM_HEIGHT },
  option: {
    zIndex: 1,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedOption: { opacity: 0.48 },
  pressed: { opacity: 0.7 },
});
