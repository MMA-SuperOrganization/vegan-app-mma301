import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AppButton, AppIcon, AppInput, AppText, BottomSheet } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useContentCategories } from '@/features/recipes/hooks';
import { useTranslation } from '@/i18n';
import { categoryFilterLabel } from '@/features/recipes/filterLabels';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost } from '../hooks';
import { PostFoodRelationshipFields } from './PostFoodRelationshipFields';
import { hasPostFoodRelationship } from '../postRelationship';
import { usePostImageUpload } from '../usePostImageUpload';

type Visibility = 'public' | 'private';

export function CreatePostSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useTranslation();
  const actions = useCommunityPost();
  const categories = useContentCategories('post');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [recipeId, setRecipeId] = useState('');
  const [foodItemIds, setFoodItemIds] = useState<string[]>([]);
  const submitting = useRef(false);
  const { image, upload, selectImage, clearImage, ensureUploaded } =
    usePostImageUpload();

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) {
      selectImage(result.assets[0]);
    }
  };

  const reset = () => {
    setContent('');
    setCategoryId(null);
    setVisibility('public');
    setRecipeId('');
    setFoodItemIds([]);
    clearImage();
    actions.save.reset();
  };

  const publish = async () => {
    const normalizedContent = content.trim();
    if (
      submitting.current ||
      !normalizedContent ||
      !hasPostFoodRelationship(recipeId, foodItemIds)
    )
      return;

    submitting.current = true;
    try {
      const mediaId = await ensureUploaded();
      const firstLine = normalizedContent.split(/\r?\n/)[0].trim();
      await actions.save.mutateAsync({
        title: firstLine.slice(0, 200),
        content: normalizedContent,
        mediaIds: mediaId ? [mediaId] : [],
        categoryIds: categoryId ? [categoryId] : [],
        recipeId: recipeId || null,
        foodItemIds,
        visibility,
      });
      reset();
      onClose();
    } catch {
      // The shared error state below keeps the composer open for retrying.
    } finally {
      submitting.current = false;
    }
  };

  const busy = actions.save.isPending || upload.isPending;
  const canPublish =
    Boolean(content.trim()) &&
    hasPostFoodRelationship(recipeId, foodItemIds) &&
    !busy;

  return (
    <BottomSheet
      visible={visible}
      title={t('postComposer.title')}
      onClose={onClose}
      tall
      height="92%"
      showFooterClose={false}
      headerAction={
        <AppButton
          title={t('postComposer.publish')}
          fullWidth={false}
          loading={busy}
          disabled={!canPublish}
          onPress={() => void publish()}
          style={styles.publishButton}
        />
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppInput
          value={content}
          onChangeText={setContent}
          placeholder={t('postComposer.contentPlaceholder')}
          multiline
          autoFocus
          autoCapitalize="sentences"
          autoCorrect
          maxLength={30000}
          editable={!busy}
          inputStyle={styles.contentInput}
          style={styles.contentField}
          accessibilityLabel={t('postComposer.contentLabel')}
        />

        {image ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: image.uri }} style={styles.preview} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('postComposer.removeImage')}
              onPress={clearImage}
              style={styles.removeImage}
            >
              <AppIcon
                name="close"
                size={18}
                color={colors.text.inverse}
                decorative
              />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void chooseImage()}
            disabled={busy}
            style={styles.toolButton}
          >
            <AppIcon name="image" size={22} color={colors.primary[700]} decorative />
            <AppText variant="bodyStrong" color={colors.primary[700]}>
              {image ? t('postComposer.changeImage') : t('postComposer.addImage')}
            </AppText>
          </Pressable>
          <AppText variant="caption" color={colors.text.secondary}>
            {content.length}/30000
          </AppText>
        </View>

        <PostFoodRelationshipFields
          recipeId={recipeId}
          foodItemIds={foodItemIds}
          disabled={busy}
          showValidation={Boolean(content.trim())}
          onRecipeChange={setRecipeId}
          onFoodItemsChange={setFoodItemIds}
        />

        {(categories.data?.data.length ?? 0) > 0 ? (
          <View style={styles.optionGroup}>
            <AppText variant="bodyStrong">{t('postComposer.category')}</AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <OptionChip
                label={t('postComposer.noCategory')}
                selected={!categoryId}
                onPress={() => setCategoryId(null)}
              />
              {categories.data?.data.map((category) => (
                <OptionChip
                  key={category._id}
                  label={categoryFilterLabel(category, locale)}
                  selected={categoryId === category._id}
                  onPress={() => setCategoryId(category._id)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.optionGroup}>
          <AppText variant="bodyStrong">{t('postComposer.visibility')}</AppText>
          <View style={styles.chips}>
            <OptionChip
              label={t('postComposer.public')}
              selected={visibility === 'public'}
              onPress={() => setVisibility('public')}
            />
            <OptionChip
              label={t('postComposer.private')}
              selected={visibility === 'private'}
              onPress={() => setVisibility('private')}
            />
          </View>
          <AppText variant="caption" color={colors.text.secondary}>
            {visibility === 'public'
              ? t('postComposer.publicHint')
              : t('postComposer.privateHint')}
          </AppText>
        </View>

        <FeatureState error={upload.error || actions.save.error} />
      </ScrollView>
    </BottomSheet>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {selected ? (
        <AppIcon name="check" size={16} color={colors.primary[700]} decorative />
      ) : null}
      <AppText
        variant={selected ? 'bodyStrong' : 'bodyDefault'}
        color={selected ? colors.primary[700] : colors.text.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  publishButton: { minHeight: 40, paddingHorizontal: spacing.lg },
  scroll: { flex: 1 },
  content: { gap: spacing.xl, paddingBottom: spacing['3xl'] },
  contentField: { gap: 0 },
  contentInput: {
    minHeight: 150,
    paddingTop: spacing.md,
    fontSize: 18,
    lineHeight: 27,
    textAlignVertical: 'top',
  },
  previewWrap: { position: 'relative' },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.background.muted,
  },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay.modal,
  },
  toolbar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  toolButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  optionGroup: { gap: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  chipSelected: {
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
});
