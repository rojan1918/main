<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useAuth0 } from '@auth0/auth0-vue'; // 1. Import Auth0
import axios from '@/utils/axios';

// Register the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// === STATE VARIABLES ===
const activeTab = ref(null);
const overallData = ref<any[]>([]);
const singleMunicipalityData = ref<any[]>([]);
const municipalityList = ref<string[]>([]);
const selectedMunicipality = ref<string | null>(null);

const isLoadingOverall = ref(true);
const isLoadingSingle = ref(false);
const error = ref<string | null>(null);

// 2. Get the token function from Auth0
const { getAccessTokenSilently } = useAuth0();

// === DATA FETCHING ===
async function fetchOverallData() {
    try {
        const token = await getAccessTokenSilently();
        // Use axios with relative path - baseURL is configured in @/utils/axios
        const response = await axios.get('/analytics/categories/all', {
            headers: { Authorization: `Bearer ${token}` }
        });
        overallData.value = response.data;
    } catch (e: any) {
        error.value = e.message || 'Error fetching data';
    } finally {
        isLoadingOverall.value = false;
    }
}

async function fetchMunicipalities() {
    try {
        const token = await getAccessTokenSilently();
        const response = await axios.get('/municipalities', {
            headers: { Authorization: `Bearer ${token}` }
        });
        municipalityList.value = response.data;
    } catch (e: any) {
        error.value = e.message || 'Error fetching municipalities';
    }
}

async function fetchSingleMunicipalityData() {
    if (!selectedMunicipality.value) return;
    isLoadingSingle.value = true;
    singleMunicipalityData.value = [];
    try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`/analytics/categories/${selectedMunicipality.value}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        singleMunicipalityData.value = response.data;
    } catch (e: any) {
        error.value = e.message || 'Error fetching municipality data';
    } finally {
        isLoadingSingle.value = false;
    }
}

// Fetch initial data when the component loads
onMounted(() => {
    fetchOverallData();
    fetchMunicipalities();
});

// === CHART CONFIGURATION (Computed properties react to data changes) ===
const overallChartData = computed(() => ({
    labels: overallData.value.map(item => item.category),
    datasets: [{
        label: 'Antal Forekomster',
        backgroundColor: '#42A5F5',
        data: overallData.value.map(item => item.count)
    }]
}));

const singleMunicipalityChartData = computed(() => ({
    labels: singleMunicipalityData.value.map(item => item.category),
    datasets: [{
        label: 'Antal Forekomster',
        backgroundColor: '#66BB6A',
        data: singleMunicipalityData.value.map(item => item.count)
    }]
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
};

// Data table headers
const headers = [
    { title: 'Kategori', key: 'category' },
    { title: 'Antal', key: 'count' }
];
</script>

<template>
    <v-card>
        <v-card-title class="pa-4">Analyse & Indblik</v-card-title>
        <v-card-subtitle class="pa-4">Et overblik over de mest diskuterede emner i kommunerne.</v-card-subtitle>

        <v-tabs v-model="activeTab" bg-color="primary" dark>
            <v-tab>Overblik for alle kommuner</v-tab>
            <v-tab>Dyk ned i én kommune</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
            <v-window-item>
                <v-container fluid>
                    <div v-if="isLoadingOverall" class="text-center pa-4">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <p class="mt-2">Henter data...</p>
                    </div>
                    <v-row v-else>
                        <v-col cols="12" md="6">
                            <v-card variant="outlined">
                                <v-card-title>Top 20 Emner (Nationalt)</v-card-title>
                                <v-data-table :headers="headers" :items="overallData" density="compact"></v-data-table>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4" style="height: 500px">
                                <Bar :data="overallChartData" :options="chartOptions" />
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-window-item>

            <v-window-item>
                <v-container fluid>
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-select
                                label="Vælg en kommune"
                                :items="municipalityList"
                                v-model="selectedMunicipality"
                                @update:model-value="fetchSingleMunicipalityData"
                                variant="outlined"
                                density="compact"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="isLoadingSingle" class="text-center pa-4">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                    <v-row v-else-if="selectedMunicipality && singleMunicipalityData.length > 0">
                        <v-col cols="12" md="6">
                            <v-card variant="outlined">
                                <v-card-title>Top 20 Emner for {{ selectedMunicipality }}</v-card-title>
                                <v-data-table :headers="headers" :items="singleMunicipalityData" density="compact"></v-data-table>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4" style="height: 500px">
                                <Bar :data="singleMunicipalityChartData" :options="chartOptions" />
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-window-item>
        </v-window>

        <div v-if="error">
            <v-alert type="error" class="ma-4">{{ error }}</v-alert>
        </div>
    </v-card>
</template>

<style scoped>
.v-window {
    padding: 16px;
}
</style>