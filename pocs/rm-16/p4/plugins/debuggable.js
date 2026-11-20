// So na PoC: marca o build release como depuravel para o adb `run-as` conseguir tirar o arquivo do banco.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (c) => {
    c.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    const app = c.modResults.manifest.application[0].$;
    app['android:debuggable'] = 'true';
    app['tools:ignore'] = 'HardcodedDebugMode'; // senao o lintVitalRelease reprova o release
    return c;
  });
