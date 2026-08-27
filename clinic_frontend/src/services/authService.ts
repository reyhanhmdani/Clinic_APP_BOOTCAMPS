import type { User } from '../types/clinic';
import { api } from './api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const loginService = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse }>('/auth/login', input);
  const authData = response.data.data;
  if (!authData) {
    throw new Error('Format respons server tidak valid');
  }

  if (authData.token) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
  return authData;
};

export const logoutService = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Refactor : try catch safeguard agar tidak crash jika localstorage korup
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Gagal parsing data user dari localStorage:', error);
    localStorage.removeItem('user'); // Clean up data korup
    return null;
  }
};
