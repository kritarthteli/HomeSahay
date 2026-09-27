module.exports = () => {
  const role = process.env.APP_ROLE || process.env.EXPO_PUBLIC_APP_ROLE || 'customer';

  // Base configuration shared across all variants
  const baseConfig = {
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0F172A"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0F172A"
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0F172A"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  };

  // Variant-specific overrides
  if (role === 'worker') {
    return {
      ...baseConfig,
      name: "HomeSahay Partner",
      slug: "homesahay-worker",
      scheme: "homesahay-worker",
      ios: { ...baseConfig.ios, bundleIdentifier: "com.homesahay.worker" },
      android: { ...baseConfig.android, package: "com.homesahay.worker" },
    };
  }

  if (role === 'admin') {
    return {
      ...baseConfig,
      name: "HomeSahay Admin",
      slug: "homesahay-admin",
      scheme: "homesahay-admin",
      ios: { ...baseConfig.ios, bundleIdentifier: "com.homesahay.admin" },
      android: { ...baseConfig.android, package: "com.homesahay.admin" },
    };
  }

  // Default to Customer variant
  return {
    ...baseConfig,
    name: "HomeSahay",
    slug: "homesahay-customer",
    scheme: "homesahay",
    ios: { ...baseConfig.ios, bundleIdentifier: "com.homesahay.app" },
    android: { ...baseConfig.android, package: "com.homesahay.app" },
  };
};
