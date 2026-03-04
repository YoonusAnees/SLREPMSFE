import { useEffect, useMemo } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value ?? 0}</div>
    </div>
  );
}

export default function RescueDashboard() {
  const toast = useUIStore((s) => s.toast);
  const loadMe = useRescueStore((s) => s.loadMe);
  const loadMyDispatches = useRescueStore((s) => s.loadMyDispatches);
  const me = useRescueStore((s) => s.me);
  const myDispatches = useRescueStore((s) => s.myDispatches);

  async function refresh() {
    try {
      await Promise.all([loadMe(), loadMyDispatches()]);
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to load rescue dashboard",
      );
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    const list = myDispatches || [];
    const active = list.filter((d) =>
      ["ASSIGNED", "EN_ROUTE", "ON_SCENE"].includes(d.status),
    );
    const completed = list.filter((d) => d.status === "COMPLETED");
    const cancelled = list.filter((d) => d.status === "CANCELLED");
    return {
      total: list.length,
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [myDispatches]);

  const next = (myDispatches || []).find((d) =>
    ["ASSIGNED", "EN_ROUTE", "ON_SCENE"].includes(d.status),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Rescue Dashboard</h1>
          <p className="text-sm text-gray-600">
            Team: <b>{me?.teamCode || "-"}</b> · Status:{" "}
            <b>{me?.status || "-"}</b>
          </p>
        </div>
        <Button onClick={refresh}>Refresh</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat title="Total Dispatches" value={counts.total} />
        <Stat title="Active" value={counts.active} />
        <Stat title="Completed" value={counts.completed} />
        <Stat title="Cancelled" value={counts.cancelled} />
      </div>

      <Card title="Current Assignment" subtitle="Your latest active dispatch">
        {!next ? (
          <div className="text-sm text-gray-500">
            No active dispatch right now.
          </div>
        ) : (
          <div className="rounded-xl border p-3 space-y-1">
            <div className="text-sm font-medium">
              Incident: {next.incident?.type} · {next.incident?.severity}
            </div>
            <div className="text-xs text-gray-600">
              {next.incident?.locationText || "-"}
            </div>
            <div className="text-xs text-gray-500">Status: {next.status}</div>
          </div>
        )}
      </Card>
    </div>
  );
}
