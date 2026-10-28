module.exports = {
  dependencies: {
    // This package is JavaScript plus a font asset in Expo. Its Android library
    // registers an empty New Architecture codegen target with a very long name,
    // which can exceed Ninja's path limit on Windows. Expo loads the required
    // font dynamically, so Android native autolinking is unnecessary.
    '@react-native-vector-icons/material-design-icons': {
      platforms: { android: null },
    },
  },
};
