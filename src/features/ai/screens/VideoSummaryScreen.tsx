import { useState } from 'react';
import { View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { mediaApi } from '@/features/media/mediaApi';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useVideoSummary } from '../hooks';

export function VideoSummaryScreen() {
  const vi = useTranslation().locale === 'vi';
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [transcript, setTranscript] = useState('');
  const summary = useVideoSummary();
  const upload = useMutation({ mutationFn: () => mediaApi.uploadVideo(asset!) });
  const choose = useMutation({
    mutationFn: async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
      });
      if (!result.canceled) {
        setAsset(result.assets[0]);
        upload.reset();
        summary.reset();
      }
    },
  });
  const busy = choose.isPending || upload.isPending || summary.isPending;
  const run = async () => {
    try {
      const mediaId = upload.data || (await upload.mutateAsync());
      await summary.mutateAsync({ mediaId, transcript: transcript.trim() });
    } catch {
      // Mutation errors are rendered below.
    }
  };
  return (
    <ScreenWrapper
      scrollable
      header={
        <CustomHeader
          title={vi ? 'Tóm tắt video bằng AI' : 'AI video summary'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
    >
      <AppText color={colors.text.secondary}>
        {vi
          ? 'Chọn video và dán bản lời thoại. AI chỉ dùng nội dung này để tạo tóm tắt, điểm chính và chương.'
          : 'Choose a video and paste its transcript. AI uses it to create a summary, key points, and chapters.'}
      </AppText>
      <AppButton
        title={
          asset
            ? asset.fileName || (vi ? 'Đã chọn video' : 'Video selected')
            : vi
              ? 'Chọn video'
              : 'Choose video'
        }
        variant="outline"
        disabled={busy}
        onPress={() => choose.mutate()}
      />
      <AppInput
        label={vi ? 'Bản lời thoại' : 'Transcript'}
        value={transcript}
        onChangeText={setTranscript}
        multiline
        maxLength={20000}
        editable={!busy}
      />
      <AppButton
        title={vi ? 'Tải lên và tóm tắt' : 'Upload and summarize'}
        disabled={!asset || !transcript.trim() || busy}
        loading={upload.isPending || summary.isPending}
        onPress={() => void run()}
      />
      <FeatureState error={choose.error || upload.error || summary.error} />
      {summary.data ? (
        <View style={{ gap: spacing.md }}>
          <AppText variant="heading2">{vi ? 'Tóm tắt' : 'Summary'}</AppText>
          <AppText selectable>{summary.data.summary}</AppText>
          <AppText variant="heading3">{vi ? 'Điểm chính' : 'Key points'}</AppText>
          {summary.data.keyPoints.map((point, index) => (
            <AppText key={`${index}-${point}`}>• {point}</AppText>
          ))}
          {summary.data.chapters?.length ? (
            <>
              <AppText variant="heading3">{vi ? 'Chương' : 'Chapters'}</AppText>
              {summary.data.chapters.map((chapter) => (
                <AppText key={`${chapter.startSeconds}-${chapter.title}`}>
                  {chapter.startSeconds}s–{chapter.endSeconds}s · {chapter.title}
                </AppText>
              ))}
            </>
          ) : null}
          <AppText color={colors.text.secondary}>{summary.data.disclaimer}</AppText>
        </View>
      ) : null}
    </ScreenWrapper>
  );
}
