// plugins/withSplashScreenOverride.js

const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

// Fix for the splash screen dependency
function withSplashScreenGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const { modResults } = config;
    const { contents } = modResults;

    const resolutionStrategy = `
      allprojects {
        configurations.all {
          resolutionStrategy {
            force 'androidx.core:core-splashscreen:1.0.1'
          }
        }
      }
    `;

    modResults.contents = contents + resolutionStrategy;
    
    return config;
  });
}

// Fix for the manifest merger conflict
function withManifestTools(config) {
  return withAndroidManifest(config, (config) => {
    const { modResults } = config;
    const { manifest } = modResults;

    // 1. Ensure the tools namespace is declared on the <manifest> tag
    if (!manifest.$) {
      manifest.$ = {};
    }
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // 2. Add the 'tools:replace' attribute to the <application> tag
    const mainApplication = manifest.application[0];
    if (!mainApplication.$) {
      mainApplication.$ = {};
    }
    mainApplication.$['tools:replace'] = 'android:appComponentFactory';

    return config;
  });
}

// Chain the plugins together
module.exports = (config) => {
  config = withSplashScreenGradle(config);
  config = withManifestTools(config);
  return config;
};