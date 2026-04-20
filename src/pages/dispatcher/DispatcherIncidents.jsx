import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import MiniMap from "../../components/MiniMap";
import { useUIStore } from "../../store/ui.store";
import { useDispatcherStore } from "../../store/dispatcher.store";
import DispatchModal from "../../components/DispatchModal";

export default function DispatcherIncidents() {
  const toast = useUIStore((s) => s.toast);
  const loadIncidents = useDispatcherStore((s) => s.loadIncidents);
  const incidents = useDispatcherStore((s) => s.incidents);
  const loading = useDispatcherStore((s) => s.loading?.incidents);

  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  async function fetch() {
    try {
      await loadIncidents();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load incidents");
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const filtered = useMemo(() => {
    if (!status) return incidents || [];
    return (incidents || []).filter((x) => x.status === status);
  }, [incidents, status]);

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Reported At",
        render: (r) => (
          <span className="text-slate-300 text-sm">
            {new Date(r.createdAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => {
          const st = (r.status || "").toUpperCase();
          const style =
            st === "NEW"
              ? "bg-amber-900/50 text-amber-300 border-amber-700/50 animate-pulse"
              : st === "DISPATCHED"
                ? "bg-blue-900/50 text-blue-300 border-blue-700/50"
                : st === "RESOLVED"
                  ? "bg-green-900/50 text-green-300 border-green-700/50"
                  : st === "CANCELLED"
                    ? "bg-slate-700/50 text-slate-300 border-slate-600/50"
                    : "bg-slate-800/50 text-slate-400 border-slate-700/50";

          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${style}`}
            >
              {st || "—"}
            </span>
          );
        },
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <span className="font-medium text-slate-200 capitalize">
            {r.type?.toLowerCase() || "—"}
          </span>
        ),
      },
      {
        key: "severity",
        header: "Severity",
        render: (r) => {
          const sev = (r.severity || "").toUpperCase();
          const color =
            sev === "CRITICAL"
              ? "text-red-400 font-bold"
              : sev === "HIGH"
                ? "text-orange-400"
                : sev === "MEDIUM"
                  ? "text-amber-300"
                  : "text-green-400";

          return <span className={color}>{sev || "—"}</span>;
        },
      },
      {
        key: "reportedBy",
        header: "Reported By",
        render: (r) => (
          <span className="font-mono text-xs text-slate-300 truncate max-w-[140px] block">
            {r.reportedBy?.email?.split("@")[0] || "—"}
          </span>
        ),
      },
      {
        key: "locationText",
        header: "Location",
        render: (r) => (
          <span className="text-slate-300 line-clamp-2 max-w-[220px] text-sm">
            {r.locationText || "—"}
          </span>
        ),
      },
      {
        key: "map",
        header: "Map Preview",
        render: (r) => {
          const [lng, lat] =
            r.baseLocation?.coordinates || r.location?.coordinates || [];
          if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
            return <span className="text-xs text-slate-500">No location</span>;
          }
          return (
            <div
              className="
                w-[180px] h-[110px] sm:w-[220px] sm:h-[140px]
                rounded-lg overflow-hidden border-2 border-slate-700
                hover:border-cyan-500 transition-all cursor-pointer
                shadow-inner shadow-black/40
              "
            >
              <MiniMap lat={Number(lat)} lng={Number(lng)} zoom={14} />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <button
            className="
              px-4 py-2 text-sm font-medium rounded-lg
              bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800
              text-white shadow-sm shadow-cyan-900/30
              transition-all duration-200 flex items-center gap-1.5
            "
            onClick={() => setSelected(r)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Dispatch
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Incident Dispatch Board
          </h1>
          <p className="mt-1.5 text-slate-400">
            Review incoming incidents • Assign nearest rescue teams
          </p>
        </div>

        <Button
          onClick={fetch}
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
          {loading ? "Refreshing..." : "Refresh Incidents"}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-cyan-300">
            Filter & Control
          </h2>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Incident Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="
                w-[50%] px-6 py-5 bg-slate-800/70 border border-slate-600
                rounded-lg text-white focus:border-cyan-500 focus:ring-2
                focus:ring-cyan-500/30 transition-all text-sm md:text-base
              "
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span>Total incidents:</span>
            <span className="font-medium text-white">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyan-300">
            All Incidents ({filtered.length})
          </h2>
          <div className="text-sm text-slate-400">
            {loading ? "Loading..." : "Showing filtered results"}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-slate-700/40 border-t-cyan-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping-slow" />
              </div>
              <div className="text-lg font-medium text-slate-300">
                Loading incidents...
              </div>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} rows={filtered} theme="incident" />
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5 opacity-80">
              <div className="text-7xl">📡</div>
              <div className="text-xl font-medium text-slate-300">
                No incidents match the filter
              </div>
              <div className="text-sm max-w-md">
                Try changing the status filter or refresh the list
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      <DispatchModal
        open={!!selected}
        incident={selected}
        onClose={() => setSelected(null)}
        onDone={async () => {
          setSelected(null);
          await fetch();
        }}
      />
    </div>
  );
}
