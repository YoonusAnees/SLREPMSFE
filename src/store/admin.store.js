import { create } from "zustand";
import { http } from "../api/http";

function asPage(res) {
    if (Array.isArray(res)) {
        return { rows: res, page: 1, limit: res.length, total: res.length };
    }
    return {
        rows: res?.rows ?? [],
        page: res?.page ?? 1,
        limit: res?.limit ?? 20,
        total: res?.total ?? 0,
    };
}

export const useAdminStore = create((set) => ({
    // ---- state ----
    dashboard: null,

    users: { rows: [], page: 1, limit: 20, total: 0 },
    penalties: { rows: [], page: 1, limit: 20, total: 0 },
    payments: { rows: [], page: 1, limit: 20, total: 0 },
    incidents: { rows: [], page: 1, limit: 20, total: 0 },

    loading: {
        dashboard: false,
        users: false,
        penalties: false,
        payments: false,
        incidents: false,
    },

    // ---- actions ----
    loadDashboard: async () => {
        set((s) => ({ loading: { ...s.loading, dashboard: true } }));
        try {
            const { data } = await http.get("/admin/dashboard");
            set({ dashboard: data });
            return data;
        } finally {
            set((s) => ({ loading: { ...s.loading, dashboard: false } }));
        }
    },

    loadUsers: async ({ page = 1, limit = 20, q, role } = {}) => {
        set((s) => ({ loading: { ...s.loading, users: true } }));
        try {
            const { data } = await http.get("/admin/users", { params: { page, limit, q, role } });
            const paged = asPage(data);
            set({ users: paged });
            return paged;
        } finally {
            set((s) => ({ loading: { ...s.loading, users: false } }));
        }
    },

    loadPenalties: async ({ page = 1, limit = 20, q, status } = {}) => {
        set((s) => ({ loading: { ...s.loading, penalties: true } }));
        try {
            const { data } = await http.get("/admin/penalties", { params: { page, limit, q, status } });
            const paged = asPage(data);
            set({ penalties: paged });
            return paged;
        } finally {
            set((s) => ({ loading: { ...s.loading, penalties: false } }));
        }
    },

    loadPayments: async ({ page = 1, limit = 20, q, status } = {}) => {
        set((s) => ({ loading: { ...s.loading, payments: true } }));
        try {
            const { data } = await http.get("/admin/payments", { params: { page, limit, q, status } });
            const paged = asPage(data);
            set({ payments: paged });
            return paged;
        } finally {
            set((s) => ({ loading: { ...s.loading, payments: false } }));
        }
    },

    loadIncidents: async ({ page = 1, limit = 20, status } = {}) => {
        set((s) => ({ loading: { ...s.loading, incidents: true } }));
        try {
            const { data } = await http.get("/admin/incidents", { params: { page, limit, status } });
            const paged = asPage(data);
            set({ incidents: paged });
            return paged;
        } finally {
            set((s) => ({ loading: { ...s.loading, incidents: false } }));
        }
    },

    resetAdmin: () => {
        set({
            dashboard: null,
            users: { rows: [], page: 1, limit: 20, total: 0 },
            penalties: { rows: [], page: 1, limit: 20, total: 0 },
            payments: { rows: [], page: 1, limit: 20, total: 0 },
            incidents: { rows: [], page: 1, limit: 20, total: 0 },
            loading: {
                dashboard: false,
                users: false,
                penalties: false,
                payments: false,
                incidents: false,
            },
        });
    },
}));