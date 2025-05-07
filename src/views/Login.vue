<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Power Grid Management System</h1>
        <div class="logo">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <path d="M30 5L5 30h10v25h30V30h10L30 5z" fill="#4CAF50" />
            <circle cx="30" cy="20" r="5" fill="#FFC107" />
            <circle cx="20" cy="35" r="3" fill="#FFC107" />
            <circle cx="40" cy="35" r="3" fill="#FFC107" />
            <path d="M25 30v15h10V30h-10z" fill="#333" />
          </svg>
        </div>
      </div>
      
      <div class="login-form">
        <div class="form-group" :class="{ 'error': errors.username }">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="Enter your username"
            @input="clearError('username')"
          />
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>
        
        <div class="form-group" :class="{ 'error': errors.password }">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              placeholder="Enter your password"
              @input="clearError('password')"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="togglePasswordVisibility"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>
        
        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="form.rememberMe" />
            <label for="remember">Remember me</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="forgotPassword">Forgot password?</a>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            class="login-button" 
            :disabled="isLoading" 
            @click="login"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Login</span>
          </button>
        </div>
        
        <div v-if="loginError" class="login-error">
          {{ loginError }}
        </div>
      </div>
    </div>
    
    <!-- System Status Indicator -->
    <div class="system-status">
      <div class="status-indicator" :class="systemStatus.color"></div>
      <span>System Status: {{ systemStatus.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form state
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
});

// Form validation and UI state
const errors = reactive({
  username: '',
  password: ''
});
const showPassword = ref(false);
const isLoading = ref(false);
const loginError = ref('');

// System status (in a real application, this would come from an API)
const systemStatus = reactive({
  text: 'Online',
  color: 'green'
});

// Check system status on component mount
onMounted(() => {
  checkSystemStatus();
});

// Functions
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function clearError(field: 'username' | 'password') {
  errors[field] = '';
  loginError.value = '';
}

function validateForm() {
  let isValid = true;
  
  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }
  
  return isValid;
}

async function login() {
  if (!validateForm()) return;
  
  isLoading.value = true;
  loginError.value = '';
  
  try {
    // In a real application, this would be an actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // This is a simplified example; in production, use proper authentication
    if (form.username === 'admin' && form.password === 'password123') {
      // Successful login
      const token = 'sample-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Store authentication data
      authStore.setToken(token);
      authStore.setUser({
        id: '1',
        username: form.username,
        role: 'Administrator',
        name: 'System Administrator'
      });
      
      // Save to localStorage if remember me is checked
      if (form.rememberMe) {
        localStorage.setItem('power-grid-auth-token', token);
      } else {
        sessionStorage.setItem('power-grid-auth-token', token);
      }
      
      // Redirect to the home route ('/')
      router.replace('/');

      /*

        const result = await authStore.login(form.username, form.password);
        
        if (result.status) {
          // Successful login - redirect to the home route ('/')
          router.push('/');

      */
    } else {
      // Failed login
      loginError.value = 'Invalid username or password';
    }
  } catch (error) {
    loginError.value = 'An error occurred during login. Please try again.';
    console.error('Login error:', error);
  } finally {
    isLoading.value = false;
  }
}

function forgotPassword() {
  // In a real application, this would open a password reset flow
  alert('Password reset functionality would be implemented here.');
}

function checkSystemStatus() {
  // In a real application, this would be an API call to check the power grid system status
  // For now, we'll simulate a status check
  const statusOptions = [
    { text: 'Online', color: 'green' },
    { text: 'Partial Outage', color: 'yellow' },
    { text: 'Maintenance', color: 'blue' }
  ];
  
  // Randomly select a status (90% chance of being online for demo purposes)
  const random = Math.random();
  let selectedStatus;
  
  if (random < 0.9) {
    selectedStatus = statusOptions[0]; // Online
  } else if (random < 0.95) {
    selectedStatus = statusOptions[1]; // Partial Outage
  } else {
    selectedStatus = statusOptions[2]; // Maintenance
  }
  
  systemStatus.text = selectedStatus.text;
  systemStatus.color = selectedStatus.color;
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
  margin: 0;
  max-width: 70%;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-group.error input {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 4px;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 70px;
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #4CAF50;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
}

.forgot-password {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-actions {
  margin-top: 10px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button:hover {
  background-color: #45a049;
}

.login-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-error {
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  color: #d32f2f;
  text-align: center;
  font-size: 0.9rem;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  font-size: 0.9rem;
  color: #555;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.green {
  background-color: #4CAF50;
}

.status-indicator.yellow {
  background-color: #FFC107;
}

.status-indicator.red {
  background-color: #F44336;
}

.status-indicator.blue {
  background-color: #2196F3;
}
</style>