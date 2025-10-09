import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAccessToken, logout, setAccessToken } from '../store/auth';

// Determine the correct base URL based on platform
const getDefaultBaseURL = () => {
  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // For iOS and Android, use the local network IP
  // Make sure your computer and phone are on the same WiFi network
  return 'http://192.168.1.15:8000';
};

const baseURL = (Constants?.expoConfig?.extra as any)?.apiBaseUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  getDefaultBaseURL();

console.log(`[API Client] Platform: ${Platform.OS}, Using baseURL: ${baseURL}`);

export const api = axios.create({
	baseURL,
	timeout: 10000, // 10 second timeout
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	async (config) => {
		const token = getAccessToken();
		if (token) {
			(config.headers as any) = { ...config.headers, Authorization: `Bearer ${token}` };
		}
		return config;
	},
	(error) => {
		console.error('Request interceptor error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor for handling auth errors and token refresh
api.interceptors.response.use(
	(response: AxiosResponse) => {
		// Handle successful responses
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as any;
		const requestUrl = originalRequest?.url || '';

		// Handle 401 unauthorized errors (token expired)
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			// Only logout if this was an auth request (login/register)
			// For other requests, just let the error propagate
			if (requestUrl.includes('/auth/')) {
				console.warn('[API] Authentication failed on auth endpoint');
			} else {
				console.log('[API] 401 on', requestUrl, '- User needs to login');
			}
		}

		// Handle network errors
		if (!error.response) {
			console.error('[API] Network error:', error.message, 'on', requestUrl);
		}

		// Handle server errors
		if (error.response?.status >= 500) {
			console.error('[API] Server error:', error.response.status, error.response.data);
		}

		return Promise.reject(error);
	}
);

// API response types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: Record<string, string[]>;
}

// API error types
export interface ApiError {
	message: string;
	code?: string;
	details?: any;
}
