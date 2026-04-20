import { create } from "zustand";
import { http } from "../api/http";

function normalizeRows(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    return [];
}

function calcPublicStats(rows) {
    const total = rows.length;

    const accidents = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return (
            t.includes("accident") ||
            t.includes("collision") ||
            t.includes("crash")
        );
    }).length;

    const breakdowns = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return t.includes("breakdown");
    }).length;

    const emergency = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return (
            t.includes("emergency") ||
            t.includes("rescue") ||
            t.includes("ambulance") ||
            t.includes("medical") ||
            t.includes("fire")
        );
    }).length;

    const pending = rows.filter((i) =>
        ["NEW", "PENDING", "OPEN", "SUBMITTED", "IN_PROGRESS", "DISPATCHED"].includes(
            String(i?.status || "").toUpperCase(),
        ),
    ).length;

    const resolved = rows.filter((i) =>
        ["RESOLVED", "CLOSED", "COMPLETED"].includes(
            String(i?.status || "").toUpperCase(),
        ),
    ).length;

    return {
        total,
        accidents,
        breakdowns,
        emergency,
        pending,
        resolved,
    };
}

function calcCategoryBreakdown(rows) {
    const accidentCount = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return (
            t.includes("accident") ||
            t.includes("collision") ||
            t.includes("crash")
        );
    }).length;

    const breakdownCount = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return t.includes("breakdown");
    }).length;

    const rescueCount = rows.filter((i) => {
        const t = String(i?.type || i?.category || i?.title || "").toLowerCase();
        return (
            t.includes("rescue") ||
            t.includes("emergency") ||
            t.includes("medical") ||
            t.includes("fire")
        );
    }).length;

    const otherCount = Math.max(
        rows.length - accidentCount - breakdownCount - rescueCount,
        0,
    );

    const total = rows.length || 1;

    return [
        {
            label: "Accidents",
            count: accidentCount,
            percent: Math.round((accidentCount / total) * 100),
            color: "bg-red-500",
        },
        {
            label: "Breakdowns",
            count: breakdownCount,
            percent: Math.round((breakdownCount / total) * 100),
            color: "bg-orange-400",
        },
        {
            label: "Rescue / Emergency",
            count: rescueCount,
            percent: Math.round((rescueCount / total) * 100),
            color: "bg-emerald-500",
        },
        {
            label: "Other",
            count: otherCount,
            percent: Math.round((otherCount / total) * 100),
            color: "bg-indigo-500",
        },
    ];
}

export const usePublicStore = create((set, get) => ({
    incidents: [],
    recentIncidents: [],
    stats: {
        total: 0,
        accidents: 0,
        breakdowns: 0,
        emergency: 0,
        pending: 0,
        resolved: 0,
    },
    categoryBreakdown: [],
    loading: {
        home: false,
        incidents: false,
        submit: false,
    },
    error: null,

    loadPublicHomeData: async () => {
        set((s) => ({
            loading: { ...s.loading, home: true },
            error: null,
        }));

        try {
            const { data } = await http.get("/public/incidents");
            const rows = normalizeRows(data);

            const stats = calcPublicStats(rows);
            const categoryBreakdown = calcCategoryBreakdown(rows);
            const recentIncidents = [...rows]
                .sort(
                    (a, b) =>
                        new Date(b?.createdAt || b?.reportedAt || 0) -
                        new Date(a?.createdAt || a?.reportedAt || 0),
                )
                .slice(0, 6);

            set((s) => ({
                incidents: rows,
                recentIncidents,
                stats,
                categoryBreakdown,
                loading: { ...s.loading, home: false },
            }));

            return { incidents: rows, recentIncidents, stats, categoryBreakdown };
        } catch (e) {
            set((s) => ({
                error:
                    e?.response?.data?.message ||
                    e.message ||
                    "Failed to load public data",
                loading: { ...s.loading, home: false },
            }));
            throw e;
        }
    },

    loadPublicIncidents: async () => {
        set((s) => ({
            loading: { ...s.loading, incidents: true },
            error: null,
        }));

        try {
            const { data } = await http.get("/public/incidents");
            const rows = normalizeRows(data);

            set((s) => ({
                incidents: rows,
                loading: { ...s.loading, incidents: false },
            }));

            return rows;
        } catch (e) {
            set((s) => ({
                error:
                    e?.response?.data?.message ||
                    e.message ||
                    "Failed to load incidents",
                loading: { ...s.loading, incidents: false },
            }));
            throw e;
        }
    },

    submitPublicIncident: async (payload) => {
        set((s) => ({
            loading: { ...s.loading, submit: true },
            error: null,
        }));

        try {
            const { data } = await http.post("/public/incidents", payload);

            const currentRows = Array.isArray(get().incidents) ? get().incidents : [];
            const nextRows = [data, ...currentRows.filter((x) => x?.id !== data?.id)];
            const recentIncidents = [...nextRows]
                .sort(
                    (a, b) =>
                        new Date(b?.createdAt || b?.reportedAt || 0) -
                        new Date(a?.createdAt || a?.reportedAt || 0),
                )
                .slice(0, 6);

            set((s) => ({
                incidents: nextRows,
                recentIncidents,
                stats: calcPublicStats(nextRows),
                categoryBreakdown: calcCategoryBreakdown(nextRows),
                loading: { ...s.loading, submit: false },
            }));

            return data;
        } catch (e) {
            set((s) => ({
                error:
                    e?.response?.data?.message ||
                    e.message ||
                    "Failed to submit incident",
                loading: { ...s.loading, submit: false },
            }));
            throw e;
        }
    },

    resetPublic: () => {
        set({
            incidents: [],
            recentIncidents: [],
            stats: {
                total: 0,
                accidents: 0,
                breakdowns: 0,
                emergency: 0,
                pending: 0,
                resolved: 0,
            },
            categoryBreakdown: [],
            loading: {
                home: false,
                incidents: false,
                submit: false,
            },
            error: null,
        });
    },
}));