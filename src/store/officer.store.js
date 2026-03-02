import { create } from "zustand";
import { http } from "../api/http";

export const useOfficerStore = create((set) => ({
    violationTypes: [],

    loadViolationTypes: async () => {
        const { data } = await http.get("/violation-types");
        set({ violationTypes: data });
        return data;
    },

    seedViolationTypes: async (arr) => {
        const { data } = await http.post("/violation-types/seed", { items: arr });
        return data;
    },

    issuePenalty: async (payload) => {
        const { data } = await http.post("/penalties", payload);
        return data;
    },

    verifyVehicle: async (plateNo) => {
        const { data } = await http.post(`/vehicles/verify/${encodeURIComponent(plateNo)}`);
        return data;
    },
}));