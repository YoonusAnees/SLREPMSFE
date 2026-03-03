import { create } from "zustand";
import { http } from "../api/http";
import { getDriverByLicense } from "../api/drivers";

export const useOfficerStore = create((set) => ({
    violationTypes: [],

    // ✅ lookup state
    lookupLoading: false,
    lookupError: "",
    lookedUp: null, // { user, driver, vehicles }

    loadViolationTypes: async () => {
        const { data } = await http.get("/violationTypes/get");
        set({ violationTypes: data });
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

    // ✅ NEW: lookup by license
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

    clearLookup: () => set({ lookedUp: null, lookupError: "", lookupLoading: false }),
}));