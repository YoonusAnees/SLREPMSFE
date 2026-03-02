import { useEffect } from "react";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function DriverPenalties() {
  const loadPenalties = useDriverStore((s) => s.loadPenalties);
  const penalties = useDriverStore((s) => s.penalties);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadPenalties().catch((e) =>
      toast("error", e?.response?.data?.message || "Failed to load penalties"),
    );
  }, []);

  const columns = [
    {
      key: "occurredAt",
      header: "Date",
      render: (r) => new Date(r.occurredAt).toLocaleString(),
    },
    { key: "status", header: "Status" },
    { key: "fineLkr", header: "Fine (LKR)" },
    { key: "demeritPoints", header: "Points" },
    {
      key: "violationType",
      header: "Violation",
      render: (r) => r.violationType?.title || r.violationType?.code || "-",
    },
    {
      key: "vehicle",
      header: "Vehicle",
      render: (r) => r.vehicle?.plateNo || "-",
    },
    { key: "locationText", header: "Location" },
  ];

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Penalties</h1>
      <Table columns={columns} rows={penalties} />
      <div className="text-xs text-gray-500">
        Payment (Stripe) will be linked in Phase 5 (Payments & Receipts).
      </div>
    </div>
  );
}
