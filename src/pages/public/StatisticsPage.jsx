import { useEffect } from "react";
import { usePublicStore } from "../../store/public.store";
import { useUIStore } from "../../store/ui.store";

export default function StatisticsPage() {
  const stats = usePublicStore((s) => s.stats);
  const categoryBreakdown = usePublicStore((s) => s.categoryBreakdown);
  const loadPublicHomeData = usePublicStore((s) => s.loadPublicHomeData);
  const loading = usePublicStore((s) => s.loading.home);

  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadPublicHomeData().catch((err) =>
      toast(
        "error",
        err?.response?.data?.message || "Failed to load statistics",
      ),
    );
  }, [loadPublicHomeData, toast]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Public Statistics
        </h1>
        <p className="mt-3 text-slate-400 max-w-3xl leading-7">
          High-level incident metrics and category trends based on public
          incident records.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatBox title="Total Incidents" value={stats.total} tone="indigo" />
        <StatBox title="Pending Cases" value={stats.pending} tone="orange" />
        <StatBox title="Resolved Cases" value={stats.resolved} tone="green" />
        <StatBox title="Accidents" value={stats.accidents} tone="red" />
        <StatBox title="Breakdowns" value={stats.breakdowns} tone="orange" />
        <StatBox title="Emergency Cases" value={stats.emergency} tone="blue" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-indigo-300">
          Incident category distribution
        </h2>

        {loading ? (
          <div className="mt-6 text-slate-400">Loading statistics...</div>
        ) : (
          <div className="mt-6 space-y-5">
            {categoryBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300">
                    {item.label} ({item.count})
                  </span>
                  <span className="text-slate-400">{item.percent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ title, value, tone = "indigo" }) {
  const map = {
    indigo: "border-indigo-700/40 bg-indigo-950/20",
    orange: "border-orange-700/40 bg-orange-950/20",
    green: "border-emerald-700/40 bg-emerald-950/20",
    red: "border-red-700/40 bg-red-950/20",
    blue: "border-sky-700/40 bg-sky-950/20",
  };

  return (
    <div className={`rounded-2xl border p-6 ${map[tone] || map.indigo}`}>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
