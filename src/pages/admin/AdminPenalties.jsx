import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminPenalties() {
  const toast = useUIStore((s) => s.toast);
  const loadPenalties = useAdminStore((s) => s.loadPenalties);
  const penalties = useAdminStore((s) => s.penalties);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function fetch(page = 1) {
    try {
      await loadPenalties({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined,
      });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load penalties");
    }
  }

  useEffect(() => {
    fetch(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "occurredAt",
        header: "Date",
        render: (r) => new Date(r.occurredAt).toLocaleString(),
      },
      { key: "status", header: "Status" },
      { key: "fineLkr", header: "Fine" },
      { key: "demeritPoints", header: "Pts" },
      {
        key: "vehicle",
        header: "Plate",
        render: (r) => r.vehicle?.plateNo || "-",
      },
      {
        key: "violation",
        header: "Violation",
        render: (r) => r.violationType?.code || "-",
      },
      {
        key: "officer",
        header: "Officer",
        render: (r) => r.issuedBy?.email || "-",
      },
      {
        key: "driver",
        header: "Driver",
        render: (r) => r.driverUser?.email || "-",
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Penalties</h1>

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
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button
          className="rounded-xl bg-black text-white text-sm px-3 py-2"
          onClick={() => fetch(1)}
        >
          Apply
        </button>
      </div>

      <Table columns={columns} rows={penalties?.rows || []} />

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Page <b>{penalties?.page || 1}</b> · Total{" "}
          <b>{penalties?.total || 0}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={(penalties?.page || 1) <= 1}
            onClick={() => fetch((penalties?.page || 1) - 1)}
          >
            Prev
          </button>
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={
              (penalties?.page || 1) * (penalties?.limit || 20) >=
              (penalties?.total || 0)
            }
            onClick={() => fetch((penalties?.page || 1) + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
