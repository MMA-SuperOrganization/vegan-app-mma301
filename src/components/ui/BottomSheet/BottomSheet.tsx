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
import { colors, radius, spacing, webLayout } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';

export interface BottomSheetProps {
  visible: boolean;
  title?: string;
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
  /** Reduces outer spacing for dense, keyboard-driven panels. */
  compact?: boolean;
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
  compact = false,
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
      statusBarTranslucent
      navigationBarTranslucent
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[styles.backdrop, Platform.OS === 'web' && styles.webBackdrop]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.sheetMotion,
              tall && styles.tall,
              height !== undefined && { height },
              Platform.OS === 'web' && styles.webSheetMotion,
              { transform: [{ translateY }] },
            ]}
          >
            <SafeAreaView
              edges={['bottom']}
              style={[
                styles.sheet,
                compact && styles.sheetCompact,
                tall && styles.fill,
                Platform.OS === 'web' && styles.webSheet,
              ]}
            >
              <View
                style={[
                  styles.body,
                  !title && !headerAction && styles.headerlessBody,
                  tall && styles.fill,
                ]}
              >
                <View style={styles.dragArea} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
                {title || headerAction ? (
                  <View style={styles.header}>
                    {title ? (
                      <AppText variant="heading3" style={styles.title}>
                        {title}
                      </AppText>
                    ) : null}
                    {headerAction}
                  </View>
                ) : null}
                {children}
                {showFooterClose ? (
                  <Button
                    title={t('common.close')}
                    variant="ghost"
                    onPress={onClose}
                  />
                ) : null}
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
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
  sheetMotion: {
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sheetCompact: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  tall: { height: '85%' },
  fill: { flex: 1 },
  // Only a tall sheet has a fixed height to fill; `flex: 1` in an auto-height
  // sheet collapses the body to zero height on native (web is unaffected).
  body: { gap: spacing.lg },
  headerlessBody: { gap: spacing.sm },
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
  webBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: webLayout.pageGutter,
  },
  webSheetMotion: {
    width: '100%',
    maxWidth: webLayout.dialogMaxWidth,
    maxHeight: '92%',
    borderRadius: radius.xl,
  },
  webSheet: {
    borderRadius: radius.xl,
  },
});
