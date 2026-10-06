import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  Toggle,
} from '@/components';
import { colors, spacing } from '@/theme';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';

export function AllergiesScreen() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.draft);
  const allergens = useOnboardingStore((state) => state.allergens);
  const isLoading = useOnboardingStore((state) => state.isLoadingAllergens);
  const error = useOnboardingStore((state) => state.error);
  const loadAllergens = useOnboardingStore((state) => state.loadAllergens);
  const toggleAllergen = useOnboardingStore((state) => state.toggleAllergen);
  const selectNoAllergens = useOnboardingStore((state) => state.selectNoAllergens);
  const clearError = useOnboardingStore((state) => state.clearError);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    void loadAllergens();
  }, [loadAllergens]);

  const next = () => {
    if (!draft.allergyAnswered) {
      setValidationError(
        'Vui lòng chọn dị nguyên hoặc xác nhận không có dị nguyên.'
      );
      return;
    }
    router.push('/(onboarding)/permissions');
  };

  return (
    <OnboardingScreen
      title="Dị nguyên cần tránh"
      subtitle="Chọn nhiều mục nếu cần"
      step={3}
      onBack={() => router.back()}
      onPrimary={next}
      primaryLabel="Lưu và tiếp tục"
      error={validationError}
    >
      <View style={styles.list}>
        {isLoading ? <LoadingSpinner text="Đang tải dị nguyên…" /> : null}
        {!isLoading && allergens.length
          ? allergens.map((allergen) => (
              <Toggle
                key={allergen._id}
                label={allergen.name}
                value={draft.allergenIds.includes(allergen._id)}
                onValueChange={() => {
                  toggleAllergen(allergen._id);
                  setValidationError(null);
                }}
              />
            ))
          : null}
        {!isLoading && !allergens.length && !error ? (
          <EmptyState
            title="Chưa có danh mục dị nguyên"
            description="Backend hiện chưa có master data dị nguyên. Bạn có thể xác nhận không có dị nguyên để tiếp tục."
          />
        ) : null}
        {error ? (
          <View style={styles.retry}>
            <AppText
              variant="bodySmall"
              color={colors.status.danger}
              style={styles.center}
            >
              {error}
            </AppText>
            <AppButton
              title="Thử tải lại"
              variant="secondary"
              onPress={() => {
                clearError();
                void loadAllergens();
              }}
            />
          </View>
        ) : null}
        <InfoCard
          title="Không có dị nguyên"
          description="Không chọn mục nào nếu bạn không có dị nguyên cần tránh. Lựa chọn này không dùng đồng thời với các dị nguyên."
        />
        <AppButton
          title={
            draft.allergyAnswered && !draft.allergenIds.length
              ? '✓ Không có dị nguyên'
              : 'Tôi không có dị nguyên'
          }
          variant="secondary"
          onPress={() => {
            selectNoAllergens();
            setValidationError(null);
          }}
        />
        <AppButton
          title="Tìm hiểu thông tin dị nguyên"
          variant="ghost"
          onPress={() =>
            Alert.alert(
              'Thông tin dị nguyên',
              'Danh sách được tải từ dữ liệu chuẩn của VEGETA. Nếu có phản ứng nghiêm trọng, hãy tham khảo chuyên gia y tế.'
            )
          }
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg },
  retry: { gap: spacing.md },
  center: { textAlign: 'center' },
});
