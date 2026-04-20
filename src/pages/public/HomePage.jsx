import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePublicStore } from "../../store/public.store";
import { useUIStore } from "../../store/ui.store";

function statusBadge(status) {
  const s = String(status || "").toUpperCase();

  if (["RESOLVED", "CLOSED", "COMPLETED"].includes(s)) {
    return "bg-green-900/40 text-green-300 border-green-700/50";
  }
  if (
    [
      "NEW",
      "PENDING",
      "OPEN",
      "SUBMITTED",
      "IN_PROGRESS",
      "DISPATCHED",
    ].includes(s)
  ) {
    return "bg-orange-900/40 text-orange-300 border-orange-700/50";
  }
  return "bg-slate-800/50 text-slate-300 border-slate-700/50";
}

function severityBadge(severity) {
  const s = String(severity || "").toUpperCase();

  if (s === "HIGH" || s === "CRITICAL") {
    return "bg-red-900/40 text-red-300 border-red-700/50";
  }
  if (s === "MEDIUM") {
    return "bg-orange-900/40 text-orange-300 border-orange-700/50";
  }
  return "bg-green-900/40 text-green-300 border-green-700/50";
}

export default function HomePage() {
  const stats = usePublicStore((s) => s.stats);
  const categoryBreakdown = usePublicStore((s) => s.categoryBreakdown);
  const recentIncidents = usePublicStore((s) => s.recentIncidents);
  const loadPublicHomeData = usePublicStore((s) => s.loadPublicHomeData);
  const loading = usePublicStore((s) => s.loading.home);

  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadPublicHomeData().catch((err) =>
      toast(
        "error",
        err?.response?.data?.message || "Failed to load public incidents",
      ),
    );
  }, [loadPublicHomeData, toast]);

  return (
    <div className="bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.14),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-700/40 bg-indigo-950/20 text-indigo-300 text-sm">
                <span>🚦</span>
                Sri Lanka Road E-Penalty Management System
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Public road safety, incident awareness, and traffic response
                <span className="text-indigo-400"> in one place</span>.
              </h1>

              <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-8">
                SLREPSMS provides a public-facing view of incident reporting,
                safety awareness, and general road event activity while keeping
                private user data protected.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/report-incident"
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
                >
                  Report Public Incident
                </Link>

                <Link
                  to="/privacy-policy"
                  className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800/70 font-semibold transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                title="Total Incidents"
                value={stats.total}
                note="All public incident records"
                icon="🚨"
                tone="red"
              />
              <StatCard
                title="Accidents"
                value={stats.accidents}
                note="Collision and crash-related"
                icon="🚗"
                tone="orange"
              />
              <StatCard
                title="Resolved Cases"
                value={stats.resolved}
                note="Closed or completed"
                icon="✅"
                tone="green"
              />
              <StatCard
                title="Emergency Cases"
                value={stats.emergency}
                note="Rescue / urgent assistance"
                icon="🚑"
                tone="blue"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Public incident statistics
            </h2>
            <p className="mt-3 text-slate-400 leading-7">
              These insights are based on incident records loaded from the
              public incident feed.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-indigo-300">
                Incident category breakdown
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Distribution of accident, breakdown, rescue, and other public
                incident types.
              </p>

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
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-indigo-300">
                Current public indicators
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Quick view of incident handling movement.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MetricTile
                  label="Pending Review"
                  value={stats.pending}
                  tone="orange"
                />
                <MetricTile
                  label="Resolved"
                  value={stats.resolved}
                  tone="green"
                />
                <MetricTile
                  label="Accident Reports"
                  value={stats.accidents}
                  tone="red"
                />
                <MetricTile
                  label="Emergency Linked"
                  value={stats.emergency}
                  tone="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Recent public incidents
              </h2>
              <p className="mt-3 text-slate-400 leading-7 max-w-2xl">
                Public summary view. Sensitive personal information should not
                be shown here.
              </p>
            </div>

            {/* <Link
              to="/report-incident"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Add Incident
            </Link> */}
          </div>

          <div className="mt-10 grid gap-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
                Loading public incidents...
              </div>
            ) : recentIncidents.length > 0 ? (
              recentIncidents.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {item?.title ||
                          item?.type ||
                          item?.category ||
                          "Incident"}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {item?.locationText ||
                          item?.location ||
                          item?.city ||
                          "Unknown location"}{" "}
                        •{" "}
                        {new Date(
                          item?.createdAt || item?.reportedAt || Date.now(),
                        ).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                      {item?.description && (
                        <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${severityBadge(
                          item?.severity || "LOW",
                        )}`}
                      >
                        {(item?.severity || "LOW").toUpperCase()} Severity
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusBadge(
                          item?.status || "PENDING",
                        )}`}
                      >
                        {item?.status || "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
                No public incidents available yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, note, icon, tone = "red" }) {
  const toneClass = {
    red: "from-red-950/70 to-red-900/20 border-red-700/40",
    orange: "from-orange-950/70 to-orange-900/20 border-orange-700/40",
    green: "from-emerald-950/70 to-emerald-900/20 border-emerald-700/40",
    blue: "from-sky-950/70 to-sky-900/20 border-sky-700/40",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b p-5 shadow-xl shadow-black/30 ${
        toneClass[tone] || toneClass.red
      }`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-4 text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{note}</div>
    </div>
  );
}

function MetricTile({ label, value, tone = "blue" }) {
  const map = {
    blue: "border-sky-700/40 bg-sky-950/20 text-sky-300",
    green: "border-emerald-700/40 bg-emerald-950/20 text-emerald-300",
    red: "border-red-700/40 bg-red-950/20 text-red-300",
    orange: "border-orange-700/40 bg-orange-950/20 text-orange-300",
  };

  return (
    <div className={`rounded-xl border p-4 ${map[tone] || map.blue}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
