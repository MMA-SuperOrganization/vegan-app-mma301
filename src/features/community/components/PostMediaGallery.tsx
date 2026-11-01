import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

interface PostMediaAsset {
  _id: string;
  downloadUrl?: string;
}

export function PostMediaGallery({
  assets,
  vi,
}: {
  assets: PostMediaAsset[];
  vi: boolean;
}) {
  const { width } = useWindowDimensions();
  const visibleAssets = assets.filter((asset) => Boolean(asset.downloadUrl));
  if (!visibleAssets.length) return null;
  const mediaWidth = Math.max(280, width - spacing.xl * 2);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={mediaWidth}
        accessibilityLabel="Post media"
      >
        {visibleAssets.map((asset) => (
          <Image
            key={asset._id}
            source={{ uri: asset.downloadUrl }}
            style={[styles.image, { width: mediaWidth }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {visibleAssets.length > 1 ? (
        <View style={styles.countBadge}>
          <AppText variant="caption" color={colors.text.inverse}>
            {visibleAssets.length} {vi ? 'ảnh' : 'photos'}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: radius.xl },
  image: { height: 280, backgroundColor: colors.background.muted },
  countBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.overlay.image,
  },
});
