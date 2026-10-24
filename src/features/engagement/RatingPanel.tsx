import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText, Surface } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { engagementApi, type EngagementTarget } from './engagementApi';

export function RatingPanel({
  targetType,
  targetId,
}: {
  targetType: EngagementTarget;
  targetId: string;
}) {
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = ['rating', targetType, targetId, userId];
  const summary = useQuery({
    queryKey: key,
    queryFn: () => engagementApi.rating(targetType, targetId),
  });
  const [score, setScore] = useState(5);
  const [review, setReview] = useState('');
  useEffect(() => {
    if (summary.data?.myRating) {
      setScore(summary.data.myRating.score);
      setReview(summary.data.myRating.review || '');
    }
  }, [summary.data?.myRating]);
  const save = useMutation({
    mutationFn: () => engagementApi.rate(targetType, targetId, score, review),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: () => engagementApi.removeRating(targetType, targetId),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return (
    <Surface bordered padding="lg" radius="lg" style={{ gap: spacing.md }}>
      <AppText variant="heading4">{vi ? 'Đánh giá' : 'Rating'}</AppText>
      {summary.data ? (
        <AppText>
          {summary.data.average.toFixed(1)} ★ · {summary.data.count}{' '}
          {vi ? 'lượt đánh giá' : 'ratings'}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <AppButton
            key={value}
            title={`${value} ★`}
            fullWidth={false}
            variant={score === value ? 'primary' : 'outline'}
            onPress={() => setScore(value)}
          />
        ))}
      </View>
      <AppInput
        label={vi ? 'Nhận xét (không bắt buộc)' : 'Review (optional)'}
        value={review}
        onChangeText={setReview}
        multiline
      />
      <FeatureState
        loading={summary.isLoading}
        error={summary.error || save.error || remove.error}
      />
      <AppButton
        title={vi ? 'Lưu đánh giá' : 'Save rating'}
        loading={save.isPending}
        disabled={save.isPending || remove.isPending}
        onPress={() => save.mutate()}
      />
      {summary.data?.myRating ? (
        <AppButton
          title={vi ? 'Xóa đánh giá' : 'Remove rating'}
          variant="ghost"
          disabled={save.isPending || remove.isPending}
          onPress={() => remove.mutate()}
        />
      ) : null}
    </Surface>
  );
}
