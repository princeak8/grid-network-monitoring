import axios from 'axios'
import { useAuthStore } from './store/auth'

const apiService = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

apiService.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiService