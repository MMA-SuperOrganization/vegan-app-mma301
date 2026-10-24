/// <reference types="node" />
import { existsSync } from 'node:fs';
import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'vegan-app-mma302',
  slug: config.slug ?? 'vegan-app-mma302',
  plugins: [...(config.plugins ?? []), 'expo-video'],
  android: {
    ...config.android,
    ...(existsSync('./google-services.json')
      ? { googleServicesFile: './google-services.json' }
      : {}),
  },
});
