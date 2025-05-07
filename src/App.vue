<template>
  <div class="app-container">
    <!-- Navigation sidebar (only shown when authenticated) -->
    <nav v-if="isAuthenticated" class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="app-logo">
          <svg width="40" height="40" viewBox="0 0 60 60">
            <path d="M30 5L5 30h10v25h30V30h10L30 5z" fill="#4CAF50" />
            <circle cx="30" cy="20" r="5" fill="#FFC107" />
            <circle cx="20" cy="35" r="3" fill="#FFC107" />
            <circle cx="40" cy="35" r="3" fill="#FFC107" />
            <path d="M25 30v15h10V30h-10z" fill="#333" />
          </svg>
          <h1 v-if="!sidebarCollapsed">Power Grid</h1>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span class="toggle-icon">{{ sidebarCollapsed ? '≡' : '×' }}</span>
        </button>
      </div>
      
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/grid-map" class="nav-link">
          <span class="nav-icon">🗺️</span>
          <span class="nav-text" v-if="!sidebarCollapsed">Grid Map</span>
        </router-link>
        <router-link to="/stations" class="nav-link">
          <span class="nav-icon">⚡</span>
          <span class="nav-text" v-if="!sidebarCollapsed">Stations</span>
        </router-link>
        <router-link to="/outages" class="nav-link">
          <span class="nav-icon">🚨</span>
          <span class="nav-text" v-if="!sidebarCollapsed">Outages</span>
        </router-link>
      </div>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitials }}</div>
          <div v-if="!sidebarCollapsed" class="user-details">
            <div class="user-name">{{ userFullName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <button class="logout-button" @click="logout">
          <span class="logout-icon">🚪</span>
          <span v-if="!sidebarCollapsed" class="logout-text">Logout</span>
        </button>
      </div>
    </nav>
    
    <!-- Main content area -->
    <main class="main-content" :class="{ 'with-sidebar': isAuthenticated, 'sidebar-collapsed': sidebarCollapsed }">
      <!-- App Header (only shown when authenticated) -->
      <header v-if="isAuthenticated" class="app-header">
        <div class="header-content">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
          <div class="header-actions">
            <div class="system-status">
              <div class="status-indicator" :class="systemStatus.color"></div>
              <span>{{ systemStatus.text }}</span>
            </div>
            <div class="current-time">{{ currentTime }}</div>
          </div>
        </div>
      </header>
      
      <!-- Router view for page content -->
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

// Store and router
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// State
const sidebarCollapsed = ref(false);
const currentTime = ref(new Date().toLocaleTimeString());
const systemStatus = ref({
  text: 'System Online',
  color: 'green'
});

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userInitials = computed(() => authStore.userInitials);
const userFullName = computed(() => authStore.userFullName);
const userRole = computed(() => authStore.user?.role || '');

const currentPageTitle = computed(() => {
  const routeName = route.name?.toString() || '';
  
  // Map route names to friendly titles
  const titleMap: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'GridMap': 'Grid Map',
    'Stations': 'Power Stations',
    'Outages': 'Outage Management',
    'Login': 'Login',
    'NotFound': 'Page Not Found'
  };
  
  return titleMap[routeName] || routeName;
});

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value.toString());
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Update system status periodically (in a real app, this would come from an API)
const checkSystemStatus = () => {
  const statuses = [
    { text: 'System Online', color: 'green' },
    { text: 'Minor Issues', color: 'yellow' },
    { text: 'Maintenance Mode', color: 'blue' }
  ];
  
  // 90% chance of system being online for demo purposes
  const random = Math.random();
  if (random < 0.9) {
    systemStatus.value = statuses[0];
  } else if (random < 0.95) {
    systemStatus.value = statuses[1];
  } else {
    systemStatus.value = statuses[2];
  }
};

// Timer for clock updates
let clockTimer: number | null = null;
let statusTimer: number | null = null;

// Update clock every second
const updateClock = () => {
  currentTime.value = new Date().toLocaleTimeString();
};

// Setup and cleanup
onMounted(() => {
  // Restore sidebar state
  const savedState = localStorage.getItem('sidebar-collapsed');
  if (savedState !== null) {
    sidebarCollapsed.value = savedState === 'true';
  }
  
  // Start clock
  clockTimer = window.setInterval(updateClock, 1000);
  
  // Check system status every 30 seconds
  checkSystemStatus();
  statusTimer = window.setInterval(checkSystemStatus, 30000);
  
  // Load user profile if authenticated
  if (isAuthenticated.value) {
    // authStore.fetchUserProfile();
  }
});

onBeforeUnmount(() => {
  // Clear timers
  if (clockTimer !== null) {
    clearInterval(clockTimer);
  }
  if (statusTimer !== null) {
    clearInterval(statusTimer);
  }
});
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
  color: #333;
  background-color: #f5f7fa;
  line-height: 1.6;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background-color: #1e293b;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 10;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2d3748;
  height: 70px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-logo h1 {
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
}

.nav-links {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #cbd5e0;
  text-decoration: none;
  gap: 12px;
  transition: background-color 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  background-color: #2d3748;
  color: #fff;
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background-color: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.8rem;
  color: #a0aec0;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: #cbd5e0;
  padding: 8px 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.logout-button:hover {
  color: #fff;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.with-sidebar {
  margin-left: 250px;
}

.main-content.with-sidebar.sidebar-collapsed {
  margin-left: 70px;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  height: 70px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
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

.current-time {
  font-weight: 500;
  font-size: 0.9rem;
}

.page-content {
  padding: 20px;
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar .nav-text,
  .sidebar .user-details,
  .sidebar .logout-text,
  .sidebar .app-logo h1 {
    display: none;
  }
  
  .main-content.with-sidebar {
    margin-left: 70px;
  }
  
  .sidebar-toggle {
    display: none;
  }
}
</style>