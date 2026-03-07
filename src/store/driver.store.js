import { create } from "zustand";
import { http } from "../api/http";

export const useDriverStore = create((set, get) => ({
    me: null,
    vehicles: [],
    penalties: [],
    incidents: [],
    loading: false,

    loadMe: async () => {
        const { data } = await http.get("/drivers/me");
        set({ me: data });
        return data;
    },

    updateMyUser: async (payload) => {
        const { data } = await http.put("/drivers/me/update", payload);

        set((state) => ({
            me: state.me
                ? {
                    ...state.me,
                    user: {
                        ...(state.me.user || {}),
                        ...data,
                    },
                }
                : state.me,
        }));

        return data;
    },

    loadVehicles: async () => {
        const { data } = await http.get("/vehicles/my");
        set({ vehicles: Array.isArray(data) ? data : [] });
        return data;
    },

    addVehicle: async (payload) => {
        const { data } = await http.post("/vehicles/add", payload);

        set((state) => ({
            vehicles: Array.isArray(state.vehicles)
                ? [data, ...state.vehicles]
                : [data],
        }));

        return data;
    },

    loadPenalties: async () => {
        const { data } = await http.get("/penalties/my");
        set({ penalties: Array.isArray(data) ? data : [] });
        return data;
    },

    createIncident: async (payload) => {
        const { data } = await http.post("/incidents", payload);

        set((state) => ({
            incidents: Array.isArray(state.incidents)
                ? [data, ...state.incidents]
                : [data],
        }));

        return data;
    },

    loadIncidents: async () => {
        const { data } = await http.get("/incidents/me");
        set({ incidents: Array.isArray(data) ? data : [] });
        return data;
    },

    upsertMe: async (payload) => {
        const { data } = await http.post("/drivers/me", payload);
        set({ me: data });
        return data;
    },

    loadDashboardData: async () => {
        set({ loading: true });

        try {
            const [meRes, vehiclesRes, penaltiesRes, incidentsRes] =
                await Promise.allSettled([
                    http.get("/drivers/me"),
                    http.get("/vehicles/my"),
                    http.get("/penalties/my"),
                    http.get("/incidents/my"),
                ]);

            const me =
                meRes.status === "fulfilled" ? meRes.value?.data ?? null : null;

            const vehicles =
                vehiclesRes.status === "fulfilled" && Array.isArray(vehiclesRes.value?.data)
                    ? vehiclesRes.value.data
                    : [];

            const penalties =
                penaltiesRes.status === "fulfilled" && Array.isArray(penaltiesRes.value?.data)
                    ? penaltiesRes.value.data
                    : [];

            const incidents =
                incidentsRes.status === "fulfilled" && Array.isArray(incidentsRes.value?.data)
                    ? incidentsRes.value.data
                    : [];

            set({
                me,
                vehicles,
                penalties,
                incidents,
                loading: false,
            });

            return { me, vehicles, penalties, incidents };
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },
}));