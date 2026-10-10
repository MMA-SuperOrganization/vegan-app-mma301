import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppInput, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { useGroceryActions, useGroceryList } from '../hooks';

const NAME_MAX_LENGTH = 120;

export function GroceryListEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const goBack = useSafeBack('/(tabs)/grocery');
  const { t } = useTranslation();
  const query = useGroceryList(id);
  const actions = useGroceryActions(id);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setName(query.data.name);
  }, [query.data]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('grocery.listNameRequired'));
      return;
    }
    setError(null);
    try {
      if (id) {
        await actions.update.mutateAsync({ id, input: { name: trimmed } });
        goBack();
      } else {
        const created = await actions.create.mutateAsync(trimmed);
        router.replace({ pathname: '/(grocery)/[id]', params: { id: created._id } });
      }
    } catch {
      // The request error is shown below the field.
    }
  };

  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={id ? t('grocery.renameTitle') : t('grocery.createTitle')}
          showBack
          backFallbackHref="/(tabs)/grocery"
        />
      }
    >
      <View style={styles.content}>
        {id ? (
          <GroceryQueryState
            loading={query.isLoading}
            error={query.isError}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {!id || query.data ? (
          <>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('grocery.listEditorSubtitle')}
            </AppText>
            <AppInput
              label={t('grocery.listName')}
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (error) setError(null);
              }}
              placeholder={t('grocery.listNamePlaceholder')}
              autoCapitalize="sentences"
              maxLength={NAME_MAX_LENGTH}
              error={error}
              autoFocus={!id}
            />
            {actions.create.error || actions.update.error ? (
              <AppText color={colors.status.danger}>{t('grocery.saveError')}</AppText>
            ) : null}
          </>
        ) : null}
      </View>
      <View style={styles.footer}>
        <AppButton
          title={t('grocery.save')}
          loading={actions.create.isPending || actions.update.isPending}
          disabled={Boolean(id && !query.data)}
          onPress={() => void save()}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['4xl'] },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  footer: { marginTop: 'auto', paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'] },
});
