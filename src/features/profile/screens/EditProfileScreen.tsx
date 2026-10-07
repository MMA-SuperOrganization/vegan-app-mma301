import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, ScreenWrapper } from '@/components';
import { parseDecimal, validateMeasurement } from '@/features/onboarding/validation';
import { colors, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function EditProfileScreen() {
  const router = useRouter();
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.update);
  const isSaving = useProfileStore((state) => state.isSaving);
  const storeError = useProfileStore((state) => state.error);
  const [name, setName] = useState(data?.user.name ?? '');
  const [height, setHeight] = useState(data?.nutritionProfile?.heightCm?.toString() ?? '');
  const [weight, setWeight] = useState(data?.nutritionProfile?.currentWeightKg?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const save = async () => {
    const next = {
      name: name.trim() ? null : 'Vui lòng nhập tên hiển thị.',
      height: validateMeasurement(height, 'Chiều cao', 50, 250),
      weight: validateMeasurement(weight, 'Cân nặng', 10, 500),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const heightCm = parseDecimal(height);
    const currentWeightKg = parseDecimal(weight);
    if (heightCm === null || currentWeightKg === null) return;
    if (await update({ displayName: name, heightCm, currentWeightKg })) router.back();
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppButton title="‹ Quay lại" variant="ghost" fullWidth={false} onPress={() => router.back()} />
        <AppText variant="heading1">Chỉnh sửa hồ sơ</AppText>
        <AppText color={colors.text.secondary}>Thông tin được lưu trực tiếp vào tài khoản của bạn.</AppText>
      </View>
      <View style={styles.fields}>
        <AppInput label="Tên hiển thị" value={name} onChangeText={setName} error={errors.name} />
        <AppInput label="Chiều cao (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" error={errors.height} />
        <AppInput label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={errors.weight} />
        {storeError ? <AppText color={colors.status.danger}>{storeError}</AppText> : null}
      </View>
      <AppButton title="Lưu thay đổi" loading={isSaving} onPress={() => void save()} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, gap: spacing['3xl'], justifyContent: 'space-between' },
  header: { gap: spacing.sm },
  fields: { gap: spacing.xl },
});
