import { useEffect, useMemo } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

function Stat({ title, value, accent = "indigo" }) {
  const accentStyles =
    {
      indigo: "bg-indigo-900/30 border-indigo-700/50 text-indigo-300",
      red: "bg-red-900/40 border-red-700/50 text-red-300 animate-pulse-slow",
      teal: "bg-teal-900/30 border-teal-700/50 text-teal-300",
      green: "bg-green-900/30 border-green-700/50 text-green-300",
      amber: "bg-amber-900/30 border-amber-700/50 text-amber-300",
    }[accent] || "bg-slate-800/40 border-slate-700/50 text-slate-300";

  return (
    <div
      className={`
        rounded-xl border backdrop-blur-sm shadow-lg shadow-black/30 p-5
        transition-all hover:scale-[1.02] hover:shadow-xl
        ${accentStyles}
      `}
    >
      <div className="text-xs uppercase tracking-wide opacity-80 mb-1.5">
        {title}
      </div>
      <div className="text-3xl sm:text-4xl font-bold">{value ?? 0}</div>
    </div>
  );
}

export default function RescueDashboard() {
  const toast = useUIStore((s) => s.toast);
  const loadMe = useRescueStore((s) => s.loadMe);
  const loadMyDispatches = useRescueStore((s) => s.loadMyDispatches);
  const me = useRescueStore((s) => s.me);
  const myDispatches = useRescueStore((s) => s.myDispatches);
  const loading = useRescueStore((s) => s.loading?.me || s.loading?.dispatches);

  async function refresh() {
    try {
      await Promise.all([loadMe(), loadMyDispatches()]);
      toast("success", "Dashboard refreshed");
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to refresh rescue dashboard",
      );
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    const list = myDispatches || [];
    const active = list.filter((d) =>
      ["ASSIGNED", "EN_ROUTE", "ON_SCENE"].includes(d.status),
    );
    const completed = list.filter((d) => d.status === "COMPLETED");
    const cancelled = list.filter((d) => d.status === "CANCELLED");

    return {
      total: list.length,
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [myDispatches]);

  const next = (myDispatches || []).find((d) =>
    ["ASSIGNED", "EN_ROUTE", "ON_SCENE"].includes(d.status),
  );

  const teamStatusTone =
    me?.status === "AVAILABLE"
      ? "green"
      : me?.status === "BUSY"
        ? "amber"
        : me?.status === "OFFLINE"
          ? "red"
          : "gray";

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Rescue Team Dashboard
          </h1>
          <p className="mt-1.5 text-slate-300 text-base sm:text-lg">
            Team:{" "}
            <span className="font-semibold text-teal-300">
              {me?.teamCode || "—"}
            </span>{" "}
            · Status:{" "}
            <span
              className={`font-medium ${teamStatusTone === "green" ? "text-green-300" : teamStatusTone === "amber" ? "text-amber-300" : "text-red-300"}`}
            >
              {me?.status || "Unknown"}
            </span>
          </p>
        </div>

        <Button
          onClick={refresh}
          disabled={loading}
          className={`
            px-6 py-2.5 rounded-lg font-medium
            transition-all duration-200 shadow-sm
            ${
              loading
                ? "bg-slate-700 cursor-not-allowed text-slate-400"
                : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/30 hover:shadow-red-800/40"
            }
          `}
        >
          {loading ? "Refreshing..." : "Refresh Dashboard"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Total Dispatches" value={counts.total} accent="indigo" />
        <Stat title="Active Now" value={counts.active} accent="red" />
        <Stat title="Completed" value={counts.completed} accent="green" />
        <Stat title="Cancelled" value={counts.cancelled} accent="amber" />
      </div>

      {/* Current Assignment Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-teal-300 flex items-center gap-2.5">
            <span className="text-xl">🚑</span>
            Current / Next Assignment
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Your most urgent active dispatch
          </p>
        </div>

        <div className="p-6 md:p-8">
          {!next ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-6xl mb-4 opacity-50">📡</div>
              <p className="text-lg font-medium text-slate-300">
                No active dispatch right now
              </p>
              <p className="mt-2 text-sm">
                Wait for assignment from control room or check incidents list
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-5">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Incident
                  </div>
                  <div className="text-lg font-semibold text-white capitalize">
                    {next.incident?.type?.toLowerCase() || "Unknown"} —{" "}
                    <span
                      className={`
                      ${
                        next.incident?.severity === "CRITICAL"
                          ? "text-red-400"
                          : next.incident?.severity === "HIGH"
                            ? "text-orange-400"
                            : "text-amber-300"
                      }
                    `}
                    >
                      {next.incident?.severity || "?"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-5">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Location
                  </div>
                  <div className="text-base text-slate-200">
                    {next.incident?.locationText || "—"}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-5">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Current Status
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span
                      className={`
                      inline-flex px-3 py-1 text-xs font-medium rounded-full border
                      ${
                        next.status === "ON_SCENE"
                          ? "bg-teal-900/50 text-teal-300 border-teal-700/50"
                          : next.status === "EN_ROUTE"
                            ? "bg-amber-900/50 text-amber-300 border-amber-700/50 animate-pulse"
                            : "bg-blue-900/50 text-blue-300 border-blue-700/50"
                      }
                    `}
                    >
                      {next.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {next.incident?.description && (
                <div className="pt-4 border-t border-slate-800/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                    Incident Notes
                  </div>
                  <p className="text-slate-300 text-sm">
                    {next.incident.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer timestamp */}
      <div className="text-xs text-center sm:text-left text-slate-500 pt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
