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
    const mainApplication = modResults.manifest.application[0];

    if (!mainApplication.$) {
      mainApplication.$ = {};
    }
    
    // Add 'tools:replace="android:appComponentFactory"' to the <application> tag
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