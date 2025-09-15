// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'tflite' and 'txt' to the asset extensions
config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('txt');

module.exports = config;