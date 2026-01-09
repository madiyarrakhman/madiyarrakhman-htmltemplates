import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import './assets/main.css'

import ru from './locales/ru.json'
import kk from './locales/kk.json'
import en from './locales/en.json'

const app = createApp(App)

const i18n = createI18n({
    legacy: false, // Usage with Composition API
    locale: 'ru', // default locale
    fallbackLocale: 'ru',
    messages: {
        ...ru,
        ...kk,
        ...en
    }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
