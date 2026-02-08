<script setup lang="ts">
import { ref } from 'vue';
import { BrandFacebookIcon, BrandTwitterIcon, BrandInstagramIcon, BrandLinkedinIcon } from 'vue-tabler-icons';
</script>

<template>
    <v-footer class="bg-surface text-body-2 pt-16 pb-8 border-t">
        <v-container>
            <v-row>
                <!-- Company Info Section -->
                <v-col cols="12" md="4" class="mb-8 mb-md-0">
                    <div class="mb-4">
                        <h3 class="text-h4 font-weight-bold mb-2">Kommunedata</h3>
                        <p class="text-medium-emphasis">
                            Få indsigt i kommunale beslutninger og tendenser gennem avanceret dataanalyse.
                        </p>
                    </div>
                    
                    <div class="contact-info mt-6">
                        <p class="mb-1 font-weight-bold">Kontakt</p>
                        <p class="mb-1">Adresse: Rådhuspladsen 1, 1550 København V</p>
                        <p class="mb-1">Email: kontakt@kommunedata.dk</p>
                        <p class="mb-1">CVR: 12 34 56 78</p>
                    </div>
                </v-col>

                <!-- Navigation Section -->
                <v-col cols="6" md="2" offset-md="1" class="mb-8 mb-md-0">
                    <h4 class="text-h6 font-weight-bold mb-4">Udforsk</h4>
                    <v-list density="compact" class="bg-transparent pa-0">
                        <v-list-item class="px-0" to="/dashboards/kommunedata" link>
                            <v-list-item-title class="text-body-2">Søg i Referater</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="px-0" to="/dashboards/trends" link>
                            <v-list-item-title class="text-body-2">Tendenser</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="px-0" to="/about" link>
                            <v-list-item-title class="text-body-2">Om Os</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-col>

                <!-- Legal Section -->
                <v-col cols="6" md="2" class="mb-8 mb-md-0">
                    <h4 class="text-h6 font-weight-bold mb-4">Juridisk</h4>
                    <v-list density="compact" class="bg-transparent pa-0">
                        <v-list-item class="px-0" link>
                            <v-list-item-title class="text-body-2">Persondatapolitik</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="px-0" link>
                            <v-list-item-title class="text-body-2">Cookiepolitik</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="px-0" link>
                            <v-list-item-title class="text-body-2">Vilkår & Betingelser</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-col>

                <!-- Social/Newsletter (Optional) -->
                <v-col cols="12" md="3">
                    <h4 class="text-h6 font-weight-bold mb-4">Følg med</h4>
                    <div class="d-flex gap-4 social-icons">
                        <v-btn icon variant="text" size="small" color="primary">
                            <BrandLinkedinIcon size="20" />
                        </v-btn>
                        <v-btn icon variant="text" size="small" color="primary">
                            <BrandTwitterIcon size="20" />
                        </v-btn>
                        <v-btn icon variant="text" size="small" color="primary">
                            <BrandFacebookIcon size="20" />
                        </v-btn>
                    </div>
                    <p class="text-caption mt-4 text-medium-emphasis">
                        Hold dig opdateret på de seneste kommunale tendenser.
                    </p>
                </v-col>
            </v-row>

            <v-divider class="my-8"></v-divider>

            <v-row>
                <v-col cols="12" class="text-center text-caption text-medium-emphasis">
                    &copy; {{ new Date().getFullYear() }} Kommunedata ApS. Alle rettigheder forbeholdes.
                </v-col>
            </v-row>
        </v-container>
    </v-footer>
</template>

<style scoped>
.v-list-item--density-compact.v-list-item--one-line {
    min-height: 32px;
}
.social-icons {
    gap: 8px;
}
</style>
