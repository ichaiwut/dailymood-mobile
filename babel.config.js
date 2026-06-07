module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo handles expo-router and the reanimated/worklets
    // plugin automatically on SDK 56.
    presets: ['babel-preset-expo'],
  };
};
