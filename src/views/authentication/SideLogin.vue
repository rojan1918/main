<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoAuth.vue';
import { useAuth0 } from '@auth0/auth0-vue'; // 1. Import Auth0

// 2. Get the login function from the SDK
const { loginWithRedirect } = useAuth0();

// 3. This function will be called by our button
function login() {
    loginWithRedirect();
}
</script>

<template>
    <div class="pa-3">
        <v-row class="h-100vh auth">
            <v-col cols="12" lg="5" xl="4" class="d-flex align-center justify-center bg-surface">
                <div class="mt-xl-0 mt-5 mw-100">
                    <div class="auth-header pa-6">
                        <div class="position-relative">
                            <Logo />
                        </div>
                    </div>

                    <h2 class="text-h3 textPrimary font-weight-semibold mb-2">Velkommen</h2>
                    <div class="card-subtitle mb-6">Log ind for at få adgang til platformen.</div>

                    <v-btn color="primary" @click="login" size="large" block class="mt-6">
                        Log Ind eller Opret Bruger
                    </v-btn>

                </div>
            </v-col>
            <v-col cols="12" lg="7" xl="8" class="d-none d-lg-flex align-center justify-center authentication position-relative">
                <div class="">
                    <img src="@/assets/images/backgrounds/login-bg.png" class="position-relative" alt="login-background" />
                </div>
            </v-col>
        </v-row>
    </div>
</template>