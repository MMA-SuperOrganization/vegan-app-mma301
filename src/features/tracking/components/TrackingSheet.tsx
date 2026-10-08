import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export interface TrackingSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Fills most of the screen height, for scrollable lists. */
  tall?: boolean;
}

/** Bottom sheet shell shared by the tracking pickers and confirmations. */
export function TrackingSheet({
  visible,
  title,
  onClose,
  children,
  tall = false,
}: TrackingSheetProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, tall && styles.tall]}>
          <Pressable style={styles.body}>
            <AppText variant="heading3">{title}</AppText>
            {children}
            <AppButton title={t('common.close')} variant="ghost" onPress={onClose} />
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay.modal,
  },
  sheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  tall: { height: '85%' },
  body: { flex: 1, gap: spacing.lg },
});
