import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useAuthStore } from '@/features/auth';
import { mediaApi } from '@/features/media/mediaApi';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { communityApi } from '../communityApi';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useRecipeCategories } from '@/features/recipes/hooks';

export function VideoEditorScreen() {
  const vi = useTranslation().locale === 'vi';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');
  const [tags, setTags] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [recipeId, setRecipeId] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(
    'public'
  );
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [thumbnail, setThumbnail] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadController = useRef<AbortController | null>(null);
  const categories = useRecipeCategories();
  const video = useQuery({
    queryKey: ['account', userId, 'video-author', id],
    queryFn: () => communityApi.video(id!),
    enabled: Boolean(userId && id),
  });
  useEffect(() => {
    if (!video.data) return;
    setTitle(video.data.title);
    setDescription(video.data.description || '');
    setTranscript(video.data.transcript || '');
    setTags((video.data.tags || []).join(', '));
    setCategoryId(video.data.categoryIds?.[0] ?? null);
    setDifficulty(video.data.difficulty || 'easy');
    setRecipeId(video.data.recipeId || '');
    setVisibility(video.data.visibility || 'public');
  }, [video.data]);
  const editable =
    !id || ['draft', 'rejected', 'published'].includes(video.data?.status || '');
  const save = useMutation({
    mutationFn: async () => {
      let mediaId = video.data?.videoMediaId;
      if (asset) {
        uploadController.current = new AbortController();
        setUploadProgress(0);
        mediaId = await mediaApi.uploadVideo(asset, {
          signal: uploadController.current.signal,
          onProgress: setUploadProgress,
        });
        uploadController.current = null;
      }
      if (!mediaId) throw new Error('VIDEO_REQUIRED');
      const thumbnailMediaId = thumbnail
        ? await mediaApi.uploadImage(thumbnail, 'video_thumbnail')
        : video.data?.thumbnailMediaId;
      const input = {
        title: title.trim(),
        description: description.trim(),
        transcript: transcript.trim() || undefined,
        videoMediaId: mediaId,
        durationSeconds: asset
          ? Math.max(1, Math.ceil((asset.duration || 1000) / 1000))
          : video.data?.durationSeconds || 1,
        thumbnailMediaId,
        categoryIds: categoryId ? [categoryId] : [],
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        difficulty,
        recipeId: recipeId.trim() || null,
        visibility,
      };
      const stored = video.data
        ? await communityApi.updateVideo(video.data, input)
        : await communityApi.createVideo(input);
      return communityApi.submitVideo(stored);
    },
    onSuccess: async (video) => {
      setUploadProgress(0);
      await client.invalidateQueries({
        queryKey: ['account', userId, 'community', 'videos'],
      });
      router.replace({ pathname: '/community/video', params: { id: video._id } });
    },
    onSettled: () => {
      uploadController.current = null;
    },
  });
  useEffect(
    () => () => {
      uploadController.current?.abort();
    },
    []
  );
  const chooseVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled) {
      setAsset(result.assets[0]);
      save.reset();
    }
  };
  const chooseThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setThumbnail(result.assets[0]);
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Đăng video' : 'Upload video'}
          showBack
          backFallbackHref="/community"
        />
      }
    >
      <AppButton
        title={
          asset ? asset.fileName || 'Video' : vi ? 'Chọn video' : 'Choose video'
        }
        variant="outline"
        disabled={!editable || save.isPending}
        onPress={() => void chooseVideo()}
      />
      {asset ? (
        <AppText>
          {vi ? 'Thời lượng' : 'Duration'}: {Math.ceil((asset.duration || 0) / 1000)}
          s
        </AppText>
      ) : null}
      {save.isPending && uploadProgress > 0 ? (
        <>
          <AppText>
            {vi ? 'Tiến trình tải lên' : 'Upload progress'}: {uploadProgress}%
          </AppText>
          <AppButton
            title={vi ? 'Hủy tải lên' : 'Cancel upload'}
            variant="ghost"
            onPress={() => uploadController.current?.abort()}
          />
        </>
      ) : null}
      {thumbnail?.uri || video.data?.thumbnailUrl ? (
        <Image
          source={{ uri: thumbnail?.uri || video.data?.thumbnailUrl }}
          style={{ width: '100%', height: 200, borderRadius: 12 }}
        />
      ) : null}
      <AppButton
        title={vi ? 'Chọn ảnh đại diện' : 'Choose thumbnail'}
        variant="outline"
        disabled={!editable || save.isPending}
        onPress={() => void chooseThumbnail()}
      />
      <AppInput
        label={vi ? 'Tiêu đề' : 'Title'}
        value={title}
        onChangeText={setTitle}
        editable={editable}
      />
      <AppInput
        label={vi ? 'Mô tả' : 'Description'}
        value={description}
        onChangeText={setDescription}
        multiline
        editable={editable}
      />
      <AppInput
        label={vi ? 'Bản chép lời (dùng cho AI)' : 'Transcript (used by AI)'}
        value={transcript}
        onChangeText={setTranscript}
        multiline
        editable={editable}
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
      <SelectionField
        label={vi ? 'Độ khó' : 'Difficulty'}
        placeholder=""
        value={difficulty}
        options={(['easy', 'medium', 'hard'] as const).map((value) => ({
          value,
          label: value,
        }))}
        onChange={setDifficulty}
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
        options={(['public', 'private', 'unlisted'] as const).map((value) => ({
          value,
          label: value,
        }))}
        onChange={setVisibility}
      />
      <FeatureState loading={video.isLoading} error={video.error || save.error} />
      <AppButton
        title={vi ? 'Tải lên và gửi duyệt' : 'Upload and submit'}
        loading={save.isPending}
        disabled={
          !editable ||
          (!asset && !video.data?.videoMediaId) ||
          !title.trim() ||
          save.isPending
        }
        onPress={() => save.mutate()}
      />
    </ScreenWrapper>
  );
}
