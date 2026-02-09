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
import { fakeBackend } from '@/utils/helpers/fake-backend';
import 'vue3-carousel/dist/carousel.css';
//Mock Api data
// import './_mockApis';
import Maska from 'maska';


//i18
import { createI18n } from 'vue-i18n';
import messages from '@/utils/locales/messages';

//LightBox
import VueEasyLightbox from 'vue-easy-lightbox';

//ScrollTop
import VueScrollTo from 'vue-scrollto';

// 1. --- IMPORT THE AUTH0 PLUGIN ---
import { createAuth0 } from '@auth0/auth0-vue';


const i18n = createI18n({
    locale: 'en',
    messages: messages,
    silentTranslationWarn: true,
    silentFallbackWarn: true
});

const app = createApp(App);
fakeBackend();
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