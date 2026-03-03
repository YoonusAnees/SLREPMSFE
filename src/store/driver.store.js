import { create } from "zustand";
import { http } from "../api/http";

export const useDriverStore = create((set) => ({
    me: null,
    vehicles: [],
    penalties: [],
    incidents: [],

    loadMe: async () => {
        const { data } = await http.get("/drivers/me");
        set({ me: data });
        return data;
    },

    updateMyUser: async (payload) => {
        const { data } = await http.put("/drivers/me/update", payload);
        return data;
    },

    loadVehicles: async () => {
        const { data } = await http.get("/vehicles/my");
        set({ vehicles: data });
        return data;
    },

    addVehicle: async (payload) => {
        const { data } = await http.post("/vehicles/add", payload);
        return data;
    },

    loadPenalties: async () => {
        const { data } = await http.get("/penalties/my");
        set({ penalties: data });
        return data;
    },

    createIncident: async (payload) => {
        const { data } = await http.post("/incidents", payload);
        return data;
    },

    loadIncidents: async () => {
        const { data } = await http.get("/incidents/me");
        set({ incidents: data });
        return data;
    },

    // POST /drivers/me → add license
    upsertMe: async (payload) => {
        const { data } = await http.post("/drivers/me", payload);
        set({ me: data });
        return data;
    },
}));