import { useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useUIStore } from "../../store/ui.store";
import { useDispatcherStore } from "../../store/dispatcher.store";

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value ?? 0}</div>
    </div>
  );
}

export default function DispatcherDashboard() {
  const toast = useUIStore((s) => s.toast);

  const loadStats = useDispatcherStore((s) => s.loadStats);
  const loadIncidents = useDispatcherStore((s) => s.loadIncidents);
  const loadMyDispatches = useDispatcherStore((s) => s.loadMyDispatches);

  const stats = useDispatcherStore((s) => s.stats);
  const incidents = useDispatcherStore((s) => s.incidents);
  const myDispatches = useDispatcherStore((s) => s.myDispatches);

  async function refresh() {
    try {
      await Promise.all([loadStats(), loadIncidents(), loadMyDispatches()]);
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load dashboard");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const newIncidents = (incidents || []).filter((x) => x.status === "NEW").slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Dispatcher Dashboard</h1>
          <p className="text-sm text-gray-600">Live overview of incidents and dispatch workload.</p>
        </div>
        <Button onClick={refresh}>Refresh</Button>
      </div>

      <div className="grid md:grid-cols-5 gap-3">
        <StatCard title="NEW Incidents" value={stats?.incidents?.NEW} />
        <StatCard title="DISPATCHED" value={stats?.incidents?.DISPATCHED} />
        <StatCard title="RESOLVED" value={stats?.incidents?.RESOLVED} />
        <StatCard title="CANCELLED" value={stats?.incidents?.CANCELLED} />
        <StatCard title="Active Dispatches" value={stats?.activeDispatches} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card title="Latest NEW incidents" subtitle="Top 5 newest incidents waiting for dispatch">
          <div className="space-y-2">
            {newIncidents.length === 0 ? (
              <div className="text-sm text-gray-500">No NEW incidents 🎉</div>
            ) : (
              newIncidents.map((i) => (
                <div key={i.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{i.type}</div>
                    <div className="text-xs px-2 py-1 rounded-full border">{i.severity}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{i.locationText || "-"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(i.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="My recent dispatches" subtitle="Latest 5 dispatch actions you did">
          <div className="space-y-2">
            {(myDispatches || []).slice(0, 5).length === 0 ? (
              <div className="text-sm text-gray-500">No dispatches yet.</div>
            ) : (
              (myDispatches || []).slice(0, 5).map((d) => (
                <div key={d.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {d.incident?.type || "Incident"}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full border">{d.status}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Team: {d.rescueTeam?.name || d.rescueTeam?.code || "-"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}