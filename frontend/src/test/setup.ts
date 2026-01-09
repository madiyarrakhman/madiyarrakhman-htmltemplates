import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ruMessages from '../locales/ru.json'

// Mock IntersectionObserver
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// Setup I18n for tests
const i18n = createI18n({
    legacy: false,
    locale: 'ru',
    messages: {
        ...ruMessages
    }
})

config.global.plugins = [i18n]
config.global.stubs = {
    'router-link': true,
    'router-view': true
}
