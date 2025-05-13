import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/css/tailwind.css'
import './styles/globals.css'
import App from './App.vue'
import router from './router'

// Create the Vue app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount the app
app.mount('#app')
