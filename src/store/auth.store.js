import { create } from "zustand";
import { persist } from "zustand/middleware";
import { http } from "../api/http";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

            login: async (email, password) => {
                const { data } = await http.post("/auth/login", { email, password });
                set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
                return data;
            },

            hydrateMe: async () => {
                const { data } = await http.get("/auth/me");
                set({ user: data });
                return data;
            },

            logout: async () => {
                try { await http.post("/auth/logout"); } catch { }
                get().logoutLocal();
            },

            logoutLocal: () => set({ user: null, accessToken: null, refreshToken: null }),
        }),
        { name: "slrepsms-auth" }
    )
);