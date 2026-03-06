import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import { myPayments, getPaymentReceipt } from "../../api/payments";

export default function DriverPayments() {
  const toast = useUIStore((s) => s.toast);

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await myPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to load payment history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const downloadReceipt = async (paymentId) => {
    try {
      const blob = await getPaymentReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SLREPSMS-Receipt-${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast("success", "Receipt downloaded");
    } catch (err) {
      toast("error", "Failed to download receipt");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "paidAt",
        header: "Date & Time",
        render: (row) => (
          <span className="text-slate-300">
            {new Date(row.paidAt || row.updatedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        ),
      },
      {
        key: "receiptNo",
        header: "Receipt No",
        render: (row) => (
          <span className="font-mono text-xs text-indigo-300 tracking-wide">
            {row.receiptNo || "—"}
          </span>
        ),
      },
      {
        key: "amountLkr",
        header: "Amount (LKR)",
        render: (row) => (
          <span className="font-medium text-emerald-300">
            {Number(row.amountLkr || 0).toLocaleString("si-LK")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => {
          const status = (row.status || "").toUpperCase();
          const style =
            status === "SUCCESS"
              ? "bg-green-900/50 text-green-300 border-green-700/50"
              : status === "PENDING" || status === "PROCESSING"
                ? "bg-orange-900/50 text-orange-300 border-orange-700/50 animate-pulse"
                : "bg-red-900/50 text-red-300 border-red-700/50";

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
        key: "actions",
        header: "Receipt",
        render: (row) =>
          row.status?.toUpperCase() === "SUCCESS" ? (
            <button
              onClick={() => downloadReceipt(row.id)}
              className="
                px-4 py-1.5 text-sm font-medium rounded-lg
                bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800
                text-white shadow-sm shadow-indigo-900/30
                transition-all duration-200
              "
            >
              Download PDF
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">Not available</span>
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
            Payment History
          </h1>
          <p className="mt-1.5 text-slate-400">
            Receipts for paid penalties and fines
          </p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-medium
            border border-slate-600 hover:bg-slate-800/60
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
              Refreshing...
            </span>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            Recent Transactions ({payments?.length || 0})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading payment history...
          </div>
        ) : payments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-4 font-medium">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        {col.render
                          ? col.render(payment)
                          : payment[col.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-40">💳</div>
            <p className="text-lg mb-2">No payments found</p>
            <p className="text-sm">
              Completed payments and receipts will appear here
            </p>
          </div>
        )}
      </div>

      {/* Optional summary footer */}
      {payments?.length > 0 && (
        <div className="text-xs text-slate-500 text-right">
          Showing all payments • Last updated {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
