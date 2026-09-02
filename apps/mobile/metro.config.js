const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('path'); // <-- Importar 'path'

const projectRoot = __dirname; // <-- Definir 'projectRoot'
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Observa cambios en todo el monorepo (incluyendo packages/types)
config.watchFolders = [workspaceRoot];

// 2. Permite resolver node_modules desde el proyecto y la raíz del monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Integra NativeWind (Asegúrate de cambiar './global.css' por la ruta de tu CSS)
module.exports = withNativewind(config, {
  input: './global.css',
  inlineRem: 16,
});