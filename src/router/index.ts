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

import { watch } from 'vue';
import { auth0 } from '@/main';

router.beforeEach(async (to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/auth/login', '/', '/auth/register', '/auth/forgot-password']; // + any other public pages
    const authRequired = !publicPages.includes(to.path) && !to.matched.some(record => record.meta.requiresAuth === false);

    // 1. Wait for Auth0 to initialize if it's currently loading
    if (auth0.isLoading.value) {
        await new Promise<void>(resolve => {
            const unwatch = watch(auth0.isLoading, (isLoading) => {
                if (!isLoading) {
                    unwatch();
                    resolve();
                }
            });
        });
    }

    if (authRequired) {
        // 2. Now checking isAuthenticated is safe
        if (!auth0.isAuthenticated.value) {
            auth0.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
            return; // Prevent further navigation, let Auth0 take over
        }
    }

    next();
});
