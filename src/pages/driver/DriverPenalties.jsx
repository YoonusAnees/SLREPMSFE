import { useEffect, useMemo, useState } from "react";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import { stripeCreateIntent } from "../../api/payments";
import StripeElementsWrapper from "../../stripe/StripeElementsWrapper";
import CheckoutForm from "../../stripe/CheckoutForm";

function makeKey() {
  return crypto.randomUUID();
}

export default function DriverPenalties() {
  const loadPenalties = useDriverStore((s) => s.loadPenalties);
  const penalties = useDriverStore((s) => s.penalties);
  const toast = useUIStore((s) => s.toast);

  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loadPenalties();
      } catch (e) {
        toast(
          "error",
          e?.response?.data?.message || "Failed to load penalties",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loadPenalties, toast]);

  const startPay = async (row) => {
    try {
      const res = await stripeCreateIntent({
        penaltyId: row.id,
        idempotencyKey: makeKey(),
      });

      setSelected(row);
      setPaymentId(res.paymentId);
      setClientSecret(res.clientSecret);
      setOpen(true);
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to initiate payment",
      );
    }
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
          const isPaid = r.status?.toUpperCase() === "PAID";
          return (
            <span
              className={`
                inline-flex px-3 py-1 text-xs font-medium rounded-full
                ${
                  isPaid
                    ? "bg-green-900/50 text-green-300 border border-green-700/50"
                    : "bg-red-900/50 text-red-300 border border-red-700/50 animate-pulse"
                }
              `}
            >
              {r.status || "PENDING"}
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
        header: "Points",
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
        key: "locationText",
        header: "Location",
        render: (r) => (
          <span className="text-slate-300 truncate max-w-[180px] block">
            {r.locationText || "—"}
          </span>
        ),
      },
      {
        key: "issuedBy",
        header: "Officer",
        render: (r) => (
          <span className="font-mono text-xs text-slate-400">
            {r.issuedBy?.email?.split("@")[0] || "—"}
          </span>
        ),
      },
      {
        key: "vehicle",
        header: "Vehicle",
        render: (r) => (
          <span className="font-mono text-xs text-indigo-300">
            {r.vehicle?.plateNo || "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        render: (r) =>
          r.status?.toUpperCase() === "PAID" ? (
            <span className="text-xs text-green-400 font-medium">✓ Paid</span>
          ) : (
            <button
              onClick={() => startPay(r)}
              className="
                px-4 py-1.5 text-sm font-medium rounded-lg
                bg-red-700 hover:bg-red-600 active:bg-red-800
                text-white shadow-md shadow-red-900/30
                transition-all duration-200
              "
            >
              Pay Now
            </button>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Penalties
          </h1>
          <p className="mt-1.5 text-slate-400">
            Unpaid fines and demerit points overview
          </p>
        </div>

        <button
          onClick={() => loadPenalties().catch(() => {})}
          disabled={loading}
          className={`
            px-4 py-2 text-sm rounded-lg border border-slate-600
            hover:bg-slate-800/60 transition-colors
            disabled:opacity-50
          `}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            Traffic Violations & Fines
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading penalties...
          </div>
        ) : penalties?.length > 0 ? (
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
                {penalties.map((penalty) => (
                  <tr
                    key={penalty.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        {col.render
                          ? col.render(penalty)
                          : penalty[col.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No penalties recorded at the moment.
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {open && clientSecret && selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center p-4 z-50">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/70 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/60 flex items-center justify-between">
              <div className="text-lg font-semibold text-indigo-300">
                Pay Penalty
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setClientSecret("");
                  setPaymentId("");
                  setSelected(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50">
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Violation Date:</span>
                    <span>
                      {new Date(selected.occurredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-mono">
                      {selected.vehicle?.plateNo || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fine Amount:</span>
                    <span className="text-xl font-bold text-orange-300">
                      LKR {Number(selected.fineLkr).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                Complete payment securely via Stripe
              </div>

              <StripeElementsWrapper clientSecret={clientSecret}>
                <CheckoutForm
                  paymentId={paymentId}
                  onDone={(msg) => {
                    toast("success", msg || "Payment completed successfully");
                    setOpen(false);
                    setClientSecret("");
                    setPaymentId("");
                    setSelected(null);
                    loadPenalties().catch(() => {});
                  }}
                  onError={(msg) => toast("error", msg || "Payment failed")}
                />
              </StripeElementsWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
