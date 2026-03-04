import { useEffect, useMemo, useState } from "react";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";
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

  useEffect(() => {
    loadPenalties().catch((e) =>
      toast("error", e?.response?.data?.message || "Failed to load penalties"),
    );
  }, []);

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
        e?.response?.data?.message || "Failed to start Stripe payment",
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "occurredAt",
        header: "Date",
        render: (r) => new Date(r.occurredAt).toLocaleString(),
      },
      { key: "status", header: "Status" },
      { key: "fineLkr", header: "Fine (LKR)" },
      { key: "demeritPoints", header: "Points" },
      { key: "locationText", header: "Location" },
      {
        key: "issuedBy",
        header: "Officer",
        render: (r) => (
          <span className="font-mono text-xs">{r.issuedBy?.email}</span>
        ),
      },

      {
        key: "vehicle",
        header: "Vehicle",
        render: (r) => (
          <span className="font-mono text-xs">{r.vehicle?.plateNo}</span>
        ),
      },

      {
        key: "actions",
        header: "Action",
        render: (r) =>
          r.status === "PAID" ? (
            <span className="text-xs text-green-700">Paid</span>
          ) : (
            <button
              className="text-sm px-3 py-1 rounded bg-black text-white"
              onClick={() => startPay(r)}
            >
              Pay
            </button>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Penalties</h1>
      <Table columns={columns} rows={penalties} />

      {open && clientSecret && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Pay Penalty (Demo)</div>
              <button
                className="text-sm px-2 py-1"
                onClick={() => {
                  setOpen(false);
                  setClientSecret("");
                  setPaymentId("");
                  setSelected(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="text-sm text-gray-700">
              Fine: <b>LKR {selected?.fineLkr}</b>
            </div>

            <StripeElementsWrapper clientSecret={clientSecret}>
              <CheckoutForm
                paymentId={paymentId}
                onDone={(msg) => {
                  toast("success", msg);
                  setOpen(false);
                  setClientSecret("");
                  setPaymentId("");
                  setSelected(null);
                  loadPenalties().catch(() => {});
                }}
                onError={(msg) => toast("error", msg)}
              />
            </StripeElementsWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
