import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { Button } from '../Button';
import {
  appDialog,
  type AppDialogButton,
  type AppDialogRequest,
} from './appDialog';

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [request, setRequest] = useState<AppDialogRequest | null>(null);

  useEffect(() => appDialog.subscribe(setRequest), []);

  const buttons = request?.buttons.length
    ? request.buttons
    : [{ text: t('common.understood') }];
  const primary =
    [...buttons].reverse().find((button) => button.style !== 'cancel') ?? buttons[0];
  const secondary = buttons.filter((button) => button !== primary);
  const destructive = primary?.style === 'destructive';
  const iconName = destructive
    ? 'trash'
    : request?.buttons.length
      ? 'check'
      : 'lightbulb';
  const dismiss = (button?: AppDialogButton) => {
    if (request) appDialog.dismiss(request.id, button);
  };
  const cancel = buttons.find((button) => button.style === 'cancel');
  const dismissFromBackdrop = () => {
    if (request?.options.cancelable === false) return;
    dismiss(cancel);
  };

  return (
    <>
      {children}
      <Modal
        visible={Boolean(request)}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={dismissFromBackdrop}
      >
        <SafeAreaView style={styles.backdrop} edges={['top', 'bottom']}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            style={StyleSheet.absoluteFill}
            onPress={dismissFromBackdrop}
          />
          {request ? (
            <View style={styles.card} accessibilityRole="alert">
              <View
                style={[
                  styles.iconBubble,
                  destructive && styles.destructiveIconBubble,
                ]}
              >
                <AppIcon
                  name={iconName}
                  size={28}
                  color={
                    destructive ? colors.status.danger : colors.primary[700]
                  }
                  decorative
                />
              </View>
              <View style={styles.copy}>
                <AppText variant="heading3" style={styles.centerText}>
                  {request.title}
                </AppText>
                {request.message ? (
                  <AppText
                    color={colors.text.secondary}
                    style={styles.centerText}
                  >
                    {request.message}
                  </AppText>
                ) : null}
              </View>
              <View style={styles.actions}>
                <Button
                  title={primary.text}
                  variant={destructive ? 'danger' : 'primary'}
                  onPress={() => dismiss(primary)}
                />
                {secondary.map((button, index) => (
                  <Button
                    key={`${button.text}:${index}`}
                    title={button.text}
                    variant={
                      button.style === 'destructive' ? 'danger' : 'ghost'
                    }
                    onPress={() => dismiss(button)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.overlay.modal,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.xl,
    gap: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    ...shadows.modal,
  },
  iconBubble: {
    width: 56,
    height: 56,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  destructiveIconBubble: { backgroundColor: colors.accent.soft },
  copy: { alignItems: 'center', gap: spacing.sm },
  centerText: { textAlign: 'center' },
  actions: { gap: spacing.sm },
});
