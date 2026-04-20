import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";

const API_BASE = import.meta.env.VITE_API_BASE || "http://192.168.1.6:4000/api";

export const http = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
    queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
    queue = [];
}

http.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error?.response?.status !== 401 || original?._retry) return Promise.reject(error);

        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
            useAuthStore.getState().logoutLocal();
            useUIStore.getState().toast("error", "Session expired. Please login again.");
            return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push({
                    resolve: (token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(http(original));
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;
        try {
            const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken }, {
                headers: { "Content-Type": "application/json" },
            });

            const newAccess = data.accessToken;
            const newRefresh = data.refreshToken || refreshToken;

            useAuthStore.getState().setTokens(newAccess, newRefresh);
            processQueue(null, newAccess);

            original.headers.Authorization = `Bearer ${newAccess}`;
            return http(original);
        } catch (e) {
            processQueue(e, null);
            useAuthStore.getState().logoutLocal();
            useUIStore.getState().toast("error", "Session expired. Please login again.");
            return Promise.reject(e);
        } finally {
            isRefreshing = false;
        }
    }
);