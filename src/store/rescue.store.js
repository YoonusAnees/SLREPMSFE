import { create } from "zustand";
import { http } from "../api/http";

export const useRescueStore = create((set) => ({
    me: null,
    myDispatches: [],
    loading: {
        me: false,
        dispatches: false,
        update: false,
        register: false,
    },
    error: null,

    rescueRegister: async (payload) => {
        set((s) => ({ loading: { ...s.loading, register: true }, error: null }));
        try {
            const { data } = await http.post("/rescue/register", payload);
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
        } catch (e) {
            set({ error: e?.response?.data?.message || e.message });
            throw e;
        } finally {
            set((s) => ({ loading: { ...s.loading, me: false } }));
        }
    },

    updateMe: async (payload) => {
        const { data } = await http.patch("/rescue/me", payload);
        set({ me: data });
        return data;
    },

    // ✅ THIS is the aligned endpoint
    loadMyDispatches: async () => {
        set((s) => ({ loading: { ...s.loading, dispatches: true }, error: null }));
        try {
            const { data } = await http.get("/dispatches/rescue/me");
            set({ myDispatches: data });
            return data;
        } catch (e) {
            set({ error: e?.response?.data?.message || e.message });
            throw e;
        } finally {
            set((s) => ({ loading: { ...s.loading, dispatches: false } }));
        }
    },

    // ✅ matches your backend: PATCH /dispatches/status
    updateDispatchStatus: async ({ dispatchId, status }) => {
        set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
        try {
            const { data } = await http.patch("/dispatches/status", { dispatchId, status });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, update: false } }));
        }
    },
}));