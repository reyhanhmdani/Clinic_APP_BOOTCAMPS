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
  // btw untuk set item token user nya ada di login ya
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

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export const registerService = async (input: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse; message: string }>('auth/register', input);
  const authData = response.data.data;
  if (!authData) {
    throw new Error('Format respons server tidak valid');
  }
  return authData;
};
