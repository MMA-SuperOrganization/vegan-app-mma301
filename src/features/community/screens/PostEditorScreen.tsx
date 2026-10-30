import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost } from '../hooks';
import { mediaApi } from '@/features/media/mediaApi';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import {
  useContentCategories,
  useExploreRecipes,
  useRecipeDetail,
} from '@/features/recipes/hooks';
import { normalizeLinkedRecipeId } from '../postRelationship';

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
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const categories = useContentCategories('post');
  const recipes = useExploreRecipes({ limit: 50, sort: 'newest' });
  const selectedRecipe = useRecipeDetail(recipeId);
  const recipeOptions = [
    {
      value: '',
      label: vi ? 'Không liên kết công thức' : 'No linked recipe',
    },
    ...(recipes.data?.pages.flatMap((page) =>
      page.data.map((recipe) => ({
        value: recipe._id,
        label: recipe.title ?? (vi ? 'Công thức chưa đặt tên' : 'Untitled recipe'),
      }))
    ) ?? []),
  ];
  if (
    recipeId &&
    selectedRecipe.data &&
    !recipeOptions.some((option) => option.value === recipeId)
  ) {
    recipeOptions.splice(1, 0, {
      value: recipeId,
      label:
        selectedRecipe.data.title ??
        (vi ? 'Công thức chưa đặt tên' : 'Untitled recipe'),
    });
  }
  const upload = useMutation({
    mutationFn: () => mediaApi.uploadImage(image!, 'post'),
  });
  useEffect(() => {
    if (actions.post.data) {
      setTitle(actions.post.data.title);
      setContent(actions.post.data.content);
      setCategoryId(actions.post.data.categoryIds?.[0] ?? null);
      setTags((actions.post.data.tags || []).join(', '));
      setRecipeId(actions.post.data.recipeId || '');
      setVisibility(actions.post.data.visibility || 'public');
    }
  }, [actions.post.data]);
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
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      upload.reset();
    }
  };
  const save = async () => {
    try {
      const uploadedId = image ? await upload.mutateAsync() : undefined;
      const post = await actions.save.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        mediaIds: uploadedId ? [uploadedId] : actions.post.data?.mediaIds || [],
        categoryIds: categoryId ? [categoryId] : [],
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        recipeId: normalizeLinkedRecipeId(recipeId),
        visibility,
        previous: actions.post.data,
      });
      router.replace({
        pathname: '/community/post',
        params: { id: post._id },
      });
    } catch {
      // Mutation errors are rendered with the form.
    }
  };
  const busy = actions.save.isPending || upload.isPending;
  return (
    <ScreenWrapper
      scrollable
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
            ? 'Viết ngắn gọn, dễ đọc. Bạn có thể gắn một công thức, nhưng bài viết và công thức luôn là hai nội dung riêng.'
            : 'Keep it clear and easy to read. You may link a recipe, but posts and recipes always remain separate.'}
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
              {vi ? 'Công thức liên quan' : 'Related recipe'}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {vi
                ? 'Không bắt buộc. Post chỉ tham chiếu, không biến Recipe thành Post.'
                : 'Optional. The post references a recipe without turning it into a post.'}
            </AppText>
          </View>
        </View>
        <SelectionField
          label={vi ? 'Chọn công thức' : 'Choose a recipe'}
          placeholder={
            recipes.isLoading
              ? vi
                ? 'Đang tải công thức…'
                : 'Loading recipes…'
              : vi
                ? 'Không liên kết công thức'
                : 'No linked recipe'
          }
          value={recipeId}
          options={recipeOptions}
          onChange={setRecipeId}
        />
        <FeatureState
          error={recipes.error || (recipeId ? selectedRecipe.error : null)}
          retry={() =>
            void (recipes.error ? recipes.refetch() : selectedRecipe.refetch())
          }
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
        {image ? <Image source={{ uri: image.uri }} style={styles.preview} /> : null}
        <AppButton
          title={
            image
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
          disabled={!editable || !title.trim() || !content.trim() || busy}
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
  submitArea: { gap: spacing.md },
});
