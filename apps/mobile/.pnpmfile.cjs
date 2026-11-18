// react-native-css requiere esta versión de lightningcss para compilar estilos.
module.exports = {
  hooks: {
    readPackage(pkg) {
      for (const section of ['dependencies', 'optionalDependencies', 'devDependencies']) {
        if (pkg[section]?.lightningcss) pkg[section].lightningcss = '1.30.1';
      }
      return pkg;
    },
  },
};
