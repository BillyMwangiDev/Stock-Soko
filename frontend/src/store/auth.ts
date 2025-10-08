import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@stock_soko_access_token';
const REFRESH_TOKEN_KEY = '@stock_soko_refresh_token';

export interface AuthTokens {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number;
}

export interface UserProfile {
	email: string;
	name?: string;
	phone?: string;
	kycStatus?: 'pending' | 'verified' | 'rejected';
	subscriptionTier?: 'free' | 'pro' | 'premium';
}

let currentTokens: AuthTokens | null = null;
let currentUser: UserProfile | null = null;

/**
 * Get stored tokens from AsyncStorage
 */
export async function loadStoredTokens(): Promise<AuthTokens | null> {
	try {
		const [accessToken, refreshToken] = await Promise.all([
			AsyncStorage.getItem(TOKEN_KEY),
			AsyncStorage.getItem(REFRESH_TOKEN_KEY),
		]);

		if (accessToken) {
			currentTokens = { accessToken, refreshToken: refreshToken || undefined };
			return currentTokens;
		}
	} catch (error) {
		console.warn('Error loading stored tokens:', error);
	}

	return null;
}

/**
 * Store tokens in memory and AsyncStorage
 */
export async function setAccessToken(token: string | null): Promise<void> {
	if (token) {
		try {
			await AsyncStorage.setItem(TOKEN_KEY, token);
			currentTokens = { accessToken: token };
		} catch (error) {
			console.warn('Error storing access token:', error);
		}
	} else {
		try {
			await AsyncStorage.removeItem(TOKEN_KEY);
			await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
		} catch (error) {
			console.warn('Error removing tokens:', error);
		}
		currentTokens = null;
		currentUser = null;
	}
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
	return currentTokens?.accessToken || null;
}

/**
 * Store refresh token
 */
export async function setRefreshToken(refreshToken: string | null): Promise<void> {
	try {
		if (refreshToken) {
			await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
			if (currentTokens) {
				currentTokens.refreshToken = refreshToken;
			}
		} else {
			await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
			if (currentTokens) {
				currentTokens.refreshToken = undefined;
			}
		}
	} catch (error) {
		console.warn('Error storing refresh token:', error);
	}
}

/**
 * Get current user profile
 */
export function getCurrentUser(): UserProfile | null {
	return currentUser;
}

/**
 * Set current user profile
 */
export function setCurrentUser(user: UserProfile | null): void {
	currentUser = user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	return currentTokens?.accessToken != null;
}

/**
 * Clear all auth data (logout)
 */
export async function logout(): Promise<void> {
	try {
		await Promise.all([
			AsyncStorage.removeItem(TOKEN_KEY),
			AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
		]);
	} catch (error) {
		console.warn('Error during logout:', error);
	}

	currentTokens = null;
	currentUser = null;
}

/**
 * Initialize auth state on app start
 */
export async function initializeAuth(): Promise<void> {
	const tokens = await loadStoredTokens();
	if (tokens && tokens.accessToken) {
		currentTokens = tokens;
	}
}
