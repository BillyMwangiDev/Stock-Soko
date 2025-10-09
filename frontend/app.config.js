// Expo app config
module.exports = {
	expo: {
		name: "Stock Soko",
		slug: "stock-soko",
		scheme: "stocksoko",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/logo.png",
		splash: {
			image: "./assets/images/splash.png",
			resizeMode: "contain",
			backgroundColor: "#0D1117"
		},
		updates: { enabled: true },
		assetBundlePatterns: ["**/*"],
		ios: { 
			supportsTablet: true,
			bundleIdentifier: "com.stocksoko.app"
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/logo.png",
				backgroundColor: "#0D1117"
			},
			package: "com.stocksoko.app"
		},
		web: {
			favicon: "./assets/images/logo.png"
		},
		extra: {
			apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.15:8000"
		}
	}
};
