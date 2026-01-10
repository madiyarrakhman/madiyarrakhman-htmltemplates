import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'Свадебные приглашения онлайн | Wedding Invitations',
                description: 'Создайте элегантное цифровое свадебное приглашение за считанные минуты.'
            }
        },
        {
            path: '/i/:uuid',
            name: 'invitation',
            component: () => import('../views/InvitationView.vue'),
            meta: {
                title: 'Загрузка приглашения...',
                description: 'Ваше персональное приглашение на свадьбу.'
            }
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue'),
            meta: {
                title: 'Панель администратора | Wedding Admin',
                description: 'Управление свадебными приглашениями и список гостей.'
            }
        },
        {
            path: '/admin/login',
            name: 'admin-login',
            component: () => import('../views/AdminLoginView.vue'),
            meta: {
                title: 'Вход в панель администратора',
                description: 'Авторизация для доступа к панели управления.'
            }
        }
    ]
})

router.beforeEach((to, _from, next) => {
    // Update Document Title
    const title = to.meta.title as string
    if (title) {
        document.title = title

        // Update OG Title
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', title)
        }
    }

    // Update Meta Description
    const description = to.meta.description as string
    if (description) {
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute('content', description)
        }

        // Update OG Description
        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute('content', description)
        }
    }

    next()
})

export default router
