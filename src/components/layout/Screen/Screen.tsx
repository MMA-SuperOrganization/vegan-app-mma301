import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './Screen.styles';
import type { ScreenProps } from './Screen.types';

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  testID,
}) => {
  return (
    <SafeAreaView
      testID={testID}
      edges={edges}
      style={[
        styles.container,
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};
