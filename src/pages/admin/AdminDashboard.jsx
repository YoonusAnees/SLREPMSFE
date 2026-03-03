import { useEffect } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";

// Use your existing Card component if you want
export default function AdminDashboard() {
  const loadDashboard = useAdminStore((s) => s.loadDashboard);
  const dashboard = useAdminStore((s) => s.dashboard);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadDashboard().catch((e) =>
      toast("error", e?.response?.data?.message || "Failed to load dashboard"),
    );
  }, []);

  const kpi = dashboard?.kpi;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Total Users</div>
          <div className="text-2xl font-semibold">{kpi?.totalUsers ?? "-"}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Total Drivers</div>
          <div className="text-2xl font-semibold">
            {kpi?.totalDrivers ?? "-"}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Unpaid Penalties</div>
          <div className="text-2xl font-semibold">
            {kpi?.unpaidPenalties ?? "-"}
          </div>
        </div>
      </div>

      {/* If you already built charts before, mount them here */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Charts</div>
        <div className="text-xs text-gray-500 mt-1">
          Put Revenue chart / Top violations chart here.
        </div>
      </div>
    </div>
  );
}
