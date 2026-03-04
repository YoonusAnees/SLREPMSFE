import { create } from "zustand";
import { http } from "../api/http";

export const useIncidentStore = create((set, get) => ({

    incidents: [],
    loading: {
        create: false,
        list: false,
    },

    createIncident: async (payload) => {
        set((s) => ({ loading: { ...s.loading, create: true } }));

        try {
            const { data } = await http.post("/incidents", payload);

            set((s) => ({
                incidents: [data, ...s.incidents],
            }));

            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, create: false } }));
        }
    },

    loadIncidents: async () => {
        set((s) => ({ loading: { ...s.loading, list: true } }));

        try {
            const { data } = await http.get("/incidents");

            set({
                incidents: data,
            });

            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, list: false } }));
        }
    },

    resetIncidents: () => {
        set({
            incidents: [],
            loading: {
                create: false,
                list: false,
            },
        });
    },

}));
