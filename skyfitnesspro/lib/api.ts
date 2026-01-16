import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',  // Ваш API base (из доков GitHub)
});

// Interceptor для token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;