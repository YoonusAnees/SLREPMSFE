import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminPayments() {
  const toast = useUIStore((s) => s.toast);
  const loadPayments = useAdminStore((s) => s.loadPayments);
  const payments = useAdminStore((s) => s.payments);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function fetch(page = 1) {
    try {
      await loadPayments({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined,
      });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load payments");
    }
  }

  useEffect(() => {
    fetch(1);
  }, []);

  const columns = useMemo(
    () => [
      { key: "receiptNo", header: "Receipt" },
      { key: "status", header: "Status" },
      { key: "amountLkr", header: "Amount" },
      {
        key: "paidAt",
        header: "Paid At",
        render: (r) => new Date(r.paidAt).toLocaleString(),
      },
      {
        key: "driver",
        header: "Driver",
        render: (r) => r.paidBy?.email || "-",
      },
      {
        key: "plate",
        header: "Vehicle",
        render: (r) => r.penalty?.vehicle?.plateNo || "-",
      },
      {
        key: "violation",
        header: "Violation",
        render: (r) => r.penalty?.violationType?.code || "-",
      },
      {
        key: "receiptPdf",
        header: "Receipt PDF",
        render: (r) =>
          r.status === "SUCCESS" ? (
            <a
              className="underline text-sm"
              href={`/api/payments/${r.id}/receipt.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Payments</h1>

      <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-3 gap-2">
        <input
          className="border rounded-xl px-3 py-2 text-sm"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
        </select>
        <button
          className="rounded-xl bg-black text-white text-sm px-3 py-2"
          onClick={() => fetch(1)}
        >
          Apply
        </button>
      </div>

      <Table columns={columns} rows={payments?.rows || []} />

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Page <b>{payments?.page || 1}</b> · Total{" "}
          <b>{payments?.total || 0}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={(payments?.page || 1) <= 1}
            onClick={() => fetch((payments?.page || 1) - 1)}
          >
            Prev
          </button>
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={
              (payments?.page || 1) * (payments?.limit || 20) >=
              (payments?.total || 0)
            }
            onClick={() => fetch((payments?.page || 1) + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
