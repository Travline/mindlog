// Conserva los componentes estilizados de NativeWind y expone las APIs nuevas
// de React Native que la versión instalada de react-native-css aún no incluye.
const styledComponents = require('react-native-css/components');
const reactNative = require('react-native');

for (const key of Object.keys(reactNative)) {
  if (!(key in styledComponents)) {
    Object.defineProperty(styledComponents, key, {
      enumerable: true,
      get: () => reactNative[key],
    });
  }
}

module.exports = styledComponents;
