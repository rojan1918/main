<script setup lang="ts">
import { computed } from 'vue';
import { getSecondary } from '@/utils/UpdateColors';

/*Chart*/
const chartOptions = computed(() => {
    return {
        chart: {
            type: 'area',
            height: 64,
            sparkline: {
                enabled: true
            },
            group: 'online-revenue',
            fontFamily: 'inherit',
            foreColor: '#adb0bb'
        },
        series: [
            {
                name: '',
                color: getSecondary.value,
                data: [0, 150, 110, 240, 200, 200, 300, 200]
            }
        ],
        stroke: {
            curve: 'straight',
            width: 2
        },

        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 0,
                inverseColors: false,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 200]
            }
        },

        markers: {
            size: 0
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: true,
                position: 'right'
            },
            x: {
                show: false
            }
        }
    };
});
</script>

<template>
    <v-row>
        <v-col cols="12" md="6">
            <VCard elevation="10">
                <v-card-text class="pa-5">
                    <h5 class="card-subtitle">Online Revenue</h5>
                    <h3 class="card-title">$2376</h3>
                    <apexchart type="area" height="64" :options="chartOptions" :series="chartOptions.series"></apexchart>
                </v-card-text>
            </VCard>
        </v-col>
        <v-col cols="12" md="6">
            <VCard elevation="10" class="bg-secondary">
                <v-card-text class="text-center py-9">
                    <p class="text-14 text-white mb-1">Ad. Expense</p>
                    <h2 class="text-40 text-white font-weight-medium">12.5m</h2>
                </v-card-text>
            </VCard>
        </v-col>
    </v-row>
</template>
