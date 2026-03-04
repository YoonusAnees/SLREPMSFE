// src/store/rescue.store.js
import { create } from "zustand";
import { http } from "../api/http";
import { useAuthStore } from "./auth.store";

export const useRescueStore = create((set) => ({
    me: null,
    myDispatches: [],
    loading: { me: false, dispatches: false, update: false, register: false },
    error: null,

    rescueRegister: async (payload) => {
        set((s) => ({ loading: { ...s.loading, register: true }, error: null }));
        try {
            const { data } = await http.post("/rescue/register", payload);

            useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
            useAuthStore.setState({ user: data.user });

            return data;
        } catch (e) {
            set({ error: e?.response?.data?.message || e.message });
            throw e;
        } finally {
            set((s) => ({ loading: { ...s.loading, register: false } }));
        }
    },

    loadMe: async () => {
        set((s) => ({ loading: { ...s.loading, me: true }, error: null }));
        try {
            const { data } = await http.get("/rescue/me");
            set({ me: data });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, me: false } }));
        }
    },

    loadMyDispatches: async () => {
        set((s) => ({ loading: { ...s.loading, dispatches: true }, error: null }));
        try {
            const { data } = await http.get("/dispatch/rescue/me");
            set({ myDispatches: data });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, dispatches: false } }));
        }
    },

    updateDispatchStatus: async ({ dispatchId, status }) => {
        set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
        try {
            const { data } = await http.patch("/dispatch/status", { dispatchId, status });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, update: false } }));
        }
    },
}));