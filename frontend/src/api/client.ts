import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, logout, setAccessToken } from '../store/auth';

// Use local network IP for mobile devices, localhost for web
const baseURL = (Constants?.expoConfig?.extra as any)?.apiBaseUrl || 
  (typeof window !== 'undefined' ? 'http://localhost:8000' : 'http://192.168.10.25:8000');

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

		// Handle 401 unauthorized errors (token expired)
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh token or logout user
				await logout();
				// Redirect to login or show auth error
				console.warn('Authentication failed - user logged out');
			} catch (logoutError) {
				console.error('Error during logout:', logoutError);
			}
		}

		// Handle network errors
		if (!error.response) {
			console.error('Network error:', error.message);
			// Could show offline indicator here
		}

		// Handle server errors
		if (error.response?.status >= 500) {
			console.error('Server error:', error.response.status, error.response.data);
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
