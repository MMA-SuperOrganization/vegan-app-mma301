import type { ComponentType } from 'react';

export default function VideoDetailRoute() {
  // Lazy-require so Expo Router's route scan does not evaluate native ExpoVideo at startup.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { VideoDetailScreen } = require('@/features/community/screens/VideoDetailScreen') as {
    VideoDetailScreen: ComponentType;
  };
  return <VideoDetailScreen />;
}
