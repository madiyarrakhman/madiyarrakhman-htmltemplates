import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/i/:uuid',
            name: 'invitation',
            component: () => import('../views/InvitationView.vue')
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue')
        },
        {
            path: '/admin/login',
            name: 'admin-login',
            component: () => import('../views/AdminLoginView.vue')
        }
    ]
})

export default router
