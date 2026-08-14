import { api } from './api';

export interface loginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const loginService = async (input: loginInput): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse }>('/auth/login', input);
  const authData = response.data.data;

  if (authData.token) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
  return authData;
};

export const logoutService =  (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): AuthUser | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
