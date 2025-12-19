import { createApp } from 'vue'
import App from './App.vue'
import { loadFonts } from './plugins/webfontloader'

import './assets/sass/style.scss'

loadFonts()

createApp(App).mount('#app')
