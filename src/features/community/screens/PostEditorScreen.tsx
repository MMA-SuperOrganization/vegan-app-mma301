import { useEffect, useState } from 'react';
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

export function PostEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const actions = useCommunityPost(id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  useEffect(() => {
    if (actions.post.data) {
      setTitle(actions.post.data.title);
      setContent(actions.post.data.content);
    }
  }, [actions.post.data]);
  const editable =
    !id || ['draft', 'rejected'].includes(actions.post.data?.status || '');
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
            ? 'Chỉ sửa bản nháp hoặc bài bị từ chối.'
            : 'Only drafts and rejected posts can be edited.'}
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
      <FeatureState error={actions.save.error} />
      <AppButton
        title={vi ? 'Lưu bản nháp' : 'Save draft'}
        loading={actions.save.isPending}
        disabled={
          !editable || !title.trim() || !content.trim() || actions.save.isPending
        }
        onPress={() =>
          actions.save.mutate(
            {
              title: title.trim(),
              content: content.trim(),
              previous: actions.post.data,
            },
            {
              onSuccess: (post) =>
                router.replace({
                  pathname: '/community/post',
                  params: { id: post._id },
                }),
            }
          )
        }
      />
    </ScreenWrapper>
  );
}
