import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue';
import axios from '@/utils/axios';
import { CATEGORY_OPTIONS, PHASE_OPTIONS } from '@/utils/constants';
import { 
    SearchIcon, 
    BuildingArchIcon, 
    CalendarIcon, 
    ChevronRightIcon, 
    FileTextIcon, 
    GavelIcon,
    FilterIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from 'vue-tabler-icons';

// === STATE VARIABLES ===
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const expandedResults = ref<Set<number>>(new Set()) // Track expanded items
const totalCount = ref(0)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedMunicipality = ref<string | null>('Alle')
const selectedCategory = ref<string | null>(null)
const selectedPhase = ref<string | null>(null)
const municipalityList = ref<string[]>([])

// === HELPERS ===
function toggleExpand(id: number) {
    if (expandedResults.value.has(id)) {
        expandedResults.value.delete(id)
    } else {
        expandedResults.value.add(id)
    }
}

// --- GET THE AUTH0 TOKEN FUNCTION ---
const { getAccessTokenSilently } = useAuth0();

// --- UPDATED FUNCTION TO FETCH MUNICIPALITIES ---
async function fetchMunicipalities() {
    try {
        const token = await getAccessTokenSilently();
        // Use global axios instance (configured with correct baseURL)
        const response = await axios.get('/municipalities', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        municipalityList.value = ['Alle', ...response.data];
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
    // Check if at least one search criteria is present (Query, Category, Phase, Municipality != Alle)
    const hasQuery = searchQuery.value.trim().length > 0;
    const hasCategory = !!selectedCategory.value;
    const hasPhase = !!selectedPhase.value;
    const hasMunicipality = selectedMunicipality.value && selectedMunicipality.value !== 'Alle';

    if (!hasQuery && !hasCategory && !hasPhase && !hasMunicipality) {
        // Nothing selected, do nothing
        return;
    }
    
    // Construct URL with params
    const searchParams = new URLSearchParams();
    if (hasQuery) searchParams.append('query_text', searchQuery.value);

    // If no query text, the backend must support optional query_text. 

    if (selectedMunicipality.value && selectedMunicipality.value !== 'Alle') {
        searchParams.append('municipality', selectedMunicipality.value);
    }
    if (selectedCategory.value) {
        searchParams.append('category', selectedCategory.value);
    }
    if (selectedPhase.value) {
        searchParams.append('phase', selectedPhase.value);
    }

    isLoading.value = true
    error.value = null
    searchResults.value = []

    try {
        const url = `/search?${searchParams.toString()}`;

        const token = await getAccessTokenSilently();
        const response = await axios.get(url, {
             headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        searchResults.value = data.results
        totalCount.value = data.total_count

    } catch (e: any) {
        console.error("Failed to fetch search results:", e)
        // Axios error handling
        if (e.response && e.response.data && e.response.data.detail) {
            error.value = e.response.data.detail;
        } else {
             error.value = e.message || 'An unknown error occurred.';
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <main class="page-container">
        <!-- HERO SECTION -->
        <div class="hero-section text-center py-10 py-md-16 mb-8 rounded-xl elevation-0">
            <v-container>
                <h1 class="text-h2 font-weight-bold text-white mb-2 hero-title">
                    Indsigt i din Kommune
                </h1>
                <p class="text-white text-h6 mb-8 opacity-90">
                    Søg i tusindvis af referater og find beslutningerne der former fremtiden.
                </p>

                <v-card class="mx-auto pa-2 search-card" max-width="1000" elevation="4" rounded="lg">
                    <div class="d-flex flex-column gap-2">
                        <!-- Top Row: Search Text -->
                        <v-text-field
                            v-model="searchQuery"
                            @keyup.enter="performSearch"
                            placeholder="Søg efter emner (f.eks. 'cykelsti' eller 'budget')"
                            variant="plain"
                            hide-details
                            class="px-4 custom-search-input w-100"
                            prepend-inner-icon=""
                        >
                            <template v-slot:prepend-inner>
                                <SearchIcon class="text-medium-emphasis mr-2" />
                            </template>
                        </v-text-field>

                        <v-divider class="w-100 my-0"></v-divider>

                        <!-- Bottom Row: Filters -->
                        <div class="d-flex flex-column flex-md-row gap-2 align-center px-2 pb-2">
                            <!-- Municipality -->
                            <v-select
                                v-model="selectedMunicipality"
                                :items="municipalityList"
                                placeholder="Vælg Kommune"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="flex-grow-1"
                                min-width="150"
                                bg-color="white"
                            >
                                <template v-slot:prepend-inner>
                                    <BuildingArchIcon class="text-medium-emphasis mr-2" size="18" />
                                </template>
                            </v-select>

                            <!-- Category -->
                            <v-select
                                v-model="selectedCategory"
                                :items="CATEGORY_OPTIONS"
                                placeholder="Kategori"
                                variant="outlined"
                                density="compact"
                                hide-details
                                clearable
                                class="flex-grow-1"
                                min-width="150"
                                bg-color="white"
                            >
                                <template v-slot:prepend-inner>
                                    <FilterIcon class="text-medium-emphasis mr-2" size="18" />
                                </template>
                            </v-select>

                            <!-- Phase -->
                            <v-select
                                v-model="selectedPhase"
                                :items="PHASE_OPTIONS"
                                placeholder="Fase"
                                variant="outlined"
                                density="compact"
                                hide-details
                                clearable
                                class="flex-grow-1"
                                min-width="150"
                                bg-color="white"
                            >
                                <template v-slot:prepend-inner>
                                    <FilterIcon class="text-medium-emphasis mr-2" size="18" />
                                </template>
                            </v-select>

                            <v-btn
                                color="primary"
                                height="40"
                                class="px-6 ml-md-2 search-button"
                                rounded="lg"
                                @click="performSearch"
                                :loading="isLoading"
                            >
                                Søg
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-container>
        </div>

        <!-- RESULTS SECTION -->
        <v-container>
            <div v-if="isLoading" class="text-center py-12">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-h6 text-medium-emphasis">Gennemgår arkiverne...</p>
            </div>

            <div v-else-if="error">
                <v-alert type="error" variant="tonal" border="start" class="mb-6">
                    {{ error }}
                </v-alert>
            </div>

            <div v-else-if="searchResults.length > 0">
                <div class="d-flex justify-space-between align-center mb-6">
                    <h2 class="text-h5 font-weight-bold section-title">
                        Fundet <span class="text-primary">{{ totalCount }}</span> resultater
                    </h2>
                    <!-- Only show if we have a filter active, otherwise redundant -->
                     <v-chip v-if="selectedMunicipality && selectedMunicipality !== 'Alle'" color="primary" variant="tonal">
                        {{ selectedMunicipality }}
                    </v-chip>
                </div>

                <v-row>
                    <v-col cols="12" v-for="doc in searchResults" :key="doc.id">
                        <v-card 
                            class="result-card cursor-pointer" 
                            elevation="0" 
                            variant="outlined"
                            @click="toggleExpand(doc.id)"
                            v-ripple
                        >
                            <div class="d-flex flex-column flex-md-row">
                                <!-- LEFT COLOR BAR (Context) -->
                                <div class="card-left-border bg-primary lighten-4 d-none d-md-block"></div>

                                <div class="pa-5 flex-grow-1">
                                    <div class="d-flex justify-space-between align-start mb-2">
                                        <div>
                                            <v-chip size="small" color="primary" class="mb-2 font-weight-bold" rounded="sm">
                                                {{ doc.municipality }}
                                            </v-chip>
                                            <span class="text-caption text-medium-emphasis ml-3">
                                                <CalendarIcon size="14" class="mr-1" style="vertical-align: text-bottom;" />
                                                {{ new Date(doc.date).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                                            </span>
                                        </div>
                                        <v-icon color="medium-emphasis">
                                            {{ expandedResults.has(doc.id) ? 'ChevronUpIcon' : 'ChevronDownIcon' }}
                                        </v-icon>
                                    </div>

                                    <h3 class="text-h5 font-weight-bold text-wrap mb-3 title-link">
                                        {{ doc.subject_title || doc.title }}
                                    </h3>

                                    <!-- HIGHLIGHT: Search Sentences (Why this matched) -->
                                    <div v-if="doc.search_sentences" class="search-highlight pa-3 rounded bg-grey-lighten-4 mb-4">
                                        <div class="d-flex align-center mb-1">
                                            <SearchIcon size="14" class="text-primary mr-2" />
                                            <span class="text-caption font-weight-bold text-primary">Søge-sætning</span>
                                        </div>
                                        <p class="text-body-2 font-italic mb-0 text-grey-darken-2">
                                            "... {{ doc.search_sentences }} ..."
                                        </p>
                                    </div>
                                    
                                     <!-- Summary -->
                                    <p class="text-body-1 text-medium-emphasis mb-4" style="max-width: 900px;" v-if="doc.summary">
                                        {{ doc.summary }}
                                    </p>

                                    <!-- EXPANDABLE DETAILS -->
                                    <v-expand-transition>
                                        <div v-if="expandedResults.has(doc.id)" class="mt-4 pt-4 border-t">
                                            <!-- Description -->
                                            <div v-if="doc.description" class="mb-4">
                                                <h4 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-1">Beskrivelse</h4>
                                                <p class="text-body-2">{{ doc.description }}</p>
                                            </div>

                                            <!-- Historical Context -->
                                            <div v-if="doc.historical_context" class="mb-4">
                                                <h4 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-1">Historisk Kontekst</h4>
                                                <p class="text-body-2 text-grey-darken-2 font-italic bg-grey-lighten-5 pa-3 rounded">
                                                    {{ doc.historical_context }}
                                                </p>
                                            </div>

                                            <div class="d-flex flex-wrap gap-4">
                                                <!-- Category -->
                                                <div v-if="doc.category">
                                                    <h4 class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Kategori</h4>
                                                    <v-chip size="small" variant="outlined" color="primary">
                                                        {{ doc.category }}
                                                    </v-chip>
                                                </div>

                                                <!-- Phase -->
                                                <div v-if="doc.phase">
                                                    <h4 class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Fase</h4>
                                                    <v-chip size="small" variant="outlined" color="secondary">
                                                        {{ doc.phase }}
                                                    </v-chip>
                                                </div>

                                                <!-- Amount (Moved here or kept in footer? Keeping in footer for quick glance, but maybe here too?) -->
                                            </div>
                                        </div>
                                    </v-expand-transition>

                                    <!-- Metadata Footer -->
                                    <div class="d-flex flex-wrap gap-4 align-center mt-4 pt-2">
                                        <div v-if="doc.decided_or_not !== null" class="d-flex align-center">
                                            <GavelIcon size="18" class="mr-1 text-medium-emphasis" />
                                            <span class="text-caption text-medium-emphasis">
                                                Beslutning: <strong :class="doc.decided_or_not ? 'text-success' : 'text-warning'">{{ doc.decided_or_not ? 'Truffet' : 'Afventer' }}</strong>
                                            </span>
                                        </div>
                                        
                                        <div v-if="doc.amount" class="d-flex align-center">
                                            <span class="text-caption font-weight-bold text-success px-2 py-1 bg-green-lighten-5 rounded">
                                                {{ doc.amount }} DKK
                                            </span>
                                        </div>

                                        <v-spacer></v-spacer>
                                        
                                        <!-- Read PDF Button (Stop Propagation) -->
                                        <v-btn 
                                            :href="doc.content_url" 
                                            target="_blank" 
                                            variant="text" 
                                            color="primary" 
                                            class="px-0"
                                            @click.stop
                                        >
                                            Læs Referat <FileTextIcon size="18" class="ml-1" />
                                        </v-btn>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- EMPTY STATE INITIAL -->
            <div v-else-if="!isLoading && searchResults.length === 0 && !searchQuery" class="empty-state text-center py-16 opacity-60">
                <SearchIcon size="80" stroke-width="1" class="mb-4 text-disabled" />
                <h3 class="text-h5 font-weight-regular">Klar til at søge</h3>
                <p class="text-body-1">Indtast et søgeord ovenfor for at gå på opdagelse i de kommunale referater.</p>
            </div>

             <!-- EMPTY STATE NO RESULTS -->
            <div v-else-if="!isLoading && searchResults.length === 0 && searchQuery" class="empty-state text-center py-16">
                <div class="text-h2 mb-2">🤷‍♂️</div>
                <h3 class="text-h5 font-weight-bold">Ingen resultater fundet</h3>
                <p class="text-body-1 text-medium-emphasis">Vi kunne ikke finde noget der matcher "{{ searchQuery }}". Prøv et andet søgeord.</p>
            </div>

        </v-container>
    </main>
</template>

<style scoped>
.page-container {
    min-height: 80vh;
}

/* HERO STYLES */
.hero-section {
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
    position: relative;
    overflow: hidden;
}

/* SEARCH CARD */
.search-card {
    transition: all 0.3s ease;
}
.search-card:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}

.custom-search-input :deep(input) {
    font-size: 1.1rem;
    padding-top: 10px;
    padding-bottom: 10px;
}

.municipality-select {
    min-width: 220px;
}

/* RESULT CARD */
.result-card {
    border: 1px solid rgba(0,0,0,0.08);
    transition: all 0.2s ease-in-out;
    background-color: white;
}
.result-card:hover {
    border-color: #1e88e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(30, 136, 229, 0.08) !important;
}

/* Left colored accent bar on cards */
.card-left-border {
    width: 6px;
    background-color: #1e88e5 !important;
    opacity: 0.8;
}

.search-highlight {
    border-left: 3px solid #1e88e5;
}

/* RESPONSIVE */
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

@media (max-width: 600px) {
    .hero-title {
        font-size: 2rem !important;
    }
    .search-button {
        width: 100%;
        margin-left: 0 !important;
        margin-top: 8px;
    }
}
</style>
