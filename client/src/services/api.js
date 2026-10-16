import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 20000,
});

// CSRF token on mutating requests
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const match = document.cookie.match(/(?:^|; )shramsetu_csrf=([^;]+)/);
    if (match) config.headers['X-CSRF-Token'] = match[1];
  }
  return config;
});

// Auto-refresh on 401
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('/auth/')
    ) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh', {});
        await refreshing;
        refreshing = null;
        return api(original);
      } catch {
        refreshing = null;
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

export default api;