import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  FilterChip,
  ScreenWrapper,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { parseGroceryQuantity } from '../groceryState';
import { useGroceryActions, useGroceryList } from '../hooks';
import type { GroceryUnit } from '../types';

const units: GroceryUnit[] = [
  'g',
  'kg',
  'ml',
  'l',
  'piece',
  'tbsp',
  'tsp',
  'cup',
  'serving',
];

type FieldErrors = Partial<Record<'name' | 'quantity', string>>;

export function GroceryItemEditorScreen() {
  const { id, itemId } = useLocalSearchParams<{ id?: string; itemId?: string }>();
  const goBack = useSafeBack(
    id ? { pathname: '/(grocery)/[id]', params: { id } } : '/(tabs)/grocery'
  );
  const { t } = useTranslation();
  const query = useGroceryList(id);
  const actions = useGroceryActions(id);
  const item = query.data?.items.find((candidate) => candidate.itemId === itemId);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<GroceryUnit>('piece');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!item) return;
    setName(item.nameSnapshot);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setNote(item.note ?? '');
  }, [item]);

  const save = async () => {
    const trimmedName = name.trim();
    const parsedQuantity = parseGroceryQuantity(quantity);
    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.name = t('grocery.itemNameRequired');
    if (!parsedQuantity) nextErrors.quantity = t('grocery.quantityInvalid');
    setErrors(nextErrors);
    if (!trimmedName || !parsedQuantity || Object.keys(nextErrors).length) return;

    const input = {
      nameSnapshot: trimmedName,
      quantity: parsedQuantity,
      unit,
      note: note.trim() || undefined,
    };
    try {
      if (item) await actions.updateItem.mutateAsync({ itemId: item.itemId, input });
      else await actions.addItem.mutateAsync(input);
      goBack();
    } catch {
      // Keep the form values so the user can retry.
    }
  };

  const confirmDelete = () => {
    if (!item) return;
    Alert.alert(t('grocery.deleteItemConfirmTitle'), t('grocery.deleteItemConfirmBody'), [
      { text: t('common.close'), style: 'cancel' },
      {
        text: t('grocery.deleteItem'),
        style: 'destructive',
        onPress: async () => {
          try {
            await actions.deleteItem.mutateAsync(item.itemId);
            goBack();
          } catch {
            // Keep the editor open so deletion can be retried.
          }
        },
      },
    ]);
  };

  const missingItem = Boolean(itemId && query.data && !item);
  const readOnly = query.data?.status === 'archived';

  return (
    <ScreenWrapper
      scrollable
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={itemId ? t('grocery.editItemTitle') : t('grocery.addItemTitle')}
          showBack
          backFallbackHref="/(tabs)/grocery"
        />
      }
    >
      <View style={styles.content}>
        <GroceryQueryState
          loading={query.isLoading}
          error={query.isError}
          onRetry={() => void query.refetch()}
        />
        {missingItem ? (
          <AppText color={colors.text.secondary}>{t('grocery.itemNotFound')}</AppText>
        ) : null}
        {query.data && !missingItem ? (
          <>
            {readOnly ? (
              <AppText color={colors.text.secondary}>{t('grocery.archivedReadOnly')}</AppText>
            ) : null}
            <AppInput
              label={t('grocery.itemName')}
              value={name}
              onChangeText={setName}
              placeholder={t('grocery.itemNamePlaceholder')}
              autoCapitalize="sentences"
              maxLength={200}
              error={errors.name}
              disabled={readOnly}
            />
            <AppInput
              label={t('grocery.quantityLabel')}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="1"
              error={errors.quantity}
              disabled={readOnly}
            />
            <View style={styles.field}>
              <AppText variant="bodyStrong">{t('grocery.unitLabel')}</AppText>
              <View style={styles.units}>
                {units.map((value) => (
                  <FilterChip
                    key={value}
                    label={t(`grocery.unit.${value}`)}
                    selected={unit === value}
                    disabled={readOnly}
                    onPress={() => setUnit(value)}
                  />
                ))}
              </View>
            </View>
            <AppInput
              label={t('grocery.noteLabel')}
              value={note}
              onChangeText={setNote}
              placeholder={t('grocery.notePlaceholder')}
              maxLength={1000}
              autoCapitalize="sentences"
              disabled={readOnly}
            />
            {actions.addItem.error || actions.updateItem.error || actions.deleteItem.error ? (
              <AppText color={colors.status.danger}>{t('grocery.saveError')}</AppText>
            ) : null}
          </>
        ) : null}
      </View>
      {query.data && !missingItem && !readOnly ? (
        <View style={styles.footer}>
          <AppButton
            title={t('grocery.save')}
            loading={actions.addItem.isPending || actions.updateItem.isPending}
            onPress={() => void save()}
          />
          {item ? (
            <AppButton
              title={t('grocery.deleteItem')}
              variant="danger"
              loading={actions.deleteItem.isPending}
              onPress={confirmDelete}
            />
          ) : null}
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['4xl'] },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  field: { gap: spacing.sm },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { marginTop: 'auto', paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'], gap: spacing.md },
});
