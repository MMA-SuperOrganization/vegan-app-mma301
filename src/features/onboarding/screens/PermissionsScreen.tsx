import { useRouter } from 'expo-router';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components';
import { appConfig } from '@/config';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import {
  permissionLabel,
  useDevicePermissions,
} from '../hooks/useDevicePermissions';

export function PermissionsScreen() {
  const router = useRouter();
  const goBack = useSafeBack('/(onboarding)/allergies');
  const { t } = useTranslation();
  const complete = useOnboardingStore((state) => state.complete);
  const isSaving = useOnboardingStore((state) => state.isSaving);
  const error = useOnboardingStore((state) => state.error);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const { camera, notifications, requestCamera, requestNotifications } =
    useDevicePermissions();

  const finish = async () => {
    if (await complete()) router.replace('/(tabs)');
  };

  const safelyRequest = async (request: () => Promise<unknown>) => {
    try {
      await request();
    } catch {
      Alert.alert(
        t('onboarding.permissionRequestError'),
        t('onboarding.permissionUnsupported')
      );
    }
  };

  return (
    <OnboardingScreen
      title={t('onboarding.permissionsTitle')}
      subtitle={t('onboarding.permissionsSubtitle')}
      step={4}
      onBack={goBack}
      onPrimary={finish}
      primaryLabel={t('onboarding.complete')}
      loading={isSaving}
      error={error}
    >
      <View style={styles.actions}>
        <AppButton
          title={permissionLabel(t('onboarding.cameraPermission'), camera)}
          variant="secondary"
          onPress={() => void safelyRequest(requestCamera)}
        />
        <AppButton
          title={permissionLabel(t('onboarding.notificationPermission'), notifications)}
          variant="secondary"
          disabled={notifications === 'unsupported'}
          onPress={() => void safelyRequest(requestNotifications)}
        />
        <AppButton
          title={
            draft.aiProfileConsent
              ? t('onboarding.aiAllowed')
              : t('onboarding.aiAllow')
          }
          variant="secondary"
          onPress={() => setDraft({ aiProfileConsent: !draft.aiProfileConsent })}
        />
        <InfoCard
          title={t('onboarding.canSkip')}
          description={t('onboarding.canSkipDescription')}
        />
        <AppButton
          title={t('onboarding.dataPolicy')}
          variant="secondary"
          onPress={() =>
            appConfig.privacyPolicyUrl
              ? Linking.openURL(appConfig.privacyPolicyUrl)
              : Alert.alert(
                  t('onboarding.urlMissing'),
                  t('onboarding.urlMissingDescription')
                )
          }
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ actions: { gap: spacing.lg } });
