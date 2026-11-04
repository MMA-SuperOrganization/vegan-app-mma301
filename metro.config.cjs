/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Gradle and Kotlin create transient sockets that Metro cannot lstat on Windows.
config.resolver.blockList = [
  /[/\\]android[/\\]\.gradle-tmp[/\\].*/,
  /[/\\]android[/\\]app[/\\]\.cxx[/\\].*/,
];

module.exports = config;
