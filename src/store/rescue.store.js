import { create } from "zustand";
import { http } from "../api/http";

export const useRescueStore = create((set) => ({
    me: null,
    myDispatches: [],
    loading: false,
    error: null,

    rescueRegister: async (payload) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post("/rescue/register", payload);
            set({ loading: false });
            return data;
        } catch (e) {
            set({ error: e?.response?.data?.message || e.message, loading: false });
            throw e;
        }
    },

    loadMe: async () => {
        const { data } = await http.get("/rescue/me");
        set({ me: data });
        return data;
    },

    updateMe: async (payload) => {
        const { data } = await http.patch("/rescue/me", payload);
        set({ me: data });
        return data;
    },

    loadMyDispatches: async () => {
        const { data } = await http.get("/dispatches/me");
        set({ myDispatches: data });
        return data;
    },

    updateDispatchStatus: async (dispatchId, status) => {
        const { data } = await http.patch(`/dispatches/${dispatchId}/status`, { status });
        return data;
    },
}));