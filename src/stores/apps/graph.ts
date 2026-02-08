import { defineStore } from 'pinia';
import axios from '@/utils/axios';
import { useAuthStore } from '@/stores/auth';

// Interfaces matching the Backend Response
export interface Node {
    id: number;
    label: string;
    name: string;
    properties: Record<string, any>;
}

export interface Edge {
    id: number;
    source_id: number;
    target_id: number;
    relation: string;
    weight: number;
    // Enhanced properties from join
    subject_title?: string;
    description?: string;
    municipality?: string;
    content_url?: string;
    historical_context?: string;
    meeting_date?: string;
    category?: string;
    phase?: string;
    properties?: Record<string, any>;
}

export interface GraphState {
    nodes: Record<string, Node>;
    edges: Record<string, Edge>;
    loading: boolean;
    error: string | null;
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    searchResults: Node[];
}

export const useGraphStore = defineStore({
    id: 'graph',
    state: (): GraphState => ({
        nodes: {},
        edges: {},
        loading: false,
        error: null,
        selectedNodeId: null,
        selectedEdgeId: null,
        searchResults: [],
    }),
    actions: {
        async searchNodes(query: string, token: string) {
            if (!query) return;
            try {
                // Ensure backend has: @app.get("/graph/search?q=...")
                const response = await axios.get(`/graph/search?q=${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.searchResults = response.data;
                // clear error if successful
                if (this.searchResults.length === 0) {
                    // logic for empty results? v-autocomplete handles empty list
                }
                this.error = null;
            } catch (error: any) {
                console.error("Search failed:", error);
                // content/utils/axios.ts interceptor unwraps the error!
                if (typeof error === 'string') {
                    this.error = error; // e.g., "Wrong Services"
                } else if (error && error.detail) {
                    this.error = `Backend: ${JSON.stringify(error.detail)}`;
                } else {
                    this.error = JSON.stringify(error);
                }
                this.searchResults = [];
            }
        },
        async fetchGraphContext(entityId: string | number, token: string, filters?: { category?: string | null, phase?: string | null }) {
            this.loading = true;
            this.error = null;
            try {
                let url = `/graph/context?entity_id=${entityId}`;
                if (filters?.category) url += `&category=${encodeURIComponent(filters.category)}`;
                if (filters?.phase) url += `&phase=${encodeURIComponent(filters.phase)}`;

                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // The backend returns { nodes: {...}, edges: {...} }
                this.nodes = response.data.nodes;
                this.edges = response.data.edges;
            } catch (error: any) {
                console.error("Failed to fetch graph context:", error);

                // The axios interceptor unwraps the error to: error.response.data OR "Wrong Services"
                // So 'error' IS key/value data (e.g. { detail: "..." }) OR a string.

                if (typeof error === 'string') {
                    this.error = error;
                } else if (error && error.detail) {
                    // Check if detail is string or object/array
                    const backendDetail = error.detail;
                    this.error = typeof backendDetail === 'string'
                        ? backendDetail
                        : JSON.stringify(backendDetail);
                } else if (error && error.message) {
                    this.error = error.message;
                } else {
                    this.error = JSON.stringify(error) || "Unknown error occurred";
                }
            } finally {
                this.loading = false;
            }
        },
        setSelectedNode(nodeId: string | null) {
            this.selectedNodeId = nodeId;
            if (nodeId) this.selectedEdgeId = null; // Clear edge selection
        },
        setSelectedEdge(edgeId: string | null) {
            this.selectedEdgeId = edgeId;
            if (edgeId) this.selectedNodeId = null; // Clear node selection
        },
        // Helper to clear graph if needed
        clearGraph() {
            this.nodes = {};
            this.edges = {};
            this.selectedNodeId = null;
            this.selectedEdgeId = null;
        }
    },
    getters: {
        // v-network-graph expects separate objects/arrays.
        // The store already matches the structure { nodes: {}, edges: {} } which is compatible with v-network-graph data prop if configured right,
        // or we can pass it directly.
        graphData: (state) => ({
            nodes: state.nodes,
            edges: state.edges
        }),
        getSelectedNode: (state) => {
            if (!state.selectedNodeId) return null;
            return state.nodes[state.selectedNodeId];
        },
        getSelectedEdge: (state) => {
            if (!state.selectedEdgeId) return null;
            return state.edges[state.selectedEdgeId];
        }
    }
});
