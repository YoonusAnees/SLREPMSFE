import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminPenalties() {
  const toast = useUIStore((s) => s.toast);
  const loadPenalties = useAdminStore((s) => s.loadPenalties);
  const penalties = useAdminStore((s) => s.penalties);
  const loading = useAdminStore((s) => s.loading.penalties);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPenalties = async (page = 1) => {
    try {
      await loadPenalties({
        page,
        limit: 20,
        q: q.trim() || undefined,
        status: status || undefined,
      });
      setCurrentPage(page);
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to load penalties",
      );
    }
  };

  useEffect(() => {
    fetchPenalties(1);
  }, []);

  const handleApplyFilter = () => {
    fetchPenalties(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "occurredAt",
        header: "Date & Time",
        render: (r) => (
          <span className="text-slate-300">
            {new Date(r.occurredAt).toLocaleString("en-GB", {
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
          const status = (r.status || "").toUpperCase();
          const style =
            status === "PAID"
              ? "bg-green-900/50 text-green-300 border-green-700/50"
              : status === "UNPAID"
                ? "bg-red-900/50 text-red-300 border-red-700/50 animate-pulse"
                : status === "CANCELLED"
                  ? "bg-slate-700/50 text-slate-300 border-slate-600/50"
                  : "bg-slate-800/50 text-slate-400 border-slate-700/50";

          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${style}`}
            >
              {status || "UNKNOWN"}
            </span>
          );
        },
      },
      {
        key: "fineLkr",
        header: "Fine (LKR)",
        render: (r) => (
          <span className="font-medium text-orange-300">
            {Number(r.fineLkr || 0).toLocaleString("si-LK")}
          </span>
        ),
      },
      {
        key: "demeritPoints",
        header: "Demerit Pts",
        render: (r) => (
          <span
            className={
              r.demeritPoints > 0
                ? "text-red-400 font-medium"
                : "text-green-400"
            }
          >
            {r.demeritPoints || 0}
          </span>
        ),
      },
      {
        key: "vehicle",
        header: "Vehicle Plate",
        render: (r) => (
          <span className="font-mono text-indigo-300">
            {r.vehicle?.plateNo || "—"}
          </span>
        ),
      },
      {
        key: "violation",
        header: "Violation Code",
        render: (r) => (
          <span className="font-mono text-xs text-amber-300">
            {r.violationType?.code || "—"}
          </span>
        ),
      },
      {
        key: "officer",
        header: "Issued By",
        render: (r) => (
          <span className="font-mono text-xs text-slate-400">
            {r.issuedBy?.email?.split("@")[0] || "—"}
          </span>
        ),
      },
      {
        key: "driver",
        header: "Driver",
        render: (r) => (
          <span className="font-mono text-xs text-slate-300">
            {r.driverUser?.email?.split("@")[0] || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.ceil((penalties?.total || 0) / 20);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            All Penalties
          </h1>
          <p className="mt-1.5 text-slate-400">
            Issued fines • Violations • Payment status • Enforcement overview
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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

      {/* Filters */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            Filter Penalties
          </h2>
        </div>

        <div className="p-6 grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Search (plate, violation, driver...)
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Plate number, violation code, driver email..."
              className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilter}
              disabled={loading}
              className={`
                w-full py-3.5 px-6 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
                }
              `}
            >
              {loading ? "Applying..." : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Penalties Table */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo-300">
            Issued Penalties
          </h2>
          <div className="text-sm text-slate-400">
            Showing {penalties?.rows?.length || 0} of {penalties?.total || 0}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            Loading penalties...
          </div>
        ) : penalties?.rows?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table columns={columns} rows={penalties.rows} />
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-slate-700/50 flex items-center justify-between text-sm">
              <div className="text-slate-400">
                Page{" "}
                <span className="text-white font-medium">{currentPage}</span> of{" "}
                <span className="text-white font-medium">
                  {Math.ceil((penalties?.total || 0) / 20) || 1}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchPenalties(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium border
                    ${
                      currentPage <= 1 || loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-300"
                    }
                  `}
                >
                  Previous
                </button>

                <button
                  onClick={() => fetchPenalties(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil((penalties?.total || 0) / 20) ||
                    loading
                  }
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium border
                    ${
                      currentPage >= Math.ceil((penalties?.total || 0) / 20) ||
                      loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-300"
                    }
                  `}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-40">⚖️</div>
            <p className="text-lg mb-2">No penalties found</p>
            <p className="text-sm">
              Try adjusting the search term or status filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
