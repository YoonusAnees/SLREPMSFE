import { create } from "zustand";
import { http } from "../api/http";
import { getDriverByLicense } from "../api/drivers";

export const useOfficerStore = create((set) => ({
    violationTypes: [],

    // lookup state
    lookupLoading: false,
    lookupError: "",
    lookedUp: null, // { user, driver, vehicles }

    // dashboard state
    incidents: [],
    penalties: [],
    dashboardLoading: false,
    dashboardError: "",

    loadViolationTypes: async () => {
        try {
            const { data } = await http.get("/violationTypes/get");
            set({ violationTypes: Array.isArray(data) ? data : [] });
            return data;
        } catch (e) {
            throw e;
        }
    },

    loadOfficerDashboard: async () => {
        set({ dashboardLoading: true, dashboardError: "" });

        try {
            const [violationsRes, incidentsRes] = await Promise.all([
                http.get("/violationTypes/get"),
                http.get("/incidents"),
            ]);

            let penaltiesData = [];
            try {
                // only if you later create officer-specific endpoint
                const penaltiesRes = await http.get("/admin/penalties");
                penaltiesData = Array.isArray(penaltiesRes.data) ? penaltiesRes.data : [];
            } catch {
                penaltiesData = [];
            }

            set({
                violationTypes: Array.isArray(violationsRes.data) ? violationsRes.data : [],
                incidents: Array.isArray(incidentsRes.data) ? incidentsRes.data : [],
                penalties: penaltiesData,
                dashboardLoading: false,
                dashboardError: "",
            });

            return {
                violationTypes: violationsRes.data,
                incidents: incidentsRes.data,
                penalties: penaltiesData,
            };
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
        const { data } = await http.post(
            `/vehicles/verify/${encodeURIComponent(plateNo)}`
        );
        return data;
    },

    lookupDriverByLicense: async (licenseNo) => {
        const lic = (licenseNo || "").trim();

        if (lic.length < 5) {
            set({
                lookedUp: null,
                lookupError: "",
                lookupLoading: false,
            });
            return null;
        }

        set({ lookupLoading: true, lookupError: "" });

        try {
            const data = await getDriverByLicense(lic);
            set({
                lookedUp: data,
                lookupLoading: false,
                lookupError: "",
            });
            return data;
        } catch (e) {
            const msg = e?.response?.data?.message || "Driver lookup failed";
            set({
                lookedUp: null,
                lookupLoading: false,
                lookupError: msg,
            });
            throw e;
        }
    },

    clearLookup: () =>
        set({
            lookedUp: null,
            lookupError: "",
            lookupLoading: false,
        }),
}));