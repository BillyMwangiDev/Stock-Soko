import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, logout, setAccessToken } from '../store/auth';

// Use localhost for web, local network IP for mobile devices
const defaultBaseURL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'http://192.168.1.15:8000';

const baseURL = (Constants?.expoConfig?.extra as any)?.apiBaseUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  defaultBaseURL;

console.log('[API Client] Using baseURL:', baseURL);

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
