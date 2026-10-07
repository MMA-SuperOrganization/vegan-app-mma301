import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import { ContentResultCard, useHomeFeed } from '@/features/recipes';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useProfileStore((state) => state.data);
  const home = useHomeFeed();
  const firstName = profile?.user.name.trim().split(/\s+/).at(-1) || t('common.youLower');
  const recommendations = home.data?.personalized?.recipes?.length
    ? home.data.personalized.recipes
    : home.data?.featured.recipes ?? [];

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.hero}>
        <AppText variant="heading1">{t('home.greeting', { name: firstName })}</AppText>
        <AppText variant="bodyLarge" color={colors.text.secondary}>
          {t('home.question')}
        </AppText>
      </View>

      <View>
        <AppText variant="heading3" style={styles.sectionTitle}>{t('home.explore')}</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(discover)/search')}
          style={({ pressed }) => [styles.search, pressed && styles.pressed]}
        >
          <AppText color={colors.text.secondary}>{t('home.searchPlaceholder')}</AppText>
          <AppText color={colors.primary[700]}>⌕</AppText>
        </Pressable>
      </View>

      <View style={styles.recommendations}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionHeadingText}>
            <AppText variant="overline" color={colors.primary[700]}>{t('home.todaySuggestions')}</AppText>
            <AppText variant="heading2">{t('home.forUser', { name: firstName })}</AppText>
          </View>
          <Pressable onPress={() => router.push('/(discover)/explore')}>
            <AppText variant="bodyStrong" color={colors.primary[700]}>{t('home.viewAll')}</AppText>
          </Pressable>
        </View>
        {home.isLoading ? <LoadingSpinner text={t('home.loadingSuggestions')} /> : null}
        {home.isError ? (
          <EmptyState
            title={t('home.suggestionError')}
            description={home.error.message}
            actionLabel={t('common.retry')}
            onAction={() => void home.refetch()}
          />
        ) : null}
        {!home.isLoading && !home.isError && recommendations.length === 0 ? (
          <EmptyState
            title={t('home.noSuggestions')}
            description={t('home.noSuggestionsDescription')}
            actionLabel={t('home.explore')}
            onAction={() => router.push('/(discover)/explore')}
          />
        ) : null}
        {recommendations.slice(0, 3).map((item) => (
          <ContentResultCard
            key={item._id}
            item={{ ...item, type: 'recipe' }}
            onPress={() => router.push({
              pathname: '/(discover)/recipe/[id]',
              params: { id: item.slug ?? item._id },
            })}
          />
        ))}
      </View>

      <View>
        <AppText variant="heading2" style={styles.sectionTitle}>{t('home.quickStart')}</AppText>
        <View style={styles.cards}>
          <QuickCard title={t('home.explore')} subtitle={t('home.newRecipes')} onPress={() => router.push('/(discover)/explore')} />
          <QuickCard title={t('nav.mealPlan')} subtitle={t('home.planMeals')} onPress={() => router.push('/(tabs)/meal-plan')} />
          <QuickCard title={t('nav.grocery')} subtitle={t('home.prepareList')} onPress={() => router.push('/(tabs)/grocery')} />
          <QuickCard title={t('home.yourProfile')} subtitle={t('home.profileSubtitle')} onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

function QuickCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <AppText variant="heading3">{title}</AppText>
      <AppText color={colors.text.secondary}>{subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing['3xl'] },
  hero: { gap: spacing.xs, paddingTop: spacing.md },
  sectionTitle: { marginBottom: spacing.md },
  search: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendations: { gap: spacing.md },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.md },
  sectionHeadingText: { flex: 1, gap: spacing.xs },
  cards: { gap: spacing.md },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.72 },
});
