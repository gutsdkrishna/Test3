const { getDefaultConfig } = require('expo/metro-config');

// Get the default config
const defaultConfig = getDefaultConfig(__dirname);

// Add custom resolver settings
defaultConfig.resolver.sourceExts = [
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'd.ts',
];

// Add watcher settings to ensure changes are picked up
defaultConfig.watchFolders = [
  ...defaultConfig.watchFolders || [],
  `${__dirname}/components`,
  `${__dirname}/screens`,
  `${__dirname}/services`
];

// Export the configuration
module.exports = defaultConfig;
