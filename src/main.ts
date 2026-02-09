import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { Icon } from '@iconify/vue';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
// import { fakeBackend } from '@/utils/helpers/fake-backend';

const app = createApp(App);
// fakeBackend();
app.use(router);
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(i18n);
app.use(Maska);
app.use(VueApexCharts as any);
app.use(vuetify);
app.component('Icon', Icon);
app.use(VueEasyLightbox);
app.use(VueScrollTo, {
    duration: 1000,
    easing: 'ease'
});

// 2. --- ADD THE AUTH0 PLUGIN CONFIGURATION ---
//    (Replace with your keys from the Auth0 dashboard)
// 2. --- ADD THE AUTH0 PLUGIN CONFIGURATION ---
//    (Replace with your keys from the Auth0 dashboard)
export const auth0 = createAuth0({
    // Find these in your Auth0 "Single Page Application" settings
    domain: "dev-y5qkyesk4xou2lag.eu.auth0.com", // e.g., "your-tenant.us.auth0.com"
    clientId: "3LmjmekKi98gx3T8jd0nO6H6MiB85nKt",

    // This tells Auth0 you also want to talk to an API
    authorizationParams: {
        redirect_uri: window.location.origin, // This is your Vue app's address

        // Find this in your Auth0 "API" (Kommunedata Backend API) settings
        audience: "https://api.kommunedata.dk" // e.g., "https://api.kommunedata.dk"
    }
});

app.use(auth0);

// 3. --- MOUNT THE APP (should always be the last step) ---
app.mount('#app');