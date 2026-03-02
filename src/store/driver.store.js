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
        const { data } = await http.patch("/drivers/me/user", payload);
        return data;
    },

    loadVehicles: async () => {
        const { data } = await http.get("/vehicles/me");
        set({ vehicles: data });
        return data;
    },

    addVehicle: async (payload) => {
        const { data } = await http.post("/vehicles", payload);
        return data;
    },

    loadPenalties: async () => {
        const { data } = await http.get("/penalties/me");
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
}));