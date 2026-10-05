import React from 'react';
import { Pressable, View } from 'react-native';
import { styles } from './Card.styles';
import type { CardProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  testID,
}) => {
  const cardStyle = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.9 }]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={cardStyle}>
      {children}
    </View>
  );
};
