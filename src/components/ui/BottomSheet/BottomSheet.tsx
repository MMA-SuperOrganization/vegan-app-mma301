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
}

/** Shared modal sheet shell for pickers, forms and confirmations. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  tall = false,
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            style={[
              styles.sheetMotion,
              tall && styles.tall,
              { transform: [{ translateY }] },
            ]}
          >
            <SafeAreaView
              edges={['bottom']}
              style={[styles.sheet, tall && styles.fill]}
            >
              <Pressable style={styles.body}>
                <View style={styles.dragArea} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
                <AppText variant="heading3">{title}</AppText>
                {children}
                <Button title={t('common.close')} variant="ghost" onPress={onClose} />
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
  body: { flex: 1, gap: spacing.lg },
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
