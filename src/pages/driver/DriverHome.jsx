import { useEffect } from "react";
import Card from "../../components/Card";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";

export default function DriverHome() {
  const loadMe = useDriverStore((s) => s.loadMe);
  const me = useDriverStore((s) => s.me);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadMe().catch((e)=>toast("error", e?.response?.data?.message || "Failed to load driver"));
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Driver Dashboard</h1>

      <Card title="License Status" subtitle="Demerit point policy">
        <div className="text-sm">
          <div><b>License No:</b> {me?.licenseNo || "-"}</div>
          <div><b>Current Points:</b> {me?.currentPoints ?? "-"}</div>
          <div><b>Status:</b> {me?.licenseStatus || "-"}</div>
          <div><b>Suspended Until:</b> {me?.suspendedUntil ? new Date(me.suspendedUntil).toLocaleString() : "-"}</div>
        </div>
      </Card>
    </div>
  );
}