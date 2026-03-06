import { useEffect } from "react";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";

export default function DriverHome() {
  const loadMe = useDriverStore((s) => s.loadMe);
  const me = useDriverStore((s) => s.me);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadMe().catch((err) =>
      toast(
        "error",
        err?.response?.data?.message || "Failed to load driver profile",
      ),
    );
  }, [loadMe, toast]);

  // Helper to determine visual status
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-900/40 text-green-300 border-green-700/50";
      case "SUSPENDED":
      case "REVOKED":
        return "bg-red-900/50 text-red-300 border-red-700/50 animate-pulse";
      case "EXPIRED":
      case "SUSPENDED_PENDING":
        return "bg-orange-900/40 text-orange-300 border-orange-700/50";
      default:
        return "bg-slate-800/50 text-slate-400 border-slate-700/50";
    }
  };

  const statusClasses = getStatusStyle(me?.licenseStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Driver Dashboard
          </h1>
          <p className="mt-1.5 text-indigo-300/90">
            {me?.name
              ? `Welcome back, ${me.name.split(" ")[0]}`
              : "Overview of your license & status"}
          </p>
        </div>

        {/* Quick status badge (mobile friendly) */}
        <div className="sm:hidden self-start">
          <div
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border ${statusClasses}`}
          >
            {me?.licenseStatus || "Loading..."}
          </div>
        </div>
      </div>

      {/* Main content cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* License Status Card - main focus */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">🪪</span>
              License Status
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Demerit points & validity
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">License Number</span>
              <span className="font-mono text-white">
                {me?.licenseNo || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Current Demerit Points</span>
              <span
                className={`font-semibold ${
                  (me?.currentPoints ?? 0) >= 5
                    ? "text-red-400"
                    : (me?.currentPoints ?? 0) >= 5
                      ? "text-orange-400"
                      : "text-green-400"
                }`}
              >
                {me?.currentPoints ?? "—"}
                {(me?.currentPoints ?? 0) > 0 && (
                  <span className="text-xs opacity-70 ml-1">/ 5</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Status</span>
              <div
                className={`inline-flex px-3.5 py-1.5 rounded-full text-sm font-medium border ${statusClasses}`}
              >
                {me?.licenseStatus || "Unknown"}
              </div>
            </div>

            {me?.suspendedUntil && (
              <div className="pt-3 border-t border-red-900/30">
                <div className="text-xs text-red-300/90 mb-1.5 uppercase tracking-wide">
                  Suspension Active Until
                </div>
                <div className="text-red-200 font-medium">
                  {new Date(me.suspendedUntil).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* You can add more dashboard cards here in the future */}
        {/* Examples: */}
        {/* - Recent Penalties (3 latest) */}
        {/* - Vehicle Summary */}
        {/* - Upcoming Insurance Expiry */}
        {/* - Quick Actions */}
      </div>

      {/* Optional footer note */}
      <div className="text-xs text-center sm:text-left text-slate-500 pt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
