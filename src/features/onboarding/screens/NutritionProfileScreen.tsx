import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppInput } from '@/components';
import { spacing } from '@/theme';
import { activityOptions } from '../constants';
import { useOnboardingStore } from '../onboardingStore';
import { dateInputToIso, validateMeasurement } from '../validation';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { SelectionField } from '../components/SelectionField';

export function NutritionProfileScreen() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const next = () => {
    const nextErrors = {
      dateOfBirth: dateInputToIso(draft.dateOfBirth)
        ? null
        : 'Dùng định dạng DD/MM/YYYY và ngày không ở tương lai.',
      heightCm: validateMeasurement(draft.heightCm, 'Chiều cao', 50, 250),
      currentWeightKg: validateMeasurement(
        draft.currentWeightKg,
        'Cân nặng',
        10,
        500
      ),
      activityLevel: draft.activityLevel ? null : 'Vui lòng chọn mức vận động.',
    };
    setErrors(nextErrors);
    if (!Object.values(nextErrors).some(Boolean))
      router.push('/(onboarding)/allergies');
  };

  const update =
    (key: 'dateOfBirth' | 'heightCm' | 'currentWeightKg') => (value: string) => {
      setDraft({ [key]: value });
      setErrors((current) => ({ ...current, [key]: null }));
    };

  return (
    <OnboardingScreen
      title="Hồ sơ dinh dưỡng"
      subtitle="Thông tin dùng tính nhu cầu ước tính"
      step={2}
      onBack={() => router.back()}
      onPrimary={next}
    >
      <View style={styles.fields}>
        <AppInput
          label="Ngày sinh"
          placeholder="DD/MM/YYYY"
          value={draft.dateOfBirth}
          onChangeText={update('dateOfBirth')}
          keyboardType="numbers-and-punctuation"
          error={errors.dateOfBirth}
        />
        <AppInput
          label="Chiều cao (cm)"
          placeholder="170"
          value={draft.heightCm}
          onChangeText={update('heightCm')}
          keyboardType="decimal-pad"
          error={errors.heightCm}
        />
        <AppInput
          label="Cân nặng (kg)"
          placeholder="65"
          value={draft.currentWeightKg}
          onChangeText={update('currentWeightKg')}
          keyboardType="decimal-pad"
          error={errors.currentWeightKg}
        />
        <SelectionField
          label="Mức vận động"
          placeholder="Chọn mức vận động"
          value={draft.activityLevel}
          options={activityOptions}
          onChange={(activityLevel) => {
            setDraft({ activityLevel });
            setErrors((current) => ({ ...current, activityLevel: null }));
          }}
          error={errors.activityLevel}
        />
        <InfoCard
          title="Dữ liệu riêng tư"
          description="Thông tin sức khỏe không hiển thị công khai."
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing.lg } });
