// Expo app config
module.exports = {
	expo: {
		name: "Stock Soko",
		slug: "stock-soko",
		scheme: "stocksoko",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		splash: {
			image: "./assets/images/splash.png",
			resizeMode: "contain",
			backgroundColor: "#1a1a1a"
		},
		updates: { enabled: true },
		assetBundlePatterns: ["**/*"],
		ios: { 
			supportsTablet: true,
			bundleIdentifier: "com.stocksoko.app"
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#1a1a1a"
			},
			package: "com.stocksoko.app"
		},
		web: {
			favicon: "./assets/images/favicon.png"
		},
		extra: {
			apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.5:5000"
		}
	}
};
