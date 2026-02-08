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

router.beforeEach(async (to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/auth/login'];
    const authRequired = !publicPages.includes(to.path);
    const auth: any = useAuthStore();

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (authRequired && !auth.user) {
            auth.returnUrl = to.fullPath;
            return next('/auth/login');
        } else next();
    } else {
        next();
    }
});
