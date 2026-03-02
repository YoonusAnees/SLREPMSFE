import { create } from "zustand";

let idCounter = 1;

export const useUIStore = create((set, get) => ({
    toasts: [],
    globalLoading: false,

    setLoading: (v) => set({ globalLoading: v }),

    toast: (type, message, opts = {}) => {
        const id = String(idCounter++);
        const t = { id, type, message, duration: opts.duration ?? 3500 };
        set((s) => ({ toasts: [...s.toasts, t] }));
        window.setTimeout(() => get().dismissToast(id), t.duration);
    },

    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));