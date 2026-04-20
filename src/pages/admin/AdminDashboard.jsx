import { useEffect, useMemo } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function StatCard({ label, value, sub, badge, color = "indigo" }) {
  const colorClasses =
    {
      indigo: "bg-indigo-900/30 border-indigo-700/50 text-indigo-200",
      green: "bg-green-900/30 border-green-700/50 text-green-200",
      red: "bg-red-900/30 border-red-700/50 text-red-200",
      amber: "bg-amber-900/30 border-amber-700/50 text-amber-200",
    }[color] || "bg-slate-800/40 border-slate-700/50 text-slate-200";

  return (
    <div
      className={`
        rounded-xl border backdrop-blur-sm shadow-lg shadow-black/30
        p-5 transition-all hover:scale-[1.02]
        ${colorClasses}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-80">
            {label}
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{value}</div>
          {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
        </div>
        {badge && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-black/30 border border-current/30">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, color = "indigo" }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = {
    indigo: "bg-indigo-600",
    green: "bg-green-600",
    red: "bg-red-600",
    amber: "bg-amber-600",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-200">
          {value.toLocaleString()} <span className="opacity-70">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-slate-800/70 rounded-full overflow-hidden border border-slate-700/40">
        <div
          className={`h-full ${colorMap[color] || "bg-indigo-600"} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function AdminDashboard() {
  const loadDashboard = useAdminStore((s) => s.loadDashboard);
  const dashboard = useAdminStore((s) => s.dashboard);
  const loading = useAdminStore((s) => s.loading.dashboard);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadDashboard().catch((e) =>
      toast(
        "error",
        e?.response?.data?.message || "Failed to load dashboard data",
      ),
    );
  }, [loadDashboard, toast]);

  const kpi = dashboard?.kpi || {};
  const charts = dashboard?.charts || {};

  const revenueSeries = charts.revenueDaily || [];
  const topViolations = charts.topViolations || [];
  const penaltySplit = charts.penaltySplit || [
    { name: "PAID", value: 0 },
    { name: "UNPAID", value: 0 },
  ];
  const incidentsBySeverity = charts.incidentsBySeverity || [];
  const roleCounts = charts.roleCounts || [];

  const money = (n) => Number(n || 0).toLocaleString("si-LK");

  const totalUsers = Number(kpi.totalUsers || 0);

  const roleMap = useMemo(() => {
    const map = {};
    roleCounts.forEach((r) => (map[r.role] = r.count));
    return map;
  }, [roleCounts]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Control Center
          </h1>
          <p className="mt-2 text-slate-400">
            System-wide overview • Users • Penalties • Revenue • Incidents
          </p>
        </div>

        <div
          className={`
            px-4 py-2 rounded-lg text-sm font-medium border
            ${
              loading
                ? "bg-slate-800/50 border-slate-700 text-slate-400"
                : "bg-indigo-900/40 border-indigo-700/50 text-indigo-300"
            }
          `}
        >
          {loading ? "Updating..." : "Live • Updated"}
        </div>
      </div>

      {/* KPI Overview - Main metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={money(kpi.totalUsers)}
          badge="All Roles"
        />
        <StatCard
          label="Total Penalties"
          value={money(kpi.totalPenalties)}
          badge="Issued"
          color="amber"
        />
        <StatCard
          label="Successful Payments"
          value={money(kpi.totalPayments)}
          badge="Received"
          color="green"
        />
        <StatCard
          label="Total Paid (LKR)"
          value={money(kpi.revenueLkr)}
          badge="Collected"
          color="indigo"
        />
      </div>

      {/* Role Breakdown */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Drivers"
          value={money(kpi.totalDrivers)}
          sub="Registered"
        />
        <StatCard
          label="Officers"
          value={money(kpi.totalOfficers)}
          sub="Enforcement"
          color="red"
        />
        <StatCard
          label="Dispatchers"
          value={money(kpi.totalDispatchers)}
          sub="Control Room"
        />
        <StatCard
          label="Rescue Teams"
          value={money(kpi.totalRescue)}
          sub="Emergency"
          color="amber"
        />
        <StatCard
          label="Administrators"
          value={money(kpi.totalAdmins)}
          sub="System"
        />
      </div>

      {/* Charts - Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              User Role Distribution
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Percentage of total registered users
            </p>
          </div>

          <div className="p-6 grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProgressRow
                label="DRIVER"
                value={roleMap.DRIVER || 0}
                total={totalUsers}
              />
              <ProgressRow
                label="OFFICER"
                value={roleMap.OFFICER || 0}
                total={totalUsers}
                color="red"
              />
              <ProgressRow
                label="DISPATCHER"
                value={roleMap.DISPATCHER || 0}
                total={totalUsers}
              />
              <ProgressRow
                label="RESCUE"
                value={roleMap.RESCUE || 0}
                total={totalUsers}
                color="amber"
              />
              <ProgressRow
                label="ADMIN"
                value={roleMap.ADMIN || 0}
                total={totalUsers}
              />
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleCounts}>
                  <XAxis dataKey="role" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Penalty Status Split */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              Penalty Payment Status
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Paid vs Unpaid breakdown
            </p>
          </div>

          <div className="p-8 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={penaltySplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {penaltySplit.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "PAID" ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts - Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              Daily Revenue Trend
            </h2>
            <p className="text-sm text-slate-400 mt-1">Collected fines (LKR)</p>
          </div>
          <div className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="amountLkr"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#6366f1", stroke: "#1e293b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Violation Types */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              Most Frequent Violations
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top issued penalty types
            </p>
          </div>
          <div className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViolations}>
                <XAxis dataKey="code" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Health Summary */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            System Health Snapshot
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Key indicators at a glance
          </p>
        </div>

        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className={`rounded-xl border p-4 ${penaltySplit.find((x) => x.name === "UNPAID")?.value > 0 ? "border-red-700/50 bg-red-950/30" : "border-green-700/50 bg-green-950/20"}`}
          >
            <div className="text-sm text-slate-300">Unpaid Penalties</div>
            <div className="text-2xl font-bold mt-2 text-red-300">
              {money(penaltySplit.find((x) => x.name === "UNPAID")?.value || 0)}
            </div>
          </div>

          <div className="rounded-xl border border-green-700/50 bg-green-950/20 p-4">
            <div className="text-sm text-slate-300">Resolved / Paid</div>
            <div className="text-2xl font-bold mt-2 text-green-300">
              {money(penaltySplit.find((x) => x.name === "PAID")?.value || 0)}
            </div>
          </div>

          <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4">
            <div className="text-sm text-slate-300">Open Incidents</div>
            <div className="text-2xl font-bold mt-2 text-amber-300">
              {money(kpi.openIncidents || 0)}
            </div>
          </div>

          <div className="rounded-xl border border-blue-700/50 bg-blue-950/20 p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-slate-300">Available Rescue Teams</div>
            <div className="text-2xl font-bold mt-2 text-blue-300">
              {money(kpi.activeRescueTeams || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
