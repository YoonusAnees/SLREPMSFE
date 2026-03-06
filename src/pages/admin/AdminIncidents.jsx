import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";
import ImageModal from "../../components/ImageModal";
import MiniMap from "../../components/MiniMap";

export default function AdminIncidents() {
  const toast = useUIStore((s) => s.toast);
  const loadIncidents = useAdminStore((s) => s.loadIncidents);
  const incidents = useAdminStore((s) => s.incidents);
  const loading = useAdminStore((s) => s.loading.incidents);

  const [status, setStatus] = useState("");
  const [zoomImage, setZoomImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchIncidents = async (page = 1) => {
    try {
      await loadIncidents({
        page,
        limit: 20,
        status: status || undefined,
      });
      setCurrentPage(page);
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to load incidents",
      );
    }
  };

  useEffect(() => {
    fetchIncidents(1);
  }, []);

  const handleApplyFilter = () => {
    fetchIncidents(1);
  };

  function openGoogleMaps(row) {
    try {
      const [lng, lat] = row.baseLocation?.coordinates || [];
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return toast("error", "Location coordinates missing");
      }
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } catch {
      toast("error", "Invalid location data");
    }
  }

  function openEvidence(url) {
    if (!url) return toast("info", "No evidence image available");
    setZoomImage(url);
  }

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Reported",
        render: (r) => (
          <div className="text-slate-300 text-sm">
            {new Date(r.createdAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => {
          const st = (r.status || "").toUpperCase();
          const style =
            st === "RESOLVED"
              ? "bg-green-900/50 text-green-300 border-green-700/50"
              : st === "DISPATCHED"
                ? "bg-blue-900/50 text-blue-300 border-blue-700/50"
                : st === "NEW"
                  ? "bg-amber-900/50 text-amber-300 border-amber-700/50 animate-pulse"
                  : st === "CANCELLED"
                    ? "bg-slate-700/50 text-slate-300 border-slate-600/50"
                    : "bg-slate-800/50 text-slate-400 border-slate-700/50";

          return (
            <span
              className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${style}`}
            >
              {st || "?"}
            </span>
          );
        },
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <span className="font-medium text-slate-200 capitalize">
            {r.type?.replace(/_/g, " ").toLowerCase() || "—"}
          </span>
        ),
      },
      {
        key: "severity",
        header: "Severity",
        render: (r) => {
          const sev = (r.severity || "").toUpperCase();
          const colors = {
            CRITICAL: "text-red-400 font-bold",
            HIGH: "text-orange-400 font-semibold",
            MEDIUM: "text-amber-300",
            LOW: "text-green-400",
          };
          return (
            <span className={colors[sev] || "text-slate-400"}>
              {sev || "—"}
            </span>
          );
        },
      },
      {
        key: "reportedBy",
        header: "Reporter",
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
          <span className="text-slate-300 line-clamp-2 max-w-[180px] text-sm">
            {r.locationText || "—"}
          </span>
        ),
      },
      {
        key: "evidence",
        header: "Photo",
        render: (r) =>
          r.evidence ? (
            <img
              src={r.evidence}
              alt="Incident photo"
              className="
                w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer
                border-2 border-slate-700 hover:border-red-500
                transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105
              "
              onClick={() => openEvidence(r.evidence)}
            />
          ) : (
            <span className="text-xs text-slate-500 italic">—</span>
          ),
      },
      // {
      //   key: "mapPreview",
      //   header: "Map",
      //   render: (r) => {
      //     const [lng, lat] = r.baseLocation?.coordinates || [];

      //     if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      //       return <span className="text-xs text-slate-500">No coords</span>;
      //     }

      //     return (
      //       <div
      //         className="
      //           w-[10px] h-[110px] sm:w-[220px] sm:h-[140px]
      //           rounded-lg overflow-hidden border-2 border-slate-700
      //           hover:border-red-500 transition-all cursor-pointer
      //           shadow-inner shadow-black/40
      //         "
      //         onClick={() => openGoogleMaps(r)}
      //       >
      //         <MiniMap lat={Number(lat)} lng={Number(lng)} zoom={15} />
      //       </div>
      //     );
      //   },
      // },
      {
        key: "view",
        header: "Action",
        render: (r) => (
          <button
            onClick={() => openGoogleMaps(r)}
            className="
              px-4 py-2 text-xs sm:text-sm font-medium rounded-lg
              bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800
              text-white shadow-sm shadow-indigo-900/30
              transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap
            "
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
            Map
          </button>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.ceil((incidents?.total || 0) / 20);

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Incident Reports
          </h1>
          <p className="mt-1.5 md:mt-2 text-slate-400 text-sm md:text-base">
            All reported road incidents • Accidents • Hazards • Emergencies
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2.5 text-sm px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading...
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-300">
            Filter Reports
          </h2>
        </div>

        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="
                w-full px-4 py-3 bg-slate-800/70 border border-slate-600
                rounded-lg text-white focus:border-indigo-500 focus:ring-2
                focus:ring-indigo-500/30 transition-all text-sm md:text-base
              "
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className={`
              w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm md:text-base
              transition-all duration-200 shadow-lg
              ${
                loading
                  ? "bg-slate-700 cursor-not-allowed text-slate-400"
                  : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Applying...
              </span>
            ) : (
              "Apply Filter"
            )}
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-700/50 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-300">
            All Reported Incidents
          </h2>
          <div className="text-sm text-slate-400">
            Showing {incidents?.rows?.length || 0} of {incidents?.total || 0}
          </div>
        </div>

        {loading ? (
          <div className="p-12 md:p-20 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-slate-700/40 border-t-red-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping-slow" />
              </div>
              <div className="text-lg font-medium text-slate-300">
                Loading incident reports...
              </div>
            </div>
          </div>
        ) : incidents?.rows?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                rows={incidents.rows}
                theme="incident"
                emptyMessage="No incidents match the current filter"
              />
            </div>

            {/* Pagination - more touch-friendly on mobile */}
            <div className="px-5 py-4 md:px-6 md:py-5 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
              <div className="text-slate-400 text-center sm:text-left">
                Page{" "}
                <span className="text-white font-medium">{currentPage}</span> of{" "}
                <span className="text-white font-medium">
                  {Math.ceil((incidents?.total || 0) / 20) || 1}
                </span>
              </div>

              <div className="flex justify-center sm:justify-end gap-3">
                <button
                  onClick={() => fetchIncidents(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium border min-w-[90px]
                    ${
                      currentPage <= 1 || loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-200 active:bg-slate-700"
                    }
                  `}
                >
                  ← Previous
                </button>

                <button
                  onClick={() => fetchIncidents(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil((incidents?.total || 0) / 20) ||
                    loading
                  }
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium border min-w-[90px]
                    ${
                      currentPage >= Math.ceil((incidents?.total || 0) / 20) ||
                      loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-200 active:bg-slate-700"
                    }
                  `}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 md:p-20 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5 opacity-80">
              <div className="text-7xl md:text-8xl">🚨</div>
              <div className="text-xl md:text-2xl font-medium text-slate-300">
                No incidents found
              </div>
              <div className="text-sm md:text-base max-w-md">
                Try changing the status filter or check back later
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageModal url={zoomImage} onClose={() => setZoomImage(null)} />
    </div>
  );
}
