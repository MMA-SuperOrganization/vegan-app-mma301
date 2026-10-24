import { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { useCommunityPost } from '../hooks';
import { mediaApi } from '@/features/media/mediaApi';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useContentCategories } from '@/features/recipes/hooks';

export function PostEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const actions = useCommunityPost(id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const categories = useContentCategories('post');
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
    ['draft', 'rejected', 'published'].includes(actions.post.data?.status || '');
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
      actions.save.mutate(
        {
          title: title.trim(),
          content: content.trim(),
          mediaIds: uploadedId ? [uploadedId] : actions.post.data?.mediaIds || [],
          categoryIds: categoryId ? [categoryId] : [],
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          recipeId: recipeId.trim() || null,
          visibility,
          previous: actions.post.data,
        },
        {
          onSuccess: (post) =>
            router.replace({
              pathname: '/community/post',
              params: { id: post._id },
            }),
        }
      );
    } catch {
      // Upload errors are rendered with the form.
    }
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
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
        <AppText>
          {vi
            ? 'Bài đang chờ duyệt nên tạm thời không thể sửa.'
            : 'Posts under review cannot be edited.'}
        </AppText>
      ) : null}
      <AppInput
        label={vi ? 'Tiêu đề' : 'Title'}
        value={title}
        onChangeText={setTitle}
        maxLength={200}
        editable={editable && !actions.save.isPending}
      />
      <AppInput
        label={vi ? 'Nội dung' : 'Content'}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={30000}
        editable={editable && !actions.save.isPending}
      />
      <SelectionField
        label={vi ? 'Danh mục' : 'Category'}
        placeholder={vi ? 'Chọn danh mục' : 'Choose category'}
        value={categoryId}
        options={(categories.data?.data || []).map((item) => ({
          value: item._id,
          label: item.name,
        }))}
        onChange={setCategoryId}
      />
      <AppInput
        label={vi ? 'Thẻ (phân cách bằng dấu phẩy)' : 'Tags (comma separated)'}
        value={tags}
        onChangeText={setTags}
        editable={editable}
      />
      <AppInput
        label={
          vi
            ? 'ID công thức liên kết (không bắt buộc)'
            : 'Linked recipe ID (optional)'
        }
        value={recipeId}
        onChangeText={setRecipeId}
        autoCapitalize="none"
        editable={editable}
      />
      <SelectionField
        label={vi ? 'Quyền xem' : 'Visibility'}
        placeholder=""
        value={visibility}
        options={
          [
            { value: 'public', label: vi ? 'Công khai' : 'Public' },
            { value: 'private', label: vi ? 'Riêng tư' : 'Private' },
          ] as const
        }
        onChange={setVisibility}
      />
      {image ? <Image source={{ uri: image.uri }} style={styles.preview} /> : null}
      <AppButton
        title={vi ? 'Chọn ảnh minh họa' : 'Choose image'}
        variant="outline"
        disabled={!editable || actions.save.isPending || upload.isPending}
        onPress={() => void chooseImage()}
      />
      <FeatureState error={upload.error || actions.save.error} />
      <AppButton
        title={vi ? 'Lưu bản nháp' : 'Save draft'}
        loading={actions.save.isPending || upload.isPending}
        disabled={
          !editable ||
          !title.trim() ||
          !content.trim() ||
          actions.save.isPending ||
          upload.isPending
        }
        onPress={() => void save()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', height: 220, borderRadius: 12 },
});
