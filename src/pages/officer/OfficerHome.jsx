import Card from "../../components/Card";

export default function OfficerHome() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Officer Dashboard
          </h1>
          <p className="mt-1.5 text-indigo-300/90">
            Enforce road safety • Issue violations • Verify compliance
          </p>
        </div>

        {/* Quick status badge (mobile friendly) */}
        <div className="sm:hidden self-start">
          <div
            className={`
              inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border
              bg-red-900/40 text-red-300 border-red-700/50
            `}
          >
            Enforcement Active
          </div>
        </div>
      </div>

      {/* Main content cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quick Tasks Card - main focus */}
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
              <span className="font-medium text-green-400">Ownership check</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Violation Catalog</span>
              <span className="font-medium text-amber-300">View / manage types</span>
            </div>

            <div className="pt-3">
              <p className="text-xs text-slate-500">
                Use sidebar navigation for full tools and reports
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder cards - you can replace with real data later */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">📊</span>
              Today's Activity
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Quick enforcement stats
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Penalties Issued</span>
              <span className="font-semibold text-red-400">0</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Vehicles Verified</span>
              <span className="font-semibold text-green-400">0</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Pending Actions</span>
              <div
                className={`
                  inline-flex px-3.5 py-1.5 rounded-full text-sm font-medium border
                  bg-amber-900/40 text-amber-300 border-amber-700/50
                `}
              >
                0
              </div>
            </div>
          </div>
        </div>

        {/* Another placeholder card */}
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
              <span className="text-slate-400">Overdue Penalties</span>
              <span className="font-semibold text-red-400">0</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">High Severity Incidents</span>
              <span className="font-semibold text-orange-400">0</span>
            </div>

            <div className="pt-3 text-xs text-slate-500">
              No active alerts at this time
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-xs text-center sm:text-left text-slate-500 pt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}