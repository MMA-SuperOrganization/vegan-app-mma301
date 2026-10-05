import React from 'react';
import { Text, View } from 'react-native';
import type { DesignNode as Node } from '@/theme/designTypes';
import { interactionTokens } from '@/theme';
/** Shared renderer for master children; data and slots come from the caller. */
export function DesignNode({
  node,
  content = {},
  slots = {},
  fixed = false,
  fixedChildren = fixed,
}: {
  node: Node;
  content?: Record<string, string>;
  slots?: Record<string, React.ReactNode>;
  fixed?: boolean;
  fixedChildren?: boolean;
}) {
  if (Object.prototype.hasOwnProperty.call(slots, node.name))
    return <>{slots[node.name]}</>;
  if (node.type === 'TEXT')
    return (
      <Text
        style={[
          node.style,
          fixed
            ? { width: node.width, height: node.height, flexShrink: 0 }
            : interactionTokens.flexibleText,
        ]}
      >
        {content[node.name] ?? node.text}
      </Text>
    );
  const rigid = ['Thumbnail', 'Track', 'Knob', 'Badge'].includes(node.name);
  return (
    <View
      style={[
        node.style,
        rigid && { width: node.width, height: node.height, flexShrink: 0 },
        !fixed && node.name === 'Content' && { flex: 1, minWidth: 0 },
        fixed && { width: node.width, height: node.height, flexShrink: 0 },
        !fixed && node.name === 'Metric row' && { flexWrap: 'wrap' },
      ]}
    >
      {node.children.map((c) => (
        <DesignNode
          key={c.id}
          node={c}
          content={content}
          slots={slots}
          fixed={fixedChildren}
        />
      ))}
    </View>
  );
}
