const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('node:path');

const config = withNativewind(getDefaultConfig(__dirname));
const nativewindResolver = config.resolver.resolveRequest;
const compatibilityModule = path.resolve(__dirname, 'react-native-compat.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // El adaptador necesita acceder al React Native original, sin volver a pasar
  // por la sustitución de componentes que aplica NativeWind.
  if (context.originModulePath === compatibilityModule && moduleName === 'react-native') {
    return context.resolveRequest(context, moduleName, platform);
  }

  const resolution = nativewindResolver(context, moduleName, platform);
  if (platform !== 'web' && moduleName === 'react-native' && resolution.type === 'sourceFile' &&
      /[\\/]react-native-css[\\/]dist[\\/].*[\\/]components[\\/]index\.cjs$/.test(resolution.filePath)) {
    return { type: 'sourceFile', filePath: compatibilityModule };
  }
  return resolution;
};

module.exports = config;
