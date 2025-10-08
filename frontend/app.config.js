// Expo app config
module.exports = {
	expo: {
		name: "Stock Soko",
		slug: "stock-soko",
		scheme: "stocksoko",
		version: "1.0.0",
		orientation: "portrait",
		updates: { enabled: true },
		assetBundlePatterns: ["**/*"],
		ios: { supportsTablet: true },
		android: { },
		web: { },
		extra: {
			apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080"
		}
	}
};
