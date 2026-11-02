import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type KeyboardAvoidingViewProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';

import { colors, webLayout } from '@/theme';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  topInsetBackgroundColor?: string;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  keyboardBehavior?: KeyboardAvoidingViewProps['behavior'];
  keyboardVerticalOffset?: number;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  testID?: string;
  /** Optional desktop content cap. Native layouts are never affected. */
  webMaxWidth?: number;
}

/**
 * `style` targets the safe-area outer container. `contentContainerStyle`
 * targets the content View or the ScrollView content container.
 */
export function ScreenWrapper({
  children,
  header,
  topInsetBackgroundColor,
  scrollable = false,
  keyboardAvoiding = true,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  testID,
  webMaxWidth = webLayout.contentMaxWidth,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const resolvedTopInsetBackgroundColor =
    topInsetBackgroundColor ?? (header ? colors.background.surface : undefined);
  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        Platform.OS === 'web' && styles.webContent,
        Platform.OS === 'web' && { maxWidth: webMaxWidth },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      contentInsetAdjustmentBehavior="never"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        Platform.OS === 'web' && styles.webContent,
        Platform.OS === 'web' && { maxWidth: webMaxWidth },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.safeArea, style]}>
      {resolvedTopInsetBackgroundColor ? (
        <View
          pointerEvents="none"
          style={[
            styles.topInsetBackground,
            {
              height: insets.top,
              backgroundColor: resolvedTopInsetBackgroundColor,
            },
          ]}
        />
      ) : null}
      {header && Platform.OS === 'web' ? (
        <View
          style={[
            styles.headerFrame,
            styles.webHeaderFrame,
            { maxWidth: webMaxWidth },
          ]}
        >
          {header}
        </View>
      ) : (
        header
      )}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
    ...Platform.select({
      web: { backgroundColor: colors.background.muted },
      default: {},
    }),
  },
  topInsetBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  flex: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerFrame: {},
  webHeaderFrame: {
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  webContent: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.background.base,
  },
});
