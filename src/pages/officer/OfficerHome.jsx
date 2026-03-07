import { useEffect, useMemo } from "react";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";

export default function OfficerHome() {
  const toast = useUIStore((s) => s.toast);

  const officerDashboard = useOfficerStore((s) => s.officerDashboard);
  const violationTypes = useOfficerStore((s) => s.violationTypes);
  const lookedUp = useOfficerStore((s) => s.lookedUp);
  const lookupLoading = useOfficerStore((s) => s.lookupLoading);
  const lookupError = useOfficerStore((s) => s.lookupError);
  const dashboardLoading = useOfficerStore((s) => s.dashboardLoading);
  const dashboardError = useOfficerStore((s) => s.dashboardError);
  const loadOfficerDashboard = useOfficerStore((s) => s.loadOfficerDashboard);

  useEffect(() => {
    loadOfficerDashboard().catch((err) => {
      toast(
        "error",
        err?.response?.data?.message || "Failed to load officer dashboard",
      );
    });
  }, [loadOfficerDashboard, toast]);

  const stats = officerDashboard?.stats || {
    issuedPenalties: 0,
    verifiedVehicles: 0,
    reviewedIncidents: 0,
    resolvedIncidents: 0,
    unpaidIssuedPenalties: 0,
    paidIssuedPenalties: 0,
    highSeverityOpenIncidents: 0,
  };

  const quickInsight = useMemo(() => {
    if (dashboardError) {
      return "Some dashboard data could not be loaded. Please refresh and try again.";
    }

    if (stats.highSeverityOpenIncidents > 0) {
      return `${stats.highSeverityOpenIncidents} high severity incident(s) are still open.`;
    }

    if (stats.unpaidIssuedPenalties > 0) {
      return `${stats.unpaidIssuedPenalties} penalty record(s) issued by you are still unpaid.`;
    }

    return "Officer operations are stable at the moment.";
  }, [dashboardError, stats]);

  if (dashboardLoading && !officerDashboard) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 p-6 text-slate-300">
        Loading officer dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Officer Dashboard
          </h1>
          <p className="mt-1.5 text-indigo-300/90">
            Enforce road safety • Issue violations • Verify compliance
          </p>
        </div>

        <div className="sm:hidden self-start">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border bg-red-900/40 text-red-300 border-red-700/50">
            Enforcement Active
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Issued Penalties"
          value={stats.issuedPenalties}
          subtitle={`${stats.unpaidIssuedPenalties} unpaid`}
          icon="📄"
          valueClass="text-red-300"
        />
        <StatCard
          title="Verified Vehicles"
          value={stats.verifiedVehicles}
          subtitle="Verified by you"
          icon="🚗"
          valueClass="text-green-300"
        />
        <StatCard
          title="Reviewed Incidents"
          value={stats.reviewedIncidents}
          subtitle="Handled by you"
          icon="📝"
          valueClass="text-amber-300"
        />
        <StatCard
          title="Resolved Incidents"
          value={stats.resolvedIncidents}
          subtitle="Closed by you"
          icon="✅"
          valueClass="text-blue-300"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              Quick Enforcement Tasks
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Most frequently used actions
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Issue Penalty</span>
              <span className="font-medium text-indigo-300">
                By license / plate
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Verify Vehicle</span>
              <span className="font-medium text-green-400">
                Ownership check
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Violation Catalog</span>
              <span className="font-medium text-amber-300">
                {Array.isArray(violationTypes) ? violationTypes.length : 0}{" "}
                types
              </span>
            </div>

            <div className="pt-3">
              <p className="text-xs text-slate-500">
                Use sidebar navigation for full tools and reports
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">📊</span>
              My Activity
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Your enforcement performance
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Paid Penalties</span>
              <span className="font-semibold text-green-400">
                {stats.paidIssuedPenalties}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Unpaid Penalties</span>
              <span className="font-semibold text-red-400">
                {stats.unpaidIssuedPenalties}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">High Severity Open</span>
              <span className="font-semibold text-orange-400">
                {stats.highSeverityOpenIncidents}
              </span>
            </div>

            <div className="pt-3 text-xs text-slate-500">
              Dashboard is based on actions recorded under your officer account
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">🚨</span>
              High Priority
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Critical alerts & reminders
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Open High Severity</span>
              <span className="font-semibold text-orange-400">
                {stats.highSeverityOpenIncidents}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Unpaid Issued Penalties</span>
              <span className="font-semibold text-red-400">
                {stats.unpaidIssuedPenalties}
              </span>
            </div>

            <div className="pt-3 text-xs text-slate-500">{quickInsight}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="License Lookup State"
          subtitle="Latest officer search result"
          icon="🪪"
        >
          {lookupLoading ? (
            <p className="text-slate-400 text-sm">Looking up driver...</p>
          ) : lookupError ? (
            <p className="text-red-300 text-sm">{lookupError}</p>
          ) : lookedUp ? (
            <div className="space-y-3 text-sm">
              <InfoRow
                label="Driver Name"
                value={lookedUp?.user?.name || "—"}
              />
              <InfoRow label="Email" value={lookedUp?.user?.email || "—"} />
              <InfoRow
                label="License No"
                value={lookedUp?.driver?.licenseNo || "—"}
                mono
              />
              <InfoRow
                label="Points"
                value={lookedUp?.driver?.currentPoints ?? "—"}
              />
              <InfoRow
                label="Status"
                value={lookedUp?.driver?.licenseStatus || "—"}
              />
              <InfoRow
                label="Vehicles"
                value={lookedUp?.vehicles?.length ?? 0}
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No recent driver lookup in store.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="System Notes"
          subtitle="Officer operation reminders"
          icon="📌"
        >
          <div className="space-y-4">
            <InsightBox
              title="Incident Review"
              text="Use the Incident Review page to inspect incidents and mark them reviewed or resolved."
              tone="amber"
            />
            <InsightBox
              title="Vehicle Verification"
              text="Verified vehicle actions are now tracked under your officer account."
              tone="emerald"
            />
            <InsightBox
              title="Penalty Tracking"
              text="All penalties you issue are counted against your own dashboard stats."
              tone="indigo"
            />
          </div>
        </SectionCard>
      </div>

      <div className="text-xs text-center sm:text-left text-slate-500 pt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, valueClass = "" }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 backdrop-blur-sm shadow-xl shadow-black/30 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className={`mt-2 text-2xl font-bold text-white ${valueClass}`}>
            {value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
        <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
          <span>{icon}</span>
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center gap-4 py-1 border-b border-slate-800/60">
      <span className="text-slate-400">{label}</span>
      <span className={`${mono ? "font-mono" : ""} text-white text-right`}>
        {value}
      </span>
    </div>
  );
}

function InsightBox({ title, text, tone = "indigo" }) {
  const tones = {
    indigo: "border-indigo-700/40 bg-indigo-950/20",
    emerald: "border-emerald-700/40 bg-emerald-950/20",
    rose: "border-rose-700/40 bg-rose-950/20",
    amber: "border-amber-700/40 bg-amber-950/20",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.indigo}`}>
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {title}
      </div>
      <p className="text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}
