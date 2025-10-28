const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Reset cache to fix bundler issues
config.resetCache = true;

// Optimize bundler for faster loading
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Improve resolver performance
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json'],
  assetExts: [...(config.resolver?.assetExts || []).filter(ext => ext !== 'svg'), 'svg'],
};

// Enable symlinks
config.watchFolders = [];

module.exports = config;

