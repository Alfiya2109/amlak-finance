import axios from 'axios';

// Dynamically use current hostname so mobile phones connect to host IP backend seamlessly
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const API = axios.create({
  baseURL: `http://${hostname}:5000`,
});

// Interceptor to add JWT Authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
