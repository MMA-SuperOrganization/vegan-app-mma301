import React from 'react';
import { Pressable, View } from 'react-native';
import { capitalize, child, containerStyle, variantNode } from '@/theme';
import { DesignNode } from '../DesignNode';
import type { CardProps, CardKind } from './Card.types';
export function Card({
  children,
  variant = 'default',
  type,
  selected = false,
  state,
  title,
  subtitle,
  badge,
  thumbnail,
  style,
  onPress,
  testID,
  disabled = false,
  accessibilityLabel,
  preview = false,
}: CardProps) {
  const kind =
    type ??
    (['recipe', 'ingredient', 'nutrition', 'reminder'].includes(variant)
      ? (variant as CardKind)
      : 'recipe');
  const active = state === 'selected' || selected || variant === 'accent';
  const node = variantNode(
    'Card /',
    `Type=${capitalize(kind)}, State=${active ? 'Selected' : 'Default'}`
  );
  const contentNode = child(node, 'Content');
  const content = {
    Title: title ?? (preview ? (child(contentNode, 'Title').text ?? '') : ''),
    Subtitle:
      subtitle ?? (preview ? (child(contentNode, 'Subtitle').text ?? '') : ''),
    'Badge label':
      badge ?? child(child(contentNode, 'Badge'), 'Badge label').text ?? '',
  };
  const cardStyle = [
    children
      ? {
          ...node.style,
          flexDirection: 'column' as const,
          alignItems: 'stretch' as const,
        }
      : containerStyle(node, preview),
    style,
  ];
  const body =
    children ??
    node.children.map((n) => (
      <DesignNode
        key={n.id}
        node={n}
        content={content}
        fixed={preview}
        slots={thumbnail !== undefined ? { Thumbnail: thumbnail } : {}}
      />
    ));
  if (onPress)
    return (
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ selected: active, disabled }}
        aria-pressed={active}
        aria-disabled={disabled}
      >
        {body}
      </Pressable>
    );
  return (
    <View testID={testID} style={cardStyle} accessibilityLabel={accessibilityLabel}>
      {body}
    </View>
  );
}
