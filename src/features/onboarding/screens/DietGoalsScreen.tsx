import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { spacing } from '@/theme';
import { dietOptions, goalOptions } from '../constants';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { SelectionField } from '../components/SelectionField';

export function DietGoalsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const [errors, setErrors] = useState({
    diet: null as string | null,
    goal: null as string | null,
  });

  const next = () => {
    const nextErrors = {
      diet: draft.dietType ? null : 'Vui lòng chọn loại chế độ ăn.',
      goal: draft.goal ? null : 'Vui lòng chọn mục tiêu sức khỏe.',
    };
    setErrors(nextErrors);
    if (!nextErrors.diet && !nextErrors.goal)
      router.push('/(onboarding)/nutrition-profile');
  };

  return (
    <OnboardingScreen
      title="Chế độ ăn & mục tiêu"
      subtitle="Hai lựa chọn riêng để cá nhân hóa gợi ý"
      step={1}
      onBack={async () => {
        await logout();
        router.replace('/(auth)/welcome');
      }}
      onPrimary={next}
    >
      <View style={styles.fields}>
        <SelectionField
          label="Loại chế độ ăn"
          placeholder="Chọn chế độ ăn"
          value={draft.dietType}
          options={dietOptions}
          onChange={(dietType) => {
            setDraft({ dietType });
            setErrors((current) => ({ ...current, diet: null }));
          }}
          error={errors.diet}
        />
        <InfoCard
          title="Chế độ ăn"
          description="Chọn theo loại chế độ ăn được hệ thống hỗ trợ."
        />
        <SelectionField
          label="Mục tiêu sức khỏe"
          placeholder="Chọn mục tiêu"
          value={draft.goal}
          options={goalOptions}
          onChange={(goal) => {
            setDraft({ goal });
            setErrors((current) => ({ ...current, goal: null }));
          }}
          error={errors.goal}
        />
        <InfoCard
          title="Thông tin tham khảo"
          description="Gợi ý dinh dưỡng không thay thế tư vấn chuyên môn."
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing.xl } });
