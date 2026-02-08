import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/layouts/blank/BlankLayout.vue'),
            children: [
                {
                    path: '',
                    component: () => import('@/views/pages/landing/LandingPage.vue')
                }
            ]
        },
        MainRoutes,
        AuthRoutes,
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        }
    ]
});

import { auth0 } from '@/main';

router.beforeEach(async (to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/auth/login', '/', '/auth/register', '/auth/forgot-password']; // + any other public pages
    const authRequired = !publicPages.includes(to.path) && !to.matched.some(record => record.meta.requiresAuth === false);

    // Auth0 might need a moment to initialize. 
    // In a robust app, we'd wait for !auth0.isLoading.value, or rely on the auth guard from the SDK.
    // For now, we check the reactive state.

    if (authRequired) {
        if (!auth0.isAuthenticated.value) {
            // If we are not authenticated, redirect to login
            // But if we are currently loading (e.g. processing callback), we might want to wait?
            // Simple check:
            return next('/auth/login');
        }
    }

    next();
});
