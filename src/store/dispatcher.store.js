import { create } from "zustand";
import { http } from "../api/http";

export const useDispatcherStore = create((set) => ({
    incidents: [],
    loading: false,
    error: null,

    loadIncidents: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get("/incidents");
            set({ incidents: data, loading: false });
            return data;
        } catch (e) {
            set({ error: e?.response?.data?.message || e.message, loading: false });
            throw e;
        }
    },

    nearestTeams: async ({ lat, lng, limit = 5 }) => {
        const { data } = await http.get(`/rescue-teams/nearest`, { params: { lat, lng, limit } });
        return data;
    },

    dispatchTeam: async ({ incidentId, rescueTeamId, notes }) => {
        const { data } = await http.post("/dispatches", { incidentId, rescueTeamId, notes });
        return data;
    },
}));