import { create } from "zustand";
import { http } from "../api/http";

export const useDispatcherStore = create((set) => ({
    incidents: [],
    loading: {
        incidents: false,
        nearest: false,
        dispatch: false,
        update: false,
    },
    stats: null,
    myDispatches: [],
    error: null,

    loadIncidents: async () => {
        set((s) => ({ loading: { ...s.loading, incidents: true }, error: null }));
        try {
            const { data } = await http.get("/incidents");
            set((s) => ({ incidents: data, loading: { ...s.loading, incidents: false } }));
            return data;
        } catch (e) {
            set((s) => ({
                error: e?.response?.data?.message || e.message,
                loading: { ...s.loading, incidents: false },
            }));
            throw e;
        }
    },

    // ✅ correct path: /dispatches/nearest
    nearestTeams: async ({ lat, lng, limit = 5, maxDistanceMeters = 30000 }) => {
        set((s) => ({ loading: { ...s.loading, nearest: true }, error: null }));
        try {
            const { data } = await http.post("/dispatch/nearest", {
                lat: Number(lat),
                lng: Number(lng),
                limit,
                maxDistanceMeters,
            });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, nearest: false } }));
        }
    },

    // ✅ correct path: /dispatches
    dispatchTeam: async ({ incidentId, rescueTeamId, notes }) => {
        set((s) => ({ loading: { ...s.loading, dispatch: true }, error: null }));
        try {
            const { data } = await http.post("/dispatch", { incidentId, rescueTeamId, notes });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, dispatch: false } }));
        }
    },

    // ✅ correct path: /dispatches/status
    updateDispatchStatus: async ({ dispatchId, status }) => {
        set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
        try {
            const { data } = await http.patch("/dispatch/status", { dispatchId, status });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, update: false } }));
        }
    },

    // ✅ correct path: /dispatches/stats
    loadStats: async () => {
        const { data } = await http.get("/dispatch/stats");
        set({ stats: data });
        return data;
    },

    // ✅ dispatcher “me” (dispatches created by this dispatcher)
    loadMyDispatches: async () => {
        const { data } = await http.get("/dispatch/me");
        set({ myDispatches: data });
        return data;
    },
}));