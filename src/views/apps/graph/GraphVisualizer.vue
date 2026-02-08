<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useGraphStore } from "@/stores/apps/graph";
import { VNetworkGraph, VEdgeLabel } from "v-network-graph";
import "v-network-graph/lib/style.css";
import * as vNG from "v-network-graph";
import { ForceLayout } from "v-network-graph/lib/force-layout";
import { CATEGORY_OPTIONS, PHASE_OPTIONS } from "@/utils/constants";
import { FilterIcon, SearchIcon, CalendarIcon, FileTextIcon, ChevronDownIcon, ChevronUpIcon } from 'vue-tabler-icons';

// Store
const store = useGraphStore();
import { useAuth0 } from '@auth0/auth0-vue';
const { getAccessTokenSilently } = useAuth0();

// Local state
const searchWait = ref<any>(null); // Debounce
const selectedSearchItem = ref<any>(null);
const selectedNodes = ref<string[]>([]);
const selectedCategory = ref<string | null>(null);
const selectedPhase = ref<string | null>(null);
const hoverNodeId = ref<string | null>(null); // For focus mode

// Helper for Dimming
const isDimmed = (nodeId: string) => {
    if (!hoverNodeId.value && selectedNodes.value.length === 0) return false;
    
    const focusId = hoverNodeId.value || (selectedNodes.value.length > 0 ? selectedNodes.value[0] : null);
    if (!focusId) return false;
    if (nodeId === focusId) return false;

    // Check if connected
    const edges = store.edges;
    let isConnected = false;
    for (const key in edges) {
        const e = edges[key];
        if ((e.source_id.toString() === focusId && e.target_id.toString() === nodeId) ||
            (e.target_id.toString() === focusId && e.source_id.toString() === nodeId)) {
            isConnected = true;
            break;
        }
    }
    
    return !isConnected;
};

const isEdgeDimmed = (edge: any) => {
    if (!hoverNodeId.value && selectedNodes.value.length === 0) return false;
    const focusId = hoverNodeId.value || (selectedNodes.value.length > 0 ? selectedNodes.value[0] : null);
    if (!focusId) return false;

    return edge.source !== focusId && edge.target !== focusId;
};

// Graph Configs
const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: true,
        createSimulation: (d3: any, nodes: any, edges: any) => {
          const forceLink = d3.forceLink(edges).id((d: any) => d.id);
          return d3
            .forceSimulation(nodes)
            .force("edge", forceLink.distance(120)) 
            .force("charge", d3.forceManyBody().strength(-800)) 
            .force("center", d3.forceCenter().strength(0.05))
            .force("collide", d3.forceCollide(40).strength(0.6)) 
            .alphaMin(0.001);
        },
      }),
      scalingObjects: true,
      minZoomLevel: 0.1,
      maxZoomLevel: 16,
    },
    node: {
      selectable: true,
      normal: {
        type: "circle", // Overridden by template, but good fallback
        radius: 24, 
        color: (node: any) => {
           if (node.label === 'MUNICIPALITY') return '#00695C'; 
           if (node.label === 'COMPANY') return '#1565C0'; 
           return '#455A64'; 
        },
      },
      label: {
          visible: false, // Disabled default label to prevent double rendering
          fontSize: 13,
          color: '#37474F', 
          fontFamily: "Inter, sans-serif",
          margin: 6,
      },
      hover: {
        radius: 26, // Template handles this via scale/shadow
      },
      selected: {
        radius: 28,
        color: "#D84315",
      },
      focusring: {
        visible: false, // Custom halo in template
      },
    },
    edge: {
      normal: {
        width: 2, 
        color: "#B0BEC5", 
        dasharray: "0",
        linecap: "round",
      },
      label: {
          fontSize: 11,
          color: "#546E7A",
          fontFamily: "Inter, sans-serif",
      },
      hover: {
        width: 3,
        color: "#37474F",
      },
      selected: {
        width: 3,
        color: "#D84315",
        dasharray: "0",
      },
      marker: {
        target: {
          type: "arrow",
          width: 4,
          height: 4,
          margin: -1,
        },
      },
    },
  })
);

// Actions
const onSearchInput = (value: string) => {
    // Debounce search
    clearTimeout(searchWait.value);
    searchWait.value = setTimeout(async () => {
        try {
            const token = await getAccessTokenSilently();
            store.searchNodes(value, token);
        } catch (e) {
            console.error("Auth0 Token Error", e);
            store.error = "Failed to get auth token";
        }
    }, 300);
};

// Helper to load context with filters
const loadGraphContext = async (nodeId: string | number) => {
    try {
        const token = await getAccessTokenSilently();
        store.fetchGraphContext(nodeId, token, {
            category: selectedCategory.value,
            phase: selectedPhase.value
        });
    } catch (e) {
         console.error("Auth0 Token Error", e);
    }
};

const onNodeSelected = async (item: any) => {
    if (item) {
        await loadGraphContext(item.id);
    }
};

// Watch filters to reload graph if a node is already selected
watch([selectedCategory, selectedPhase], () => {
    const currentNode = store.selectedNodeId; // Use ID from store? 
    // Wait, store.selectedNodeId tracks click on graph node. search uses onNodeSelected item.
    // Ideally we track the "center node" ID separately or rely on search.
    // Let's assume onNodeSelected sets the "Center". 
    // But store.selectedNodeId is for Sidebar details.
    // Does store track the "context center"?
    // Looking at store: fetchGraphContext fetches nodes/edges but doesn't explicitly store "rootId".
    // I will use selectedSearchItem ID if available, or just rely on manual re-search.
    // Better: If selectedSearchItem exists, reload.
    if (selectedSearchItem.value?.id) {
        loadGraphContext(selectedSearchItem.value.id);
    }
});

// Computed
const nodes = computed(() => store.nodes);
const edges = computed(() => {
    const raw = store.edges;
    const mapped: Record<string, any> = {};
    for (const key in raw) {
        mapped[key] = {
            ...raw[key],
            source: String(raw[key].source_id),
            target: String(raw[key].target_id),
        };
    }
    return mapped;
});

// Event Handlers
const eventHandlers: vNG.EventHandlers = {
  "node:click": ({ node }) => {
    console.log("Clicked node:", node);
    store.setSelectedNode(node);
  },
  "edge:click": ({ edge }) => {
    console.log("Clicked edge:", edge);
    store.setSelectedEdge(edge || null);
  },
};

const selectedNodeDetails = computed(() => {
    return store.getSelectedNode;
});

const selectedEdgeDetails = computed(() => {
    return store.getSelectedEdge;
});

</script>

<template>
  <div class="graph-page">
    <div class="main-layout d-flex fill-height">
        <!-- Graph Area with Overlay -->
        <div class="graph-wrapper relative-container flex-grow-1">
            
            <!-- Floating Search Overlay -->
            <div class="floating-overlay">
                <v-card class="glass-panel" elevation="4">
                    <v-card-text class="pa-4">
                        <v-alert
                            v-if="store.error"
                            type="error"
                            class="mb-3"
                            density="compact"
                            closable
                            @click:close="store.error = null"
                        >
                            {{ store.error }}
                        </v-alert>

                        <v-autocomplete
                            v-model="selectedSearchItem"
                            :items="store.searchResults"
                            item-title="name"
                            item-value="id"
                            label="Search Network"
                            variant="outlined"
                            density="compact"
                            hide-details
                            return-object
                            @update:search="onSearchInput"
                            @update:model-value="onNodeSelected"
                            no-filter
                            placeholder="Find company or municipality..."
                            bg-color="transparent"
                            class="search-input"
                        >
                            <template v-slot:prepend-inner>
                                <SearchIcon size="20" class="text-medium-emphasis mr-1" />
                            </template>
                            <template v-slot:item="{ props, item }">
                                <v-list-item
                                    v-bind="props"
                                    :subtitle="item.raw.label"
                                    class="search-result-item"
                                ></v-list-item>
                            </template>
                        </v-autocomplete>

                        <!-- Filters -->
                        <div class="d-flex gap-2 mt-3">
                            <v-select
                                v-model="selectedCategory"
                                :items="CATEGORY_OPTIONS"
                                placeholder="Category"
                                variant="outlined"
                                density="compact"
                                hide-details
                                clearable
                                class="flex-grow-1 filter-select"
                                bg-color="transparent"
                            >
                            </v-select>

                            <v-select
                                v-model="selectedPhase"
                                :items="PHASE_OPTIONS"
                                placeholder="Phase"
                                variant="outlined"
                                density="compact"
                                hide-details
                                clearable
                                class="flex-grow-1 filter-select"
                                bg-color="transparent"
                            >
                            </v-select>
                        </div>
                    </v-card-text>
                </v-card>
            </div>

            <!-- Graph Canvas -->
            <div class="graph-background fill-height">
                <v-network-graph
                    v-if="Object.keys(nodes).length > 0"
                    class="graph-canvas"
                    :nodes="nodes"
                    :edges="edges"
                    :configs="configs"
                    v-model:selected-nodes="selectedNodes"
                    :event-handlers="eventHandlers"
                >
                    <!-- Custom Node Rendering -->
                    <template #override-node="{ nodeId, scale, config, ...slotProps }">
                        <!-- Shadow Filter Defs -->
                        <defs>
                            <filter id="shadow-selected" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
                            </filter>
                            <filter id="shadow-hover" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
                            </filter>
                        </defs>

                        <!-- Node Shape Group -->
                        <g 
                            class="node-group" 
                            :class="{ 'dimmed': isDimmed(nodeId) }"
                            @mouseenter="hoverNodeId = nodeId"
                            @mouseleave="hoverNodeId = null"
                        >
                            <!-- Selection Halo (if selected) -->
                            <circle 
                                v-if="selectedNodes.includes(nodeId)" 
                                :r="config.radius + 6" 
                                fill="none" 
                                stroke="#D84315" 
                                stroke-width="2" 
                                opacity="0.6"
                            />

                            <!-- MUNICIPALITY SHAPE (Rounded Rect) -->
                            <g v-if="nodes[nodeId].label === 'MUNICIPALITY'">
                                <rect 
                                    :x="-config.radius" 
                                    :y="-config.radius" 
                                    :width="config.radius * 2" 
                                    :height="config.radius * 2" 
                                    :fill="config.color" 
                                    rx="8" 
                                    :filter="selectedNodes.includes(nodeId) ? 'url(#shadow-selected)' : 'url(#shadow-hover)'"
                                    stroke="white"
                                    stroke-width="2"
                                />
                                <!-- Icon: Capitol/Bank -->
                                <path d="M2,10 L12,4 L22,10 L22,20 L2,20 Z M4,18 L8,18 L8,12 L4,12 Z M10,18 L14,18 L14,12 L10,12 Z M16,18 L20,18 L20,12 L16,12 Z" 
                                    fill="white" 
                                    transform="translate(-12, -12)"
                                    opacity="0.9"
                                />
                            </g>

                            <!-- COMPANY SHAPE (Circle) -->
                            <g v-else>
                                <circle 
                                    :r="config.radius" 
                                    :fill="config.color" 
                                    :filter="selectedNodes.includes(nodeId) ? 'url(#shadow-selected)' : 'url(#shadow-hover)'"
                                    stroke="white"
                                    stroke-width="2"
                                />
                                <!-- Icon: Building -->
                                <path d="M6,22 L18,22 L18,2 L6,2 Z M8,4 L10,4 L10,6 L8,6 Z M12,4 L14,4 L14,6 L12,6 Z M8,8 L10,8 L10,10 L8,10 Z M12,8 L14,8 L14,10 L12,10 Z M8,12 L10,12 L10,14 L8,14 Z M12,12 L14,12 L14,14 L12,14 Z M8,16 L10,16 L10,18 L8,18 Z M12,16 L14,16 L14,18 L12,18 Z"
                                    fill="white" 
                                    transform="translate(-12, -12)"
                                    opacity="0.9"
                                />
                            </g>

                            <!-- Label -->
                            <text 
                                :x="0"
                                :y="config.radius + 18"
                                text-anchor="middle"
                                font-size="13"
                                fill="#37474F"
                                style="pointer-events: none; font-family: 'Inter', sans-serif;"
                                font-weight="500"
                            >
                                {{ nodes[nodeId].name }}
                            </text>
                        </g>

                    </template>

                    <template #edge-label="{ edge, ...slotProps }">
                        <v-edge-label 
                            :text="edge.relation" 
                            align="center" 
                            vertical-align="above" 
                            v-bind="slotProps" 
                            :style="{ opacity: isEdgeDimmed(edge) ? 0.1 : 1 }"
                        />
                    </template>
                </v-network-graph>
                
                <div v-else class="d-flex align-center justify-center fill-height text-medium-emphasis">
                    <div class="text-center">
                        <v-icon size="64" class="mb-4 text-disabled">mdi-vector-circle</v-icon>
                        <h3 class="text-h5 text-grey-darken-1">Interactive Network Graph</h3>
                        <p class="text-body-2 text-grey">Use the search to explore connections</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar / Details -->
        <div class="details-sidebar" v-if="selectedNodeDetails || selectedEdgeDetails">
            <!-- Node Details -->
            <v-card v-if="selectedNodeDetails" class="details-card h-100 border-0" rounded="0">
                <v-card-title class="bg-surface text-primary d-flex align-center py-4 px-5 border-bottom">
                    <div>
                        <div class="text-h6 font-weight-bold">{{ selectedNodeDetails.name }}</div>
                        <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis letter-spacing-1">
                            {{ selectedNodeDetails.label }}
                        </div>
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-5">
                    <div class="text-overline mb-2 text-medium-emphasis">Properties</div>
                    <v-table density="compact" class="properties-table">
                        <tbody>
                            <tr v-for="(value, key) in selectedNodeDetails.properties" :key="key">
                                <td class="font-weight-medium text-grey-darken-2">{{ key }}</td>
                                <td class="text-right text-grey-darken-3">{{ value }}</td>
                            </tr>
                             <tr v-if="!selectedNodeDetails.properties || Object.keys(selectedNodeDetails.properties).length === 0">
                                <td colspan="2" class="text-caption text-center text-disabled font-italic">No properties available</td>
                            </tr>
                        </tbody>
                    </v-table>
                    
                    <div class="mt-6 pt-4 border-top">
                        <div class="text-caption text-disabled">System ID</div>
                        <div class="text-caption font-mono">{{ selectedNodeDetails.id }}</div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- Edge Sidebar -->
            <v-card v-if="selectedEdgeDetails" class="details-card h-100 border-0" rounded="0">
                <div class="pa-5 h-100 d-flex flex-column">
                    <!-- Header -->
                    <div class="d-flex justify-space-between align-start mb-3">
                        <v-chip 
                            v-if="selectedEdgeDetails.properties?.municipality || selectedEdgeDetails.municipality" 
                            size="small" 
                            color="secondary" 
                            variant="flat"
                            class="font-weight-bold" 
                            rounded="sm"
                        >
                            {{ selectedEdgeDetails.properties?.municipality || selectedEdgeDetails.municipality || 'Unknown Muni' }}
                        </v-chip>
                        <span class="text-caption text-medium-emphasis d-flex align-center">
                            <CalendarIcon size="14" class="mr-1" />
                            {{ new Date(selectedEdgeDetails.meeting_date || selectedEdgeDetails.properties?.meeting_date).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                        </span>
                    </div>

                    <!-- Title -->
                    <h3 class="text-h6 font-weight-bold text-wrap mb-4" style="line-height: 1.4; color: #263238;">
                        {{ selectedEdgeDetails.subject_title || selectedEdgeDetails.properties?.subject_title || 'No Title' }}
                    </h3>

                    <!-- Actions -->
                    <v-btn
                        v-if="selectedEdgeDetails.properties?.content_url || selectedEdgeDetails.content_url"
                        :href="selectedEdgeDetails.properties?.content_url || selectedEdgeDetails.content_url"
                        target="_blank"
                        variant="tonal"
                        color="primary"
                        class="mb-6 text-none"
                        block
                        prepend-icon="mdi-file-document-outline"
                    >
                        View Original PDF
                    </v-btn>

                    <v-divider class="mb-4"></v-divider>

                    <!-- Content -->
                    <div class="flex-grow-1 overflow-y-auto pr-2 custom-scrollbar">
                        <!-- Description -->
                        <div v-if="selectedEdgeDetails.description || selectedEdgeDetails.properties?.description" class="mb-5">
                            <h4 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">Summary</h4>
                            <p class="text-body-2 text-grey-darken-3" style="line-height: 1.6;">
                                {{ selectedEdgeDetails.description || selectedEdgeDetails.properties?.description }}
                            </p>
                        </div>

                        <!-- Historical Context -->
                        <div v-if="selectedEdgeDetails.historical_context || selectedEdgeDetails.properties?.historical_context" class="mb-5">
                            <h4 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">Context</h4>
                            <div class="text-body-2 text-grey-darken-3 bg-blue-grey-lighten-5 pa-3 rounded border-left-primary">
                                {{ selectedEdgeDetails.historical_context || selectedEdgeDetails.properties?.historical_context }}
                            </div>
                        </div>

                        <!-- Metadata Grid -->
                        <div class="d-flex flex-wrap gap-2 mb-4">
                            <v-chip v-if="selectedEdgeDetails.category || selectedEdgeDetails.properties?.category"
                                size="small" variant="outlined" color="primary" class="font-weight-medium">
                                {{ selectedEdgeDetails.category || selectedEdgeDetails.properties?.category }}
                            </v-chip>
                            <v-chip v-if="selectedEdgeDetails.phase || selectedEdgeDetails.properties?.phase"
                                size="small" variant="outlined" color="info" class="font-weight-medium">
                                {{ selectedEdgeDetails.phase || selectedEdgeDetails.properties?.phase }}
                            </v-chip>
                        </div>

                        <!-- Tech Details -->
                         <v-expansion-panels variant="accordion" class="flat-panels">
                             <v-expansion-panel elevation="0" bg-color="transparent">
                                 <v-expansion-panel-title class="pa-0 text-caption text-disabled" style="min-height: 32px;">
                                     More Details
                                 </v-expansion-panel-title>
                                 <v-expansion-panel-text class="pa-0">
                                     <v-table density="compact" class="text-caption bg-transparent mt-2">
                                        <tbody>
                                            <tr v-for="(value, key) in selectedEdgeDetails.properties" :key="key">
                                                <td class="text-medium-emphasis pr-2">{{ key }}</td>
                                                <td class="text-truncate text-high-emphasis" style="max-width: 150px;">{{ value }}</td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                 </v-expansion-panel-text>
                             </v-expansion-panel>
                         </v-expansion-panels>
                    </div>
                </div>
            </v-card>
        </div>
    </div>
  </div>
</template>

<style scoped>
.node-group {
    transition: opacity 0.3s ease;
    cursor: pointer;
}

.node-group.dimmed {
    opacity: 0.1;
}

.graph-page {
    height: calc(100vh - 100px);
    background-color: #f5f7fa; /* Light grey base */
}

.graph-wrapper {
    position: relative;
    overflow: hidden;
    /* Dot Grid Background */
    background-color: #f8fafc;
    background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
    background-size: 24px 24px;
}

.floating-overlay {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 340px;
    z-index: 10;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
    border-radius: 16px;
}

.search-input :deep(.v-field__outline__start),
.search-input :deep(.v-field__outline__end),
.filter-select :deep(.v-field__outline__start),
.filter-select :deep(.v-field__outline__end) {
    border-color: rgba(0, 0, 0, 0.08) !important;
}

.graph-canvas {
    width: 100%;
    height: 100%;
}

.details-sidebar {
    width: 360px;
    min-width: 360px;
    border-left: 1px solid rgba(0,0,0,0.06);
    background: #ffffff;
    z-index: 5;
    box-shadow: -4px 0 24px rgba(0,0,0,0.02);
}

.border-bottom {
    border-bottom: 1px solid rgba(0,0,0,0.06);
}

.border-top {
    border-top: 1px solid rgba(0,0,0,0.06);
}

.border-left-primary {
    border-left: 3px solid #1565C0;
}

.font-mono {
    font-family: 'Roboto Mono', monospace;
}

.letter-spacing-1 {
    letter-spacing: 1px;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.2);
}
</style>
