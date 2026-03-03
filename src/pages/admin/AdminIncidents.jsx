import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminIncidents() {
  const toast = useUIStore((s) => s.toast);
  const loadIncidents = useAdminStore((s) => s.loadIncidents);
  const incidents = useAdminStore((s) => s.incidents);

  const [status, setStatus] = useState("");

  async function fetch(page = 1) {
    try {
      await loadIncidents({ page, limit: 20, status: status || undefined });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load incidents");
    }
  }

  useEffect(() => {
    fetch(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Created",
        render: (r) => new Date(r.createdAt).toLocaleString(),
      },
      { key: "status", header: "Status" },
      { key: "type", header: "Type" },
      { key: "severity", header: "Severity" },
      {
        key: "reportedBy",
        header: "Reported By",
        render: (r) => r.reportedBy?.email || "-",
      },
      { key: "locationText", header: "Location" },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Incidents</h1>

      <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-2 gap-2">
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="NEW">NEW</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button
          className="rounded-xl bg-black text-white text-sm px-3 py-2"
          onClick={() => fetch(1)}
        >
          Apply
        </button>
      </div>

      <Table columns={columns} rows={incidents?.rows || []} />

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Page <b>{incidents?.page || 1}</b> · Total{" "}
          <b>{incidents?.total || 0}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={(incidents?.page || 1) <= 1}
            onClick={() => fetch((incidents?.page || 1) - 1)}
          >
            Prev
          </button>
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={
              (incidents?.page || 1) * (incidents?.limit || 20) >=
              (incidents?.total || 0)
            }
            onClick={() => fetch((incidents?.page || 1) + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
