/* eslint-disable @typescript-eslint/no-require-imports -- Expo loads this CommonJS config. */
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '..')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, '../node_modules')];
config.resolver.resolveRequest = (context, name, platform) => {
  if (name.startsWith('@/'))
    return context.resolveRequest(
      context,
      path.resolve(__dirname, '../src', name.slice(2)),
      platform
    );
  return context.resolveRequest(context, name, platform);
};
module.exports = config;
