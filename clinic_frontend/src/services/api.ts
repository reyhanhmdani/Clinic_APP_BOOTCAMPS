import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

//

api.interceptors.request.use(
  (config) => {
    // 1. Ambil token dari localStorage
    const token = localStorage.getItem('token');
    // 2. Jika token ada, tempelkan ke Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
