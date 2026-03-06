import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import MiniMap from "../../components/MiniMap";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

export default function RescueDispatches() {
  const toast = useUIStore((s) => s.toast);
  const loadMyDispatches = useRescueStore((s) => s.loadMyDispatches);
  const updateDispatchStatus = useRescueStore((s) => s.updateDispatchStatus);
  const myDispatches = useRescueStore((s) => s.myDispatches);
  const loading = useRescueStore((s) => s.loading);

  const [status, setStatus] = useState("");

  async function fetch() {
    try {
      await loadMyDispatches();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load dispatches");
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const rows = useMemo(() => {
    const list = myDispatches || [];
    return status ? list.filter((d) => d.status === status) : list;
  }, [myDispatches, status]);

  async function setStatusFor(dispatchId, newStatus) {
    try {
      await updateDispatchStatus({ dispatchId, status: newStatus });
      toast("success", `Status updated to ${newStatus}`);
      await fetch();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to update status");
    }
  }

  function openMaps(d) {
    const [lng, lat] =
      d.incident?.baseLocation?.coordinates ||
      d.incident?.location?.coordinates ||
      [];
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return toast("error", "No incident location available");
    }
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }

  const columns = useMemo(
    () => [
      {
        key: "status",
        header: "Status",
        render: (d) => {
          const st = (d.status || "").toUpperCase();
          const style =
            st === "COMPLETED"
              ? "bg-green-900/50 text-green-300 border-green-700/50"
              : st === "ON_SCENE"
                ? "bg-teal-900/50 text-teal-300 border-teal-700/50"
                : st === "EN_ROUTE"
                  ? "bg-amber-900/50 text-amber-300 border-amber-700/50 animate-pulse"
                  : st === "ASSIGNED"
                    ? "bg-blue-900/50 text-blue-300 border-blue-700/50"
                    : st === "CANCELLED"
                      ? "bg-slate-700/50 text-slate-300 border-slate-600/50"
                      : "bg-slate-800/50 text-slate-400 border-slate-700/50";

          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${style}`}
            >
              {st.replace(/_/g, " ") || "—"}
            </span>
          );
        },
      },
      {
        key: "incident",
        header: "Incident",
        render: (d) => (
          <div className="space-y-1">
            <div className="font-medium text-slate-200 capitalize">
              {d.incident?.type?.toLowerCase() || "Incident"}
            </div>
            <div
              className={`
              text-sm font-semibold
              ${
                d.incident?.severity === "CRITICAL"
                  ? "text-red-400"
                  : d.incident?.severity === "HIGH"
                    ? "text-orange-400"
                    : "text-amber-300"
              }
            `}
            >
              {d.incident?.severity || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "locationText",
        header: "Location",
        render: (d) => (
          <span className="text-slate-300 line-clamp-2 max-w-[220px] text-sm">
            {d.incident?.locationText || "—"}
          </span>
        ),
      },
      {
        key: "map",
        header: "Map Preview",
        render: (d) => {
          const [lng, lat] =
            d.incident?.baseLocation?.coordinates ||
            d.incident?.location?.coordinates ||
            [];
          if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
            return <span className="text-xs text-slate-500">No map</span>;
          }
          return (
            <div
              className="
                w-[180px] h-[110px] sm:w-[220px] sm:h-[140px]
                rounded-lg overflow-hidden border-2 border-slate-700
                hover:border-red-500 transition-all cursor-pointer
                shadow-inner shadow-black/40
              "
              onClick={() => openMaps(d)}
            >
              <MiniMap lat={Number(lat)} lng={Number(lng)} zoom={14} />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (d) => {
          const isDone = d.status === "COMPLETED" || d.status === "CANCELLED";

          return (
            <div className="flex flex-wrap gap-2.5">
              <button
                className="
                  px-4 py-2 text-sm font-medium rounded-lg
                  bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800
                  text-white shadow-sm shadow-indigo-900/30
                  transition-all duration-200 flex items-center gap-1.5
                "
                onClick={() => openMaps(d)}
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Maps
              </button>

              {!isDone && (
                <>
                  <button
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg
                      ${
                        d.status === "EN_ROUTE"
                          ? "bg-slate-700 cursor-not-allowed text-slate-400"
                          : "bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white"
                      }
                      transition-all duration-200 shadow-sm
                    `}
                    disabled={loading.update || d.status === "EN_ROUTE"}
                    onClick={() => setStatusFor(d.id, "EN_ROUTE")}
                  >
                    EN ROUTE
                  </button>

                  <button
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg
                      ${
                        d.status === "ON_SCENE"
                          ? "bg-slate-700 cursor-not-allowed text-slate-400"
                          : "bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white"
                      }
                      transition-all duration-200 shadow-sm
                    `}
                    disabled={loading.update || d.status === "ON_SCENE"}
                    onClick={() => setStatusFor(d.id, "ON_SCENE")}
                  >
                    ON SCENE
                  </button>

                  <button
                    className="
                      px-4 py-2 text-sm font-medium rounded-lg
                      bg-green-700 hover:bg-green-600 active:bg-green-800
                      text-white transition-all duration-200 shadow-sm
                    "
                    disabled={loading.update}
                    onClick={() => setStatusFor(d.id, "COMPLETED")}
                  >
                    COMPLETE
                  </button>

                  <button
                    className="
                      px-4 py-2 text-sm font-medium rounded-lg
                      bg-red-700 hover:bg-red-600 active:bg-red-800
                      text-white transition-all duration-200 shadow-sm
                    "
                    disabled={loading.update}
                    onClick={() => setStatusFor(d.id, "CANCELLED")}
                  >
                    CANCEL
                  </button>
                </>
              )}

              {isDone && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-600 text-slate-300">
                  {d.status}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [loading.update],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Rescue Dispatches
          </h1>
          <p className="mt-1.5 text-slate-400">
            Update status as you respond to incidents
          </p>
        </div>

        <Button
          onClick={fetch}
          disabled={loading.dispatches}
          className={`
            px-6 py-2.5 rounded-lg font-medium
            transition-all duration-200 shadow-sm
            ${
              loading.dispatches
                ? "bg-slate-700 cursor-not-allowed text-slate-400"
                : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/30 hover:shadow-red-800/40"
            }
          `}
        >
          {loading.dispatches ? "Refreshing..." : "Refresh Dispatches"}
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-red-300">
            Filter Dispatches
          </h2>
        </div>

        <div className="p-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="
              w-full sm:w-64 px-4 py-3.5 bg-slate-800/70 border border-slate-600
              rounded-lg text-white focus:border-red-500 focus:ring-2
              focus:ring-red-500/30 transition-all text-sm md:text-base
            "
          >
            <option value="">All Dispatch Statuses</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="EN_ROUTE">EN ROUTE</option>
            <option value="ON_SCENE">ON SCENE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-300">
            My Dispatches ({rows.length})
          </h2>
          <div className="text-sm text-slate-400">
            {loading.dispatches ? "Loading..." : "Showing filtered results"}
          </div>
        </div>

        {loading.dispatches ? (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-slate-700/40 border-t-red-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping-slow" />
              </div>
              <div className="text-lg font-medium text-slate-300">
                Loading your dispatches...
              </div>
            </div>
          </div>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} rows={rows} theme="incident" />
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5 opacity-80">
              <div className="text-7xl">🚑</div>
              <div className="text-xl font-medium text-slate-300">
                No dispatches assigned yet
              </div>
              <div className="text-sm max-w-md">
                Wait for dispatch from control room or check back later
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
