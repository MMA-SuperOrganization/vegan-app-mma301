import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  BottomSheet,
  CustomHeader,
  FilterChip,
  ScreenWrapper,
  SearchPickerSheet,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, spacing } from '@/theme';
import { PantryQueryState } from '../components/PantryQueryState';
import { usePantry, usePantryActions, usePantryFoodOptions } from '../hooks';
import {
  PANTRY_UNITS,
  pantryExpiryDay,
  parsePantryExpiry,
  parsePantryQuantity,
} from '../pantryState';
import type { PantryItem, PantryUnit } from '../types';

export function PantryItemEditorScreen() {
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const { t } = useTranslation();
  const query = usePantry();
  const item = query.data?.items.find((candidate) => candidate.itemId === itemId);
  if (itemId && (!query.data || !item)) {
    return (
      <ScreenWrapper
        header={
          <CustomHeader
            title={t('pantry.edit')}
            showBack
            backFallbackHref="/pantry"
          />
        }
      >
        <PantryQueryState
          loading={query.isLoading}
          error={query.isError}
          onRetry={() => void query.refetch()}
        />
        {query.data && !query.isError && !item ? (
          <View style={styles.content}>
            <AppText>{t('pantry.notFound')}</AppText>
          </View>
        ) : null}
      </ScreenWrapper>
    );
  }
  return <PantryItemForm key={itemId ?? 'new'} item={item} />;
}

type FieldErrors = Partial<Record<'food' | 'quantity' | 'expiry', TranslationKey>>;

function PantryItemForm({ item }: { item?: PantryItem }) {
  const { t } = useTranslation();
  const goBack = useSafeBack('/pantry');
  const actions = usePantryActions();
  const [food, setFood] = useState(
    item
      ? {
          id: item.foodItemId ?? item.personalIngredientId ?? '',
          name: item.foodNameSnapshot,
        }
      : null
  );
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '1');
  const [unit, setUnit] = useState<PantryUnit>(item?.unit ?? 'g');
  const [expiry, setExpiry] = useState(pantryExpiryDay(item?.expiresAt));
  const [note, setNote] = useState(item?.note ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const foodOptions = usePantryFoodOptions(search, pickerOpen);
  const options = foodOptions.data?.pages.flatMap((page) => page.data) ?? [];
  const pending =
    actions.addItem.isPending ||
    actions.updateItem.isPending ||
    actions.deleteItem.isPending;
  const error =
    actions.addItem.error || actions.updateItem.error || actions.deleteItem.error;

  const save = async () => {
    if (pending) return;
    const parsedQuantity = parsePantryQuantity(quantity);
    const expiresAt = parsePantryExpiry(expiry);
    const nextErrors: FieldErrors = {};
    if (!food) nextErrors.food = 'pantry.foodRequired';
    if (parsedQuantity === null) nextErrors.quantity = 'pantry.quantityInvalid';
    if (expiresAt === undefined) nextErrors.expiry = 'pantry.expiryInvalid';
    setErrors(nextErrors);
    if (!food || parsedQuantity === null || expiresAt === undefined) return;
    const input = {
      quantity: parsedQuantity,
      unit,
      expiresAt:
        item && expiry === pantryExpiryDay(item.expiresAt)
          ? (item.expiresAt ?? null)
          : expiresAt,
      note: note.trim(),
    };
    try {
      if (item) await actions.updateItem.mutateAsync({ itemId: item.itemId, input });
      else await actions.addItem.mutateAsync({ ...input, foodItemId: food.id });
      goBack();
    } catch {
      // Mutation state shows the error while preserving the user's draft.
    }
  };

  const remove = async () => {
    if (!item || pending) return;
    try {
      await actions.deleteItem.mutateAsync(item.itemId);
      setConfirmDelete(false);
      goBack();
    } catch {
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <ScreenWrapper
        scrollable
        testID="pantry-item-editor"
        contentContainerStyle={styles.screen}
        header={
          <CustomHeader
            title={t(item ? 'pantry.edit' : 'pantry.add')}
            showBack
            backFallbackHref="/pantry"
          />
        }
      >
        <View style={styles.content}>
          <AppInput
            type="select"
            label={t('pantry.food')}
            value={food?.name ?? ''}
            onChangeText={() => undefined}
            placeholder={t('pantry.chooseFood')}
            onSelect={() => setPickerOpen(true)}
            disabled={pending || Boolean(item)}
            required
            error={errors.food ? t(errors.food) : undefined}
            helper={item ? t('pantry.foodFixed') : undefined}
          />
          <AppInput
            label={t('grocery.quantityLabel')}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            required
            disabled={pending}
            error={errors.quantity ? t(errors.quantity) : undefined}
          />
          <View style={styles.field}>
            <AppText variant="bodyStrong">{t('grocery.unitLabel')}</AppText>
            <View style={styles.units}>
              {PANTRY_UNITS.map((value) => (
                <FilterChip
                  key={value}
                  label={t(`grocery.unit.${value}`)}
                  selected={unit === value}
                  disabled={pending}
                  onPress={() => setUnit(value)}
                />
              ))}
            </View>
          </View>
          <AppInput
            label={t('pantry.expiry')}
            value={expiry}
            onChangeText={setExpiry}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            helper={t('pantry.expiryHint')}
            disabled={pending}
            error={errors.expiry ? t(errors.expiry) : undefined}
          />
          <AppInput
            label={t('grocery.noteLabel')}
            value={note}
            onChangeText={setNote}
            maxLength={1000}
            disabled={pending}
            autoCapitalize="sentences"
          />
          {error ? (
            <AppText accessibilityRole="alert" color={colors.status.danger}>
              {error.message || t('pantry.saveError')}
            </AppText>
          ) : null}
        </View>
        <View style={styles.footer}>
          <AppButton
            title={t('grocery.save')}
            loading={actions.addItem.isPending || actions.updateItem.isPending}
            disabled={actions.deleteItem.isPending}
            onPress={() => void save()}
          />
          {item ? (
            <AppButton
              title={t('pantry.delete')}
              variant="danger"
              disabled={pending}
              onPress={() => setConfirmDelete(true)}
            />
          ) : null}
        </View>
      </ScreenWrapper>
      <SearchPickerSheet
        visible={pickerOpen}
        title={t('pantry.chooseFood')}
        searchPlaceholder={t('tracking.picker.searchFood')}
        query={search}
        onQueryChange={setSearch}
        items={options.map((option) => ({
          id: option._id,
          title: option.name,
          imageUrl: option.imageUrl,
        }))}
        isLoading={foodOptions.isLoading}
        isError={foodOptions.isError}
        onRetry={() => void foodOptions.refetch()}
        onClose={() => setPickerOpen(false)}
        hasMore={foodOptions.hasNextPage}
        loadingMore={foodOptions.isFetchingNextPage}
        onLoadMore={() => void foodOptions.fetchNextPage()}
        onSelect={(id) => {
          const selected = options.find((option) => option._id === id);
          if (!selected) return;
          setFood({ id: selected._id, name: selected.name });
          setErrors((current) => ({ ...current, food: undefined }));
          setPickerOpen(false);
        }}
      />
      <BottomSheet
        visible={confirmDelete}
        title={t('pantry.deleteTitle')}
        onClose={() => {
          if (!pending) setConfirmDelete(false);
        }}
      >
        <View style={styles.field}>
          <AppText>
            {t('pantry.deleteDescription', { name: item?.foodNameSnapshot ?? '' })}
          </AppText>
          <AppButton
            title={t('pantry.delete')}
            variant="danger"
            loading={actions.deleteItem.isPending}
            onPress={() => void remove()}
          />
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['2xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  field: { gap: spacing.md },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
});
