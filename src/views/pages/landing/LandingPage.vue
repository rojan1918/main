<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { 
    SearchIcon, 
    ChartDotsIcon, 
    BellRingingIcon, 
    ArrowRightIcon, 
    ShieldCheckIcon 
} from 'vue-tabler-icons';

const router = useRouter();
const { isAuthenticated, isLoading } = useAuth0();

// Auto-redirect if already logged in
watchEffect(() => {
    if (!isLoading.value && isAuthenticated.value) {
        router.push('/dashboards/kommunedata');
    }
});

const features = [
    {
        icon: SearchIcon,
        title: 'Øjeblikkelig Søgning',
        desc: 'Få adgang til tusindvis af kommunale referater på millisekunder. Fritekstsøgning på tværs af alle møder og beslutninger.'
    },
    {
        icon: ChartDotsIcon,
        title: 'Netværksanalyse',
        desc: 'Visualiser forbindelser mellem politikere, virksomheder og beslutninger for at afdække skjulte mønstre.'
    },
    {
        icon: BellRingingIcon,
        title: 'Smarte Alarmer',
        desc: 'Gå aldrig glip af en vigtig beslutning. Modtag notifikationer, når dine søgeord optræder i nye dagsordener.'
    }
];

function handleGetStarted() {
    router.push('/dashboards/kommunedata');
}
</script>

<template>
    <div class="landing-page">
        <!-- HEADER / NAV -->
        <v-app-bar flat color="transparent" class="px-md-16 px-4 py-4" absolute>
            <div class="d-flex align-center font-weight-bold text-h5 text-primary cursor-pointer">
                Arevo
            </div>
            <v-spacer></v-spacer>
            <v-btn variant="text" class="mr-2 text-capitalize" to="/auth/login">Log Ind</v-btn>
            <v-btn color="primary" rounded="lg" class="px-6 text-capitalize" elevation="0" @click="handleGetStarted">
                Kom i Gang
            </v-btn>
        </v-app-bar>

        <!-- HERO SECTION -->
        <section class="hero-section d-flex align-center">
            <v-container>
                <v-row align="center">
                    <v-col cols="12" md="6">
                        <div class="hero-content pr-md-10">
                            <v-chip color="primary" variant="tonal" class="mb-6 font-weight-bold" label>
                                Platform for Markedsindsigt
                            </v-chip>
                            <h1 class="text-h1 font-weight-bold text-dark mb-6 line-height-tight">
                                Find Indsigter i <span class="text-primary">Kommunale Data</span>
                            </h1>
                            <p class="text-h6 text-medium-emphasis mb-8 font-weight-regular" style="line-height: 1.6;">
                                Stop med at søge manuelt gennem tusindvis af PDF-referater. 
                                Arevo giver dig øjeblikkelig adgang til beslutninger, netværk og muligheder på tværs af 98 kommuner.
                            </p>
                            
                            <div class="d-flex gap-4 align-center flex-wrap">
                                <v-btn 
                                    color="primary" 
                                    size="x-large" 
                                    rounded="lg" 
                                    elevation="4"
                                    class="px-8 text-capitalize font-weight-bold"
                                    @click="handleGetStarted"
                                >
                                    Prøv Gratis Nu
                                    <ArrowRightIcon class="ml-2" size="20" />
                                </v-btn>
                                <v-btn 
                                    variant="outlined" 
                                    size="x-large" 
                                    rounded="lg" 
                                    class="px-8 text-capitalize"
                                    color="primary"
                                >
                                    Se Demo
                                </v-btn>
                            </div>

                            <div class="mt-8 d-flex align-center text-caption text-medium-emphasis">
                                <ShieldCheckIcon size="18" class="mr-2 text-success" />
                                Bruges af førende public affairs teams
                            </div>
                        </div>
                    </v-col>
                    
                    <v-col cols="12" md="6" class="d-none d-md-block">
                        <!-- Abstract Visual / Dashboard Preview -->
                        <div class="hero-visual position-relative">
                            <div class="blob-1"></div>
                            <div class="blob-2"></div>
                            <v-card class="glass-card position-relative" elevation="10" rounded="xl">
                                <v-img 
                                    src="https://demos.adminmart.com/premium/vue/materialpro-vuejs/package/images/backgrounds/login-bg.jpg" 
                                    cover 
                                    height="400"
                                    class="rounded-xl opacity-90"
                                    gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.1)"
                                >
                                    <div class="d-flex align-center justify-center h-100">
                                        <v-icon size="64" color="white" class="opacity-50">ChartDotsIcon</v-icon>
                                    </div>
                                </v-img>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </section>

        <!-- FEATURES SECTION -->
        <section class="py-16 bg-grey-lighten-5">
            <v-container>
                <div class="text-center mb-16">
                    <h2 class="text-h3 font-weight-bold mb-4">Hvorfor Arevo?</h2>
                    <p class="text-h6 text-medium-emphasis" style="max-width: 700px; margin: 0 auto;">
                        Vi forvandler ustrukturerede offentlige data til brugbar forretningsindsigt.
                    </p>
                </div>

                <v-row>
                    <v-col cols="12" md="4" v-for="(feature, i) in features" :key="i">
                        <v-card class="pa-8 h-100 transition-swing card-hover" elevation="0" rounded="xl">
                            <div class="mb-6 d-inline-flex pa-4 rounded-lg bg-primary-lighten-5 text-primary">
                                <component :is="feature.icon" size="32" stroke-width="1.5" />
                            </div>
                            <h3 class="text-h5 font-weight-bold mb-3">{{ feature.title }}</h3>
                            <p class="text-body-1 text-medium-emphasis" style="line-height: 1.6;">
                                {{ feature.desc }}
                            </p>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </section>

        <!-- CTA SECTION -->
        <section class="py-16 text-center">
            <v-container>
                <div class="bg-primary rounded-xl pa-10 pa-md-16 position-relative overflow-hidden">
                    <div class="position-relative z-1">
                        <h2 class="text-h3 font-weight-bold text-white mb-6">Klar til at finde din fordel?</h2>
                        <p class="text-h6 text-white opacity-90 mb-8" style="max-width: 600px; margin: 0 auto;">
                            Skriv dig på ventelisten i dag og få tidlig adgang til den mest kraftfulde kommunale søgemaskine.
                        </p>
                        <v-btn 
                            size="x-large" 
                            color="white" 
                            class="text-primary font-weight-bold px-8" 
                            rounded="lg"
                            @click="handleGetStarted"
                        >
                            Start Søgning Nu
                        </v-btn>
                    </div>
                </div>
            </v-container>
        </section>

        <!-- FOOTER -->
        <v-footer class="bg-white py-8 border-t text-center d-flex flex-column">
            <div class="font-weight-bold text-h6 text-primary mb-4">Arevo</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
                © {{ new Date().getFullYear() }} Arevo Intelligence. Alle rettigheder forbeholdes.
            </div>
            <div class="d-flex gap-4 justify-center">
                <a href="#" class="text-decoration-none text-medium-emphasis text-body-2">Privatliv</a>
                <a href="#" class="text-decoration-none text-medium-emphasis text-body-2">Vilkår</a>
                <a href="#" class="text-decoration-none text-medium-emphasis text-body-2">Kontakt</a>
            </div>
        </v-footer>
    </div>
</template>

<style scoped>
.landing-page {
    font-family: 'Plus Jakarta Sans', sans-serif; /* Explicitly use clean font if available, else inherit */
    background-color: #fff;
    min-height: 100vh;
}

.hero-section {
    min-height: 90vh;
    padding-top: 80px; /* Space for Navbar */
    background: radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.05) 0%, transparent 40%);
}

.hero-visual .glass-card {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.5);
    transform: rotate(-2deg);
    transition: transform 0.3s ease;
}

.hero-visual:hover .glass-card {
    transform: rotate(0deg) scale(1.02);
}

.blob-1, .blob-2 {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    z-index: 0;
}

.blob-1 {
    width: 300px;
    height: 300px;
    background: rgba(var(--v-theme-primary), 0.2);
    top: -20px;
    right: -20px;
}

.blob-2 {
    width: 250px;
    height: 250px;
    background: rgba(var(--v-theme-secondary), 0.2);
    bottom: -20px;
    left: -20px;
}

.line-height-tight {
    line-height: 1.1;
}

.card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
}
</style>
