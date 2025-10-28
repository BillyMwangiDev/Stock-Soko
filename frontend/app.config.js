// Expo app config
module.exports = {
	expo: {
		name: "Stock Soko",
		slug: "stock-soko",
		scheme: "stocksoko",
		version: "1.0.0",
		orientation: "portrait",
		userInterfaceStyle: "dark",
		icon: "./assets/images/logo.png",
	splash: {
		image: "./assets/images/splash.png",
		resizeMode: "cover",
		backgroundColor: "#FF8C42"
	},
		updates: { enabled: true },
		assetBundlePatterns: ["**/*"],
	androidStatusBar: {
		backgroundColor: "#FF8C42",
		barStyle: "light-content"
	},
		androidNavigationBar: {
			backgroundColor: "#161B22",
			barStyle: "light-content"
		},
		ios: { 
			supportsTablet: true,
			bundleIdentifier: "com.stocksoko.app",
			infoPlist: {
				NSAppTransportSecurity: {
					NSAllowsArbitraryLoads: true,
					NSAllowsLocalNetworking: true
				}
			}
		},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/images/logo.png",
			backgroundColor: "#1A3A2E"
		},
		package: "com.stocksoko.app"
	},
		web: {
			favicon: "./assets/images/logo.png"
		},
	extra: {
		apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"
	},
	// Performance optimizations
	plugins: [],
	experiments: {
		tsconfigPaths: true
	}
	}
};