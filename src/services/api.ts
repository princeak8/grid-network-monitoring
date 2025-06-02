// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export default api;

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore();
      const piniaToken = authStore.token;
      if (piniaToken) {
        config.headers!['Authorization'] = `Bearer ${piniaToken}`;
        return config;
      }
    } catch (err) {
      console.log(err)
    }

    const localToken = Cookies.get('power-grid-auth-token');
    if (localToken) {
      config.headers!['Authorization'] = `Bearer ${localToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
