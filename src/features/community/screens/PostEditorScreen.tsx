import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import { useCommunityPost } from '../hooks';
import { communityApi } from '../communityApi';
import type { CommunityPost } from '../types';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useContentCategories } from '@/features/recipes/hooks';
import {
  hasPostFoodRelationship,
  normalizeLinkedRecipeId,
  parsePostTags,
} from '../postRelationship';
import { PostFoodRelationshipFields } from '../components/PostFoodRelationshipFields';
import { usePostImageUpload } from '../usePostImageUpload';

function editablePostSnapshot(post: CommunityPost) {
  return JSON.stringify({
    title: post.title,
    content: post.content,
    mediaIds: post.mediaIds ?? [],
    categoryIds: post.categoryIds ?? [],
    tags: post.tags ?? [],
    foodItemIds: post.foodItemIds ?? [],
    recipeId: post.recipeId ?? null,
    visibility: post.visibility ?? 'public',
  });
}

export function PostEditorScreen() {
  const { id, recipeId: routeRecipeId } = useLocalSearchParams<{
    id?: string;
    recipeId?: string;
  }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const actions = useCommunityPost(id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [recipeId, setRecipeId] = useState(routeRecipeId ?? '');
  const [foodItemIds, setFoodItemIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [existingMediaIds, setExistingMediaIds] = useState<string[]>([]);
  const [editorVersion, setEditorVersion] = useState<number | null>(null);
  const hydratedPostId = useRef<string | null>(null);
  const hydratedPostSnapshot = useRef<string | null>(null);
  const submitting = useRef(false);
  const { image, upload, selectImage, clearImage, ensureUploaded } =
    usePostImageUpload();
  const categories = useContentCategories('post');
  useEffect(() => {
    if (
      actions.post.data &&
      !actions.post.isFetching &&
      !actions.post.isError &&
      hydratedPostId.current !== actions.post.data._id
    ) {
      hydratedPostId.current = actions.post.data._id;
      setTitle(actions.post.data.title);
      setContent(actions.post.data.content);
      setCategoryId(actions.post.data.categoryIds?.[0] ?? null);
      setTags((actions.post.data.tags || []).join(', '));
      setRecipeId(actions.post.data.recipeId || '');
      setFoodItemIds(actions.post.data.foodItemIds ?? []);
      setVisibility(actions.post.data.visibility || 'public');
      setExistingMediaIds(actions.post.data.mediaIds ?? []);
      setEditorVersion(actions.post.data.version);
      hydratedPostSnapshot.current = editablePostSnapshot(actions.post.data);
    }
  }, [actions.post.data, actions.post.isError, actions.post.isFetching]);
  const editable =
    !id ||
    ['draft', 'rejected', 'published', 'archived'].includes(
      actions.post.data?.status || ''
    );
  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) {
      setExistingMediaIds([]);
      selectImage(result.assets[0]);
    }
  };
  const save = async () => {
    if (
      submitting.current ||
      !title.trim() ||
      !content.trim() ||
      !hasPostFoodRelationship(recipeId, foodItemIds)
    )
      return;
    submitting.current = true;
    try {
      const uploadedId = await ensureUploaded();
      const persist = (version: number | null) =>
        actions.save.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          mediaIds: uploadedId ? [uploadedId] : existingMediaIds,
          categoryIds: categoryId ? [categoryId] : [],
          tags: parsePostTags(tags),
          recipeId: normalizeLinkedRecipeId(recipeId),
          foodItemIds,
          visibility,
          previous: id && version !== null ? { _id: id, version } : undefined,
        });

      let post: CommunityPost;
      try {
        post = await persist(editorVersion);
      } catch (error) {
        const code = (error as { code?: unknown })?.code;
        if (id && code === 'VERSION_CONFLICT') {
          const latest = await communityApi.post(id);
          const contentIsUnchanged =
            hydratedPostSnapshot.current === editablePostSnapshot(latest);
          if (!contentIsUnchanged) {
            void actions.post.refetch();
            throw error;
          }

          setEditorVersion(latest.version);
          hydratedPostSnapshot.current = editablePostSnapshot(latest);
          post = await persist(latest.version);
        } else {
          throw error;
        }
      }
      if (id) {
        router.replace('/(tabs)');
      } else {
        router.replace({
          pathname: '/community/post',
          params: { id: post._id },
        });
      }
    } catch {
      // Mutation errors are rendered with the form.
    } finally {
      submitting.current = false;
    }
  };
  const busy = actions.save.isPending || upload.isPending;
  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.formMaxWidth}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={vi ? 'Soạn bài viết' : 'Post editor'}
          showBack
          backFallbackHref="/community"
        />
      }
    >
      {id ? (
        <FeatureState
          loading={actions.post.isLoading}
          error={actions.post.error}
          retry={() => void actions.post.refetch()}
        />
      ) : null}
      {!editable && actions.post.data ? (
        <Surface tone="muted" padding="lg" radius="lg">
          <AppText color={colors.status.warning}>
            {vi
              ? 'Bài đang chờ duyệt nên tạm thời không thể sửa.'
              : 'Posts under review cannot be edited.'}
          </AppText>
        </Surface>
      ) : null}

      <Surface tone="selected" padding="xl" radius="xl" style={styles.intro}>
        <AppText variant="heading2">
          {vi ? 'Chia sẻ điều hữu ích' : 'Share something useful'}
        </AppText>
        <AppText color={colors.text.secondary}>
          {vi
            ? 'Viết ngắn gọn, dễ đọc và gắn ít nhất một nguyên liệu hoặc công thức liên quan.'
            : 'Keep it clear and link at least one related ingredient or recipe.'}
        </AppText>
      </Surface>

      <Surface bordered padding="lg" radius="xl" style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.stepBadge}>
            <AppText variant="caption" color={colors.text.inverse}>
              1
            </AppText>
          </View>
          <View style={styles.sectionCopy}>
            <AppText variant="heading3">
              {vi ? 'Nội dung bài viết' : 'Post content'}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {vi
                ? 'Tiêu đề rõ ý và nội dung có xuống dòng.'
                : 'Use a clear title and readable paragraphs.'}
            </AppText>
          </View>
        </View>
        <AppInput
          label={vi ? 'Tiêu đề' : 'Title'}
          helper={`${title.length}/200`}
          placeholder={
            vi
              ? 'Ví dụ: 3 mẹo giúp đậu hũ giòn lâu'
              : 'Example: 3 tips for crisp tofu'
          }
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          editable={editable && !actions.save.isPending}
        />
        <AppInput
          label={vi ? 'Nội dung' : 'Content'}
          helper={`${content.length}/30000`}
          placeholder={
            vi
              ? 'Chia sẻ câu chuyện, mẹo hoặc trải nghiệm của bạn…'
              : 'Share your story, tip, or experience…'
          }
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          inputStyle={styles.contentInput}
          maxLength={30000}
          editable={editable && !actions.save.isPending}
        />
        <SelectionField
          label={vi ? 'Danh mục' : 'Category'}
          placeholder={vi ? 'Chọn danh mục phù hợp' : 'Choose a category'}
          value={categoryId}
          options={(categories.data?.data || []).map((item) => ({
            value: item._id,
            label: item.name,
          }))}
          onChange={setCategoryId}
        />
        <AppInput
          label={vi ? 'Thẻ tìm kiếm' : 'Search tags'}
          helper={
            vi
              ? 'Phân cách bằng dấu phẩy, tối đa 3–5 thẻ.'
              : 'Separate with commas; 3–5 tags work best.'
          }
          placeholder={
            vi ? 'đậu hũ, mẹo bếp, ăn xanh' : 'tofu, kitchen tips, plant-based'
          }
          value={tags}
          onChangeText={setTags}
          editable={editable}
        />
      </Surface>

      <Surface bordered padding="lg" radius="xl" style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.stepBadge}>
            <AppText variant="caption" color={colors.text.inverse}>
              2
            </AppText>
          </View>
          <View style={styles.sectionCopy}>
            <AppText variant="heading3">
              {vi ? 'Liên kết món ăn' : 'Food relationship'}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {vi
                ? 'Bắt buộc chọn ít nhất một nguyên liệu hoặc một công thức.'
                : 'Choose at least one ingredient or one recipe.'}
            </AppText>
          </View>
        </View>
        <PostFoodRelationshipFields
          recipeId={recipeId}
          foodItemIds={foodItemIds}
          disabled={!editable || busy}
          showValidation
          onRecipeChange={setRecipeId}
          onFoodItemsChange={setFoodItemIds}
        />
      </Surface>

      <Surface bordered padding="lg" radius="xl" style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.stepBadge}>
            <AppText variant="caption" color={colors.text.inverse}>
              3
            </AppText>
          </View>
          <View style={styles.sectionCopy}>
            <AppText variant="heading3">
              {vi ? 'Ảnh và hiển thị' : 'Image and visibility'}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {vi
                ? 'Ảnh ngang, sáng rõ sẽ giúp bài dễ đọc hơn.'
                : 'A clear landscape image makes the post easier to scan.'}
            </AppText>
          </View>
        </View>
        {image ||
        (existingMediaIds.length > 0 && actions.media.data?.[0]?.downloadUrl) ? (
          <View style={styles.previewWrap}>
            <Image
              source={{
                uri: image?.uri ?? actions.media.data?.[0]?.downloadUrl,
              }}
              style={styles.preview}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vi ? 'Gỡ ảnh minh họa' : 'Remove image'}
              onPress={() => {
                clearImage();
                setExistingMediaIds([]);
              }}
              disabled={busy}
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
        <AppButton
          title={
            image || existingMediaIds.length
              ? vi
                ? 'Đổi ảnh minh họa'
                : 'Change image'
              : vi
                ? 'Thêm ảnh minh họa'
                : 'Add image'
          }
          variant="outline"
          disabled={!editable || actions.save.isPending || upload.isPending}
          onPress={() => void chooseImage()}
        />
        <SelectionField
          label={vi ? 'Quyền xem' : 'Visibility'}
          placeholder=""
          value={visibility}
          options={
            [
              {
                value: 'public',
                label: vi ? 'Công khai ngay' : 'Publish immediately',
              },
              { value: 'private', label: vi ? 'Riêng tư' : 'Private' },
            ] as const
          }
          onChange={setVisibility}
        />
      </Surface>

      <FeatureState error={upload.error || actions.save.error} />
      <Surface tone="muted" padding="lg" radius="xl" style={styles.submitArea}>
        <AppText variant="bodyStrong">
          {vi ? 'Sẵn sàng chia sẻ?' : 'Ready to share?'}
        </AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {vi
            ? 'Bài viết công khai sẽ xuất hiện ngay trên bảng tin cộng đồng.'
            : 'Public posts appear on the community feed immediately.'}
        </AppText>
        <AppButton
          title={
            id
              ? vi
                ? 'Lưu thay đổi'
                : 'Save changes'
              : vi
                ? 'Đăng bài'
                : 'Publish post'
          }
          loading={busy}
          disabled={
            !editable ||
            !title.trim() ||
            !content.trim() ||
            !hasPostFoodRelationship(recipeId, foodItemIds) ||
            busy
          }
          onPress={() => void save()}
        />
      </Surface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  intro: { gap: spacing.sm },
  section: { gap: spacing.lg },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sectionCopy: { flex: 1, gap: spacing.xs },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
  },
  contentInput: { minHeight: 180, paddingTop: spacing.md },
  preview: { width: '100%', height: 220, borderRadius: radius.lg },
  previewWrap: { position: 'relative' },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay.modal,
  },
  submitArea: { gap: spacing.md },
});
