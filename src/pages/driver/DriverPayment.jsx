import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import { useUIStore } from "../../store/ui.store";
import { myPayments, getPaymentReceipt } from "../../api/payments";

export default function DriverPayments() {
  const toast = useUIStore((s) => s.toast);

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await myPayments(); // should return array
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const downloadReceipt = async (paymentId) => {
    try {
      const blob = await getPaymentReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast("error", "Failed to download receipt");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "paidAt",
        header: "Date",
        render: (r) => new Date(r.paidAt || r.updatedAt).toLocaleString(),
      },
      {
        key: "receiptNo",
        header: "Receipt No",
        render: (r) => <span className="font-mono text-xs">{r.receiptNo}</span>,
      },
      {
        key: "amountLkr",
        header: "Amount (LKR)",
        render: (r) => Number(r.amountLkr || 0).toLocaleString("en-LK"),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className="text-xs px-2 py-1 rounded-full border">
            {r.status}
          </span>
        ),
      },

      {
        key: "actions",
        header: "Receipt",
        render: (r) =>
          r.status === "SUCCESS" ? (
            <button
              className="text-sm px-3 py-1 rounded bg-black text-white"
              onClick={() => downloadReceipt(r.id)}
            >
              PDF
            </button>
          ) : (
            <span className="text-xs text-gray-500">Not ready</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Payments</h1>
        <button
          className="text-sm px-3 py-1 rounded border"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <Table columns={columns} rows={payments} />
    </div>
  );
}
