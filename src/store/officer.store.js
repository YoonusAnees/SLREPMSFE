import { create } from "zustand";
import { http } from "../api/http";
import { getDriverByLicense } from "../api/drivers";

export const useOfficerStore = create((set) => ({
    violationTypes: [],
    incidents: [],
    officerDashboard: null,

    lookupLoading: false,
    lookupError: "",
    lookedUp: null,

    dashboardLoading: false,
    dashboardError: "",

    loadOfficerDashboard: async () => {
        set({ dashboardLoading: true, dashboardError: "" });

        try {
            const [{ data: dashboard }, { data: violations }, { data: incidents }] =
                await Promise.all([
                    http.get("/officer/dashboard/me"),
                    http.get("/violationTypes/get"),
                    http.get("/incidents"),
                ]);

            set({
                officerDashboard: dashboard,
                violationTypes: Array.isArray(violations) ? violations : [],
                incidents: Array.isArray(incidents) ? incidents : [],
                dashboardLoading: false,
                dashboardError: "",
            });

            return dashboard;
        } catch (e) {
            set({
                dashboardLoading: false,
                dashboardError:
                    e?.response?.data?.message || "Failed to load officer dashboard",
            });
            throw e;
        }
    },

    issuePenalty: async (payload) => {
        const { data } = await http.post("/penalties", payload);
        return data;
    },

    verifyVehicle: async (plateNo) => {
        const { data } = await http.post(`/vehicles/verify/${encodeURIComponent(plateNo)}`);
        return data;
    },

    lookupDriverByLicense: async (licenseNo) => {
        const lic = (licenseNo || "").trim();

        if (lic.length < 5) {
            set({ lookedUp: null, lookupError: "", lookupLoading: false });
            return null;
        }

        set({ lookupLoading: true, lookupError: "" });

        try {
            const data = await getDriverByLicense(lic);
            set({ lookedUp: data, lookupLoading: false, lookupError: "" });
            return data;
        } catch (e) {
            const msg = e?.response?.data?.message || "Driver lookup failed";
            set({ lookedUp: null, lookupLoading: false, lookupError: msg });
            throw e;
        }
    },

    clearLookup: () =>
        set({ lookedUp: null, lookupError: "", lookupLoading: false }),

    loadViolationTypes: async () => {
        const { data } = await http.get("/violationTypes/get");
        set({ violationTypes: data });
    },
}));