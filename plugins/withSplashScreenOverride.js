// plugins/withSplashScreenOverride.js

const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withSplashScreenOverride(config) {
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

    // Add the resolutionStrategy block at the end of the file
    modResults.contents = contents + resolutionStrategy;
    
    return config;
  });
};
