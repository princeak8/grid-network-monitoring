import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import type { UserType } from '@/types'

interface AuthState {
  token: string | null,
  user: UserType | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('auth_token') || null,
    user: JSON.parse(localStorage.getItem('user') || '{}') || null // Provide a default empty object
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await axios.post('http://mo-iot-api.test/api/auth/login', {
          username,
          password,
        })
        console.log("response:", response?.data.data);
        this.token = response?.data?.data?.token;
        this.user = response?.data?.data?.user;
        if(this.token && this.user) { 
          localStorage.setItem('auth_token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          return {status: true};
        }else{
          console.error("token/user not found or null");
          return {status: false, message: "token/user not found or null"};
        }
      } catch (error) {
        console.error('Login failed:', error)
        return {status: false, message: ((error as AxiosError).response?.data as { error?: string })?.error || 'Login Failed'};
      }
    },
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('auth_token', token);
    },
    setUser(user: UserType) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    },
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      if (token) {
        this.token = token
      }
      if (user) {
        this.user = JSON.parse(user)
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
})