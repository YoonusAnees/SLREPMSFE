import { useEffect, useMemo } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useUIStore } from "../../store/ui.store";
import { useDispatcherStore } from "../../store/dispatcher.store";

function StatCard({ title, value }) {
  return (
    <div
      className="
        rounded-xl border backdrop-blur-sm shadow-lg shadow-black/30 p-5
        bg-gradient-to-b from-slate-900/80 to-slate-950/80
        border-slate-700/60 transition-all hover:scale-[1.02] hover:shadow-xl
      "
    >
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
        {title}
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-white">
        {value ?? 0}
      </div>
    </div>
  );
}

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-slate-800/70 text-slate-300 border-slate-600/60",
    red: "bg-red-900/40 text-red-300 border-red-700/50",
    yellow: "bg-amber-900/40 text-amber-300 border-amber-700/50",
    green: "bg-green-900/40 text-green-300 border-green-700/50",
    blue: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
    purple: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone] || tones.gray}`}
    >
      {children}
    </span>
  );
}

function getSeverityTone(severity) {
  const s = String(severity || "").toUpperCase();

  if (s === "HIGH" || s === "CRITICAL") return "red";
  if (s === "MEDIUM" || s === "MODERATE") return "yellow";
  if (s === "LOW") return "green";
  return "gray";
}

function getIncidentStatusTone(status) {
  const s = String(status || "").toUpperCase();

  if (s === "NEW") return "red";
  if (s === "DISPATCHED") return "blue";
  if (s === "RESOLVED") return "green";
  if (s === "CANCELLED") return "gray";
  if (s === "IN_PROGRESS") return "yellow";
  return "gray";
}

function getDispatchStatusTone(status) {
  const s = String(status || "").toUpperCase();

  if (s === "PENDING") return "yellow";
  if (s === "EN_ROUTE") return "blue";
  if (s === "ON_SCENE") return "purple";
  if (s === "COMPLETED") return "green";
  if (s === "CANCELLED") return "gray";
  return "gray";
}

export default function DispatcherDashboard() {
  const toast = useUIStore((s) => s.toast);

  const loadStats = useDispatcherStore((s) => s.loadStats);
  const loadIncidents = useDispatcherStore((s) => s.loadIncidents);
  const loadMyDispatches = useDispatcherStore((s) => s.loadMyDispatches);

  const stats = useDispatcherStore((s) => s.stats);
  const incidents = useDispatcherStore((s) => s.incidents);
  const myDispatches = useDispatcherStore((s) => s.myDispatches);
  const loading = useDispatcherStore(
    (s) => s.loading?.stats || s.loading?.incidents || s.loading?.dispatches,
  );

  async function refresh() {
    try {
      await Promise.all([loadStats(), loadIncidents(), loadMyDispatches()]);
      toast("success", "Dashboard refreshed");
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to refresh dashboard",
      );
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const newIncidents = useMemo(
    () => (incidents || []).filter((x) => x.status === "NEW").slice(0, 5),
    [incidents],
  );

  const myRecentDispatches = useMemo(
    () => (myDispatches || []).slice(0, 5),
    [myDispatches],
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dispatcher Control Room
          </h1>
          <p className="mt-1.5 text-slate-300 text-base sm:text-lg">
            Live overview • Incidents • Dispatch coordination
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
                : "bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white shadow-cyan-900/30 hover:shadow-cyan-800/40"
            }
          `}
        >
          {loading ? "Refreshing..." : "Refresh Dashboard"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="NEW Incidents" value={stats?.incidents?.NEW ?? 0} />
        <StatCard
          title="DISPATCHED"
          value={stats?.incidents?.DISPATCHED ?? 0}
        />
        <StatCard title="RESOLVED" value={stats?.incidents?.RESOLVED ?? 0} />
        <StatCard title="CANCELLED" value={stats?.incidents?.CANCELLED ?? 0} />
        <StatCard
          title="Active Dispatches"
          value={stats?.activeDispatches ?? 0}
        />
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest NEW Incidents */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2.5">
              <span className="text-xl">🚨</span>
              Latest NEW Incidents (Top 5)
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Waiting for dispatch assignment
            </p>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Loading recent incidents...
              </div>
            ) : newIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-6xl mb-4 opacity-50">🎉</div>
                <p className="text-lg font-medium text-slate-300">
                  No new incidents
                </p>
                <p className="mt-2 text-sm">All clear at the moment</p>
              </div>
            ) : (
              newIncidents.map((i) => (
                <div
                  key={i.id}
                  className="
                    rounded-xl border border-slate-700/60 bg-slate-900/50 p-4
                    hover:border-cyan-700/50 transition-colors
                  "
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="font-medium text-slate-100 capitalize">
                      {i.type?.toLowerCase() || "Incident"}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={getSeverityTone(i.severity)}>
                        {i.severity || "Unknown Severity"}
                      </Badge>
                      <Badge tone={getIncidentStatusTone(i.status)}>
                        {i.status || "Unknown Status"}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 line-clamp-1">
                    {i.locationText || "—"}
                  </div>

                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(i.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Recent Dispatches */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2.5">
              <span className="text-xl">📤</span>
              My Recent Dispatches (Latest 5)
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Your latest dispatch actions
            </p>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Loading your dispatches...
              </div>
            ) : myRecentDispatches.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-6xl mb-4 opacity-50">📡</div>
                <p className="text-lg font-medium text-slate-300">
                  No dispatches yet
                </p>
                <p className="mt-2 text-sm">
                  Start assigning teams from the incidents list
                </p>
              </div>
            ) : (
              myRecentDispatches.map((d) => (
                <div
                  key={d.id}
                  className="
                    rounded-xl border border-slate-700/60 bg-slate-900/50 p-4
                    hover:border-cyan-700/50 transition-colors
                  "
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="font-medium text-slate-100 capitalize">
                      {d.incident?.type?.toLowerCase() || "Incident"}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {d.incident?.severity && (
                        <Badge tone={getSeverityTone(d.incident.severity)}>
                          {d.incident.severity}
                        </Badge>
                      )}
                      <Badge tone={getDispatchStatusTone(d.status)}>
                        {String(d.status || "UNKNOWN").replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">
                    Team: {d.rescueTeam?.name || d.rescueTeam?.code || "—"}
                  </div>

                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer timestamp */}
      <div className="text-xs text-center sm:text-left text-slate-500 pt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
