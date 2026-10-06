import React, { useState } from 'react';
import { Image, View, type ImageSourcePropType, type ViewProps } from 'react-native';
import { coreTokens } from '@/theme';
import { AppText } from '../AppText';

export interface ThumbnailProps extends ViewProps {
  source?: ImageSourcePropType;
  kind?: 'recipe' | 'ingredient' | 'nutrition' | 'reminder';
  size?: number;
  radius?: number;
  fallback?: React.ReactNode;
  resizeMode?: 'cover' | 'contain';
  onImageError?: () => void;
}
function ThumbnailContent({
  source,
  kind = 'recipe',
  size,
  radius,
  fallback,
  resizeMode = 'cover',
  onImageError,
  style,
  accessibilityLabel,
  ...props
}: ThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const token = coreTokens.thumbnail[kind];
  return (
    <View
      {...props}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[
        token.node.style,
        coreTokens.media.clipping,
        { width: size ?? token.node.width, height: size ?? token.node.height },
        radius !== undefined && { borderRadius: radius },
        style,
      ]}
    >
      {source && !failed ? (
        <Image
          source={source}
          resizeMode={resizeMode}
          style={coreTokens.media.imageFill}
          accessible={false}
          onError={() => {
            setFailed(true);
            onImageError?.();
          }}
        />
      ) : (
        (fallback ?? (
          <AppText style={token.glyph.style} accessible={false}>
            {token.glyph.text}
          </AppText>
        ))
      )}
    </View>
  );
}
/** Reset failure when the caller changes image source; no network/API logic. */
export function Thumbnail(props: ThumbnailProps) {
  return <ThumbnailContent key={JSON.stringify(props.source)} {...props} />;
}
