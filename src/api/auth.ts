// src/api/auth.ts
import { api, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';

// Helpers to persist tokens
async function persistTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/employee/auth/register', {
    ...payload,
    rememberMe: payload.rememberMe ?? false,
  });

  const { accessToken, refreshToken } = res.data;
  await persistTokens(accessToken, refreshToken);

  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/employee/auth/login', {
    ...payload,
    rememberMe: payload.rememberMe ?? false,
  });

  const { accessToken, refreshToken } = res.data;
  await persistTokens(accessToken, refreshToken);

  return res.data;
}

export async function refreshAccessToken(): Promise<AuthResponse | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const res = await api.post<{
    accessToken: string;
    refreshToken: string;
  }>('/api/employee/auth/refresh', { refreshToken });

  const { accessToken, refreshToken: newRefresh } = res.data;
  await persistTokens(accessToken, newRefresh);

  // NOTE: refresh route does not return user; you can optionally refetch /employee/me here later.
  return null;
}

export async function logout(): Promise<void> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  if (refreshToken) {
    try {
      await api.post('/api/employee/auth/logout', { refreshToken });
    } catch (e) {
      console.log('[LOGOUT_ERROR]', e);
    }
  }

  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
