import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Fills most of the screen height, for scrollable lists. */
  tall?: boolean;
  /** Optional action area next to the title, useful for sheet-specific controls. */
  headerAction?: ReactNode;
  /** Forms keep the shared close action; immersive panels can provide one in the header. */
  showFooterClose?: boolean;
  /** Allows content-heavy panels to opt into a taller viewport without changing all sheets. */
  height?: ViewStyle['height'];
}

/** Shared modal sheet shell for pickers, forms and confirmations. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  tall = false,
  headerAction,
  showFooterClose = true,
  height,
}: BottomSheetProps) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 90 || gesture.vy > 0.8) {
            Animated.timing(translateY, {
              toValue: 700,
              duration: 180,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (!finished) return;
              onClose();
              translateY.setValue(0);
            });
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            speed: 24,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [onClose, translateY]
  );

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [translateY, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            style={[
              styles.sheetMotion,
              tall && styles.tall,
              height !== undefined && { height },
              { transform: [{ translateY }] },
            ]}
          >
            <SafeAreaView
              edges={['bottom']}
              style={[styles.sheet, tall && styles.fill]}
            >
              <Pressable style={[styles.body, tall && styles.fill]}>
                <View style={styles.dragArea} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
                <View style={styles.header}>
                  <AppText variant="heading3" style={styles.title}>
                    {title}
                  </AppText>
                  {headerAction}
                </View>
                {children}
                {showFooterClose ? (
                  <Button
                    title={t('common.close')}
                    variant="ghost"
                    onPress={onClose}
                  />
                ) : null}
              </Pressable>
            </SafeAreaView>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay.modal,
  },
  sheetMotion: { width: '100%' },
  sheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  tall: { height: '85%' },
  fill: { flex: 1 },
  // Only a tall sheet has a fixed height to fill; `flex: 1` in an auto-height
  // sheet collapses the body to zero height on native (web is unaffected).
  body: { gap: spacing.lg },
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flex: 1 },
  dragArea: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border.strong,
  },
});
