// src/hooks/useAuth.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import * as AuthApi from '../api/auth';
import { AuthResponse, EmployeeUser } from '../types';

type UseAuthState = {
  user: EmployeeUser | null;
  loading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    loading: false,
  });

  const register = async (params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyCode: string;
    employeeId?: string;
  }): Promise<AuthResponse | null> => {
    try {
      setState((s) => ({ ...s, loading: true }));

      const response = await AuthApi.register({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        companyCode: params.companyCode,
        employeeId: params.employeeId,
        rememberMe: true,
      });

      setState({ user: response.user, loading: false });
      return response;
    } catch (error: any) {
      console.log('[REGISTER_ERROR]', error?.response?.data || error.message);

      const msg =
        error?.response?.data?.error?.message ||
        'Registration failed. Please check your details and try again.';

      Alert.alert('Registration failed', msg);
      setState((s) => ({ ...s, loading: false }));
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse | null> => {
    try {
      setState((s) => ({ ...s, loading: true }));

      const response = await AuthApi.login({ email, password, rememberMe: true });

      setState({ user: response.user, loading: false });
      return response;
    } catch (error: any) {
      console.log('[LOGIN_ERROR]', error?.response?.data || error.message);

      const msg =
        error?.response?.data?.error?.message ||
        'Login failed. Please check your credentials and try again.';

      Alert.alert('Login failed', msg);
      setState((s) => ({ ...s, loading: false }));
      return null;
    }
  };

  const logout = async () => {
    await AuthApi.logout();
    setState({ user: null, loading: false });
  };

  return {
    user: state.user,
    loading: state.loading,
    register,
    login,
    logout,
  };
}
