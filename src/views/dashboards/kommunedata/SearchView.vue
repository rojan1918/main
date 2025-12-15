<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'; // Import Auth0

// === STATE VARIABLES ===
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedMunicipality = ref<string | null>('Alle')
const municipalityList = ref<string[]>([])

// --- GET THE AUTH0 TOKEN FUNCTION ---
const { getAccessTokenSilently } = useAuth0();

// --- UPDATED FUNCTION TO FETCH MUNICIPALITIES ---
async function fetchMunicipalities() {
    try {
        // 1. Get the token
        const token = await getAccessTokenSilently();

        // 2. Add the token to the request headers
        const response = await fetch('http://127.0.0.1:8000/municipalities', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Could not fetch municipalities');
        const data = await response.json()
        municipalityList.value = ['Alle', ...data]
    } catch (e: any) {
        console.error(e)
        error.value = "Kunne ikke hente kommuneliste."
    }
}

onMounted(() => {
    fetchMunicipalities()
})

// === UPDATED SEARCH FUNCTION ===
async function performSearch() {
    if (!searchQuery.value.trim()) {
        return
    }

    isLoading.value = true
    error.value = null
    searchResults.value = []

    try {
        let url = `http://127.0.0.1:8000/search?query_text=${encodeURIComponent(searchQuery.value)}`

        if (selectedMunicipality.value && selectedMunicipality.value !== 'Alle') {
            url += `&municipality=${encodeURIComponent(selectedMunicipality.value)}`
        }

        // 1. Get the token
        const token = await getAccessTokenSilently();

        // 2. Add the token to the request headers
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'An unknown error occurred.')
        }

        const data = await response.json()
        searchResults.value = data.results
        totalCount.value = data.total_count

    } catch (e: any) {
        console.error("Failed to fetch search results:", e)
        error.value = e.message
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <main>
        <h1>Kommunal Referat Søgemaskine</h1>

        <div class="search-bar">
            <v-text-field
                label="Søg i alle referater..."
                v-model="searchQuery"
                @keyup.enter="performSearch"
                variant="outlined"
                density="compact"
                hide-details
            ></v-text-field>

            <v-select
                label="Kommune"
                :items="municipalityList"
                v-model="selectedMunicipality"
                variant="outlined"
                density="compact"
                class="municipality-filter"
                hide-details
            ></v-select>

            <v-btn
                color="primary"
                @click="performSearch"
                :loading="isLoading"
                size="large"
            >
                Søg
            </v-btn>
        </div>

        <div class="results-container mt-4">
            <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">Henter resultater, vent venligst...</p>
            </div>

            <div v-else-if="error">
                <v-alert type="error" :text="error"></v-alert>
            </div>

            <div v-else-if="searchResults.length > 0">
                <p><strong>{{ totalCount }}</strong> resultater fundet.</p>

                <v-expansion-panels class="mt-4">
                    <v-expansion-panel
                        v-for="doc in searchResults"
                        :key="doc.id"
                    >
                        <v-expansion-panel-title>
                            <div>
                                <div><strong>{{ doc.municipality }}</strong> - {{ doc.subject_title }}</div>
                                <div class="text-caption mt-1">Dato: {{ new Date(doc.date).toLocaleDateString('da-DK') }}</div>
                            </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                            <p v-if="doc.summary">
                                <strong>Resumé:</strong> {{ doc.summary }}
                            </p>
                            <p v-if="doc.description" class="mt-2">
                                <strong>Emnebeskrivelse:</strong> {{ doc.description }}
                            </p>
                            <p v-if="doc.future_action" class="mt-2">
                                <strong>Fremtidig handling:</strong> {{ doc.future_action }}
                            </p>
                            <p v-if="doc.decided_or_not" class="mt-2">
                                <strong>Beslutning truffet:</strong> {{ doc.decided_or_not ? 'Ja' : 'Nej' }}
                            </p>
                            <p v-if="doc.amount" class="mt-2">
                                <strong>Bevilliget beløb:</strong> {{ doc.amount }} DKK
                            </p>
                            <div v-if="doc.tags && doc.tags.length" class="mt-2">
                                <strong>Tags:</strong>
                                <v-chip v-for="tag in doc.tags" :key="tag" class="ml-2" size="small">{{ tag }}</v-chip>
                            </div>
                            <p v-if="doc.search_sentences" class="mt-2 text-grey">
                                <small><strong>Søgesætninger:</strong> {{ doc.search_sentences }}</small>
                            </p>

                            <v-btn
                                :href="doc.content_url"
                                target="_blank"
                                color="primary"
                                class="mt-4"
                            >
                                Læs hele referatet
                            </v-btn>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
        </div>
    </main>
</template>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    gap: 16px;
}
.municipality-filter {
    max-width: 250px;
    min-width: 200px;
}
</style>