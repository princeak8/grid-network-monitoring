import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Import jQuery and make it available globally
import jQuery from 'jquery'
window.jQuery = window.$ = jQuery

// createApp(App).mount('#app')
const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Initialize router
app.use(router)
.use(ElementPlus)
app.mount('#app')
