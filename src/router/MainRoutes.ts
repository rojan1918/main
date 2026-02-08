// 1. IMPORT THE AUTH GUARD
import { authGuard } from '@auth0/auth0-vue';

const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    // 2. ADD THE GUARD HERE
    beforeEnter: authGuard, // This protects all child routes

    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            path: '/',
            redirect: "/dashboards/kommunedata",
        },
        {
            name: 'KommuneData',
            path: '/dashboards/kommunedata',
            component: () => import('@/views/dashboards/kommunedata/SearchView.vue'),
        },
        {
            name: 'Trends',
            path: '/dashboards/trends',
            component: () => import('@/views/dashboards/trends/trends.vue'),
        },
        {
            name: 'Network Graph',
            path: '/apps/graph',
            component: () => import('@/views/apps/graph/GraphVisualizer.vue'),
        },
    ]
};

export default MainRoutes;
