import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, BottomSheet, Loading } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { hasExactIngredientName } from '../ingredientState';
import { useCreatePersonalIngredient, useIngredientSuggestions } from '../hooks';
import type { GroceryUnit, IngredientSelection } from '../types';

interface IngredientPickerSheetProps {
  visible: boolean;
  query: string;
  defaultUnit: GroceryUnit;
  onQueryChange: (value: string) => void;
  onSelect: (ingredient: IngredientSelection) => void;
  onClose: () => void;
}

export function IngredientPickerSheet({
  visible,
  query,
  defaultUnit,
  onQueryChange,
  onSelect,
  onClose,
}: IngredientPickerSheetProps) {
  const { t } = useTranslation();
  const term = query.trim();
  const suggestions = useIngredientSuggestions(query, visible);
  const createPersonal = useCreatePersonalIngredient();
  const items = suggestions.data ?? [];
  const searchPending = term !== suggestions.term || suggestions.isLoading;
  const canCreate =
    Boolean(term) &&
    !searchPending &&
    !suggestions.isError &&
    !hasExactIngredientName(items, term);

  const create = async () => {
    if (!canCreate || createPersonal.isPending) return;
    try {
      const ingredient = await createPersonal.mutateAsync({
        name: term,
        defaultUnit,
      });
      onSelect({
        id: ingredient._id,
        source: 'personal',
        name: ingredient.name,
        defaultUnit: ingredient.defaultUnit,
        personalIngredientId: ingredient._id,
      });
    } catch {
      // Mutation state keeps the sheet open and renders a retryable error.
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('grocery.ingredientPickerTitle')}
      onClose={onClose}
      tall
    >
      <AppInput
        type="search"
        value={query}
        onChangeText={(value) => {
          createPersonal.reset();
          onQueryChange(value);
        }}
        placeholder={t('grocery.ingredientSearchPlaceholder')}
        autoCapitalize="sentences"
        autoCorrect
      />

      <View style={styles.content}>
        {!term ? (
          <AppText color={colors.text.secondary} style={styles.center}>
            {t('grocery.ingredientSearchHint')}
          </AppText>
        ) : searchPending ? (
          <View style={styles.centerState}>
            <Loading />
          </View>
        ) : suggestions.isError ? (
          <View style={styles.centerState}>
            <AppText color={colors.status.danger} style={styles.center}>
              {t('grocery.ingredientSearchError')}
            </AppText>
            <AppButton
              title={t('common.retry')}
              variant="outline"
              onPress={() => void suggestions.refetch()}
            />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.source}:${item.id}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <AppText color={colors.text.secondary} style={styles.center}>
                {t('grocery.ingredientNoMatch')}
              </AppText>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${t(
                  item.source === 'catalog'
                    ? 'grocery.ingredientSourceCatalog'
                    : 'grocery.ingredientSourcePersonal'
                )}`}
                onPress={() => onSelect(item)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <View style={styles.rowText}>
                  <AppText variant="bodyStrong">{item.name}</AppText>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {t(
                      item.source === 'catalog'
                        ? 'grocery.ingredientSourceCatalog'
                        : 'grocery.ingredientSourcePersonal'
                    )}
                  </AppText>
                </View>
                <AppText color={colors.text.secondary}>
                  {t(`grocery.unit.${item.defaultUnit}`)}
                </AppText>
              </Pressable>
            )}
          />
        )}
      </View>

      {canCreate ? (
        <View style={styles.createSection}>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t('grocery.createPersonalHint')}
          </AppText>
          <AppButton
            title={t('grocery.createPersonalIngredient', { name: term })}
            variant="outline"
            loading={createPersonal.isPending}
            onPress={() => void create()}
          />
        </View>
      ) : null}
      {createPersonal.isError ? (
        <AppText accessibilityRole="alert" color={colors.status.danger}>
          {t('grocery.createPersonalError')}
        </AppText>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: 0 },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  center: { textAlign: 'center' },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  rowPressed: { backgroundColor: colors.background.selected },
  rowText: { flex: 1, gap: spacing.xs },
  createSection: { gap: spacing.sm },
});
