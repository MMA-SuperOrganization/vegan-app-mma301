// Expo loads this config plugin synchronously as CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withGradleProperties } = require('expo/config-plugins');

// Keep the Windows Kotlin cache-lock workaround when Expo regenerates Android.
module.exports = function withAndroidBuildStability(config) {
  return withGradleProperties(config, (config) => {
    const properties = {
      'org.gradle.jvmargs': '-Xmx2048m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8',
      'org.gradle.parallel': 'false',
      'org.gradle.workers.max': '2',
      'kotlin.compiler.execution.strategy': 'in-process',
      'kotlin.incremental': 'false',
    };
    for (const [key, value] of Object.entries(properties)) {
      const existing = config.modResults.find(
        (entry) => entry.type === 'property' && entry.key === key
      );
      if (existing) existing.value = value;
      else config.modResults.push({ type: 'property', key, value });
    }
    return config;
  });
};
