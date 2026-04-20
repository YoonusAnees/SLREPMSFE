import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminPayments() {
  const toast = useUIStore((s) => s.toast);
  const loadPayments = useAdminStore((s) => s.loadPayments);
  const payments = useAdminStore((s) => s.payments);
  const loading = useAdminStore((s) => s.loading.payments);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = async (page = 1) => {
    try {
      await loadPayments({
        page,
        limit: 20,
        q: q.trim() || undefined,
        status: status || undefined,
      });
      setCurrentPage(page);
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to load payments");
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const handleApplyFilter = () => {
    fetchPayments(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "receiptNo",
        header: "Receipt No",
        render: (r) => (
          <span className="font-mono text-indigo-300 tracking-wide text-sm">
            {r.receiptNo || "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => {
          const st = (r.status || "").toUpperCase();
          const style =
            st === "SUCCESS"
              ? "bg-green-900/50 text-green-300 border-green-700/50"
              : st === "PENDING" || st === "PROCESSING"
                ? "bg-amber-900/50 text-amber-300 border-amber-700/50 animate-pulse"
                : st === "FAILED"
                  ? "bg-red-900/50 text-red-300 border-red-700/50"
                  : "bg-slate-800/50 text-slate-400 border-slate-700/50";

          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${style}`}
            >
              {st || "UNKNOWN"}
            </span>
          );
        },
      },
      {
        key: "amountLkr",
        header: "Amount (LKR)",
        render: (r) => (
          <span className="font-medium text-emerald-300">
            {Number(r.amountLkr || 0).toLocaleString("si-LK")}
          </span>
        ),
      },
      {
        key: "paidAt",
        header: "Paid At",
        render: (r) =>
          r.paidAt ? (
            <span className="text-slate-300">
              {new Date(r.paidAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "driver",
        header: "Driver",
        render: (r) => (
          <span className="font-mono text-xs text-slate-300">
            {r.paidBy?.email?.split("@")[0] || "—"}
          </span>
        ),
      },
      {
        key: "plate",
        header: "Vehicle Plate",
        render: (r) => (
          <span className="font-mono text-indigo-300">
            {r.penalty?.vehicle?.plateNo || "—"}
          </span>
        ),
      },
      {
        key: "violation",
        header: "Violation Code",
        render: (r) => (
          <span className="font-mono text-xs text-amber-300">
            {r.penalty?.violationType?.code || "—"}
          </span>
        ),
      },
      {
        key: "receiptPdf",
        header: "Receipt PDF",
        render: (r) =>
          r.status === "SUCCESS" ? (
            <a
              href={`/api/payments/${r.id}/receipt.pdf`}
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex items-center gap-1.5 text-sm font-medium
                text-indigo-400 hover:text-indigo-300 transition-colors
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download
            </a>
          ) : (
            <span className="text-xs text-slate-500">—</span>
          ),
      },
    ],
    [],
  );

  const totalPages = Math.ceil((payments?.total || 0) / 20);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            All Payments
          </h1>
          <p className="mt-1.5 text-slate-400">
            Transaction history • Receipts • Payment status • Revenue tracking
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
            Filter Payments
          </h2>
        </div>

        <div className="p-6 grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Search (receipt, driver, plate...)
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Receipt number, driver email, plate..."
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
              <option value="PENDING">PENDING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
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

      {/* Payments Table */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo-300">
            Payment Transactions
          </h2>
          <div className="text-sm text-slate-400">
            Showing {payments?.rows?.length || 0} of {payments?.total || 0}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            Loading payment records...
          </div>
        ) : payments?.rows?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table columns={columns} rows={payments.rows} />
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-slate-700/50 flex items-center justify-between text-sm">
              <div className="text-slate-400">
                Page{" "}
                <span className="text-white font-medium">{currentPage}</span> of{" "}
                <span className="text-white font-medium">
                  {Math.ceil((payments?.total || 0) / 20) || 1}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchPayments(currentPage - 1)}
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
                  onClick={() => fetchPayments(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil((payments?.total || 0) / 20) ||
                    loading
                  }
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium border
                    ${
                      currentPage >= Math.ceil((payments?.total || 0) / 20) ||
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
            <div className="text-5xl mb-4 opacity-40">💳</div>
            <p className="text-lg mb-2">No payments found</p>
            <p className="text-sm">
              Try adjusting the search term or status filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
