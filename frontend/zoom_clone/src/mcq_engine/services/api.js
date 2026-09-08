import axios from 'axios';
import toast from 'react-hot-toast';

// MCQ backend runs on a separate port (5000) from the main backend (8000).
// Set VITE_MCQ_API_URL in your .env to point to the MCQ server.
const serverUrl = import.meta.env.VITE_MCQ_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${serverUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ─── Request interceptor: attach JWT ───
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('dms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle errors globally ───
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn('API connection unavailable:', error?.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || 'Something went wrong';

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('dms_token');
        toast.error('Session expired. Please log in again.', { id: 'session-expired' });
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        break;

      case 403:
        toast.error('Access denied. You do not have permission.', { id: 'access-denied' });
        break;

      case 500:
        toast.error('Server error. Please try again later.', { id: 'server-error' });
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default API;
