import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { TrackingSheet } from './TrackingSheet';

export interface PickerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface SearchPickerSheetProps {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: PickerItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function SearchPickerSheet({
  visible,
  title,
  searchPlaceholder,
  query,
  onQueryChange,
  items,
  isLoading,
  isError,
  onRetry,
  onSelect,
  onClose,
}: SearchPickerSheetProps) {
  const { t } = useTranslation();

  let content;
  if (isLoading) {
    content = (
      <View style={styles.state}>
        <LoadingSpinner />
      </View>
    );
  } else if (isError) {
    content = (
      <View style={styles.state}>
        <AppText color={colors.text.secondary} style={styles.center}>
          {t('tracking.picker.error')}
        </AppText>
        <AppButton title={t('common.retry')} variant="outline" onPress={onRetry} />
      </View>
    );
  } else if (items.length === 0) {
    content = (
      <View style={styles.state}>
        <AppText color={colors.text.secondary} style={styles.center}>
          {t('tracking.picker.empty')}
        </AppText>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={[item.title, item.subtitle]
              .filter(Boolean)
              .join(', ')}
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imageFallback]} />
            )}
            <View style={styles.rowText}>
              <AppText variant="bodyStrong" numberOfLines={2}>
                {item.title}
              </AppText>
              {item.subtitle ? (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {item.subtitle}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    );
  }

  return (
    <TrackingSheet visible={visible} title={title} onClose={onClose} tall>
      <AppInput
        type="search"
        value={query}
        onChangeText={onQueryChange}
        placeholder={searchPlaceholder}
        accessibilityLabel={searchPlaceholder}
      />
      <View style={styles.content}>{content}</View>
    </TrackingSheet>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  center: { textAlign: 'center' },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.base,
  },
  pressed: { backgroundColor: colors.background.selected },
  image: { width: 52, height: 52, borderRadius: radius.md },
  imageFallback: { backgroundColor: colors.background.muted },
  rowText: { flex: 1, gap: spacing.xs },
});
