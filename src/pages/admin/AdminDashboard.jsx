import { useEffect, useMemo } from "react";
import Card from "../../components/Card";
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
  BarChart,
  Bar,
  Legend,
} from "recharts";

function StatCard({ label, value, sub, badge }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
        </div>
        {badge ? (
          <span className="px-3 py-1 rounded-full text-xs border bg-gray-50">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>
          <b>{value}</b> ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const loadDashboard = useAdminStore((s) => s.loadDashboard);
  const dashboard = useAdminStore((s) => s.dashboard);
  const loading = useAdminStore((s) => s.loading.dashboard);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadDashboard().catch((e) =>
      toast("error", e?.response?.data?.message || "Failed to load dashboard"),
    );
  }, []);

  const kpi = dashboard?.kpi || {};
  const charts = dashboard?.charts || {};

  const revenueSeries = charts.revenueDaily || [];
  const topViolations = charts.topViolations || [];
  const penaltySplit = charts.penaltySplit || [
    { name: "PAID", value: 0 },
    { name: "UNPAID", value: 0 },
  ];
  const incidentsBySeverity = charts.incidentsBySeverity || [];
  const roleCounts = charts.roleCounts || []; // [{ role, count }]

  const money = (n) => Number(n || 0).toLocaleString("en-LK");

  // total users for progress rows
  const totalUsers = Number(kpi.totalUsers || 0);

  const roleMap = useMemo(() => {
    const map = {};
    for (const r of roleCounts) map[r.role] = r.count;
    return map;
  }, [roleCounts]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Overview of users, penalties, payments and incidents (live stats)
          </p>
        </div>
        {loading ? (
          <span className="text-xs px-3 py-1 rounded-full border bg-gray-50">
            Loading…
          </span>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full border bg-gray-50">
            Updated
          </span>
        )}
      </div>

      {/* KPI GRID */}
      <div className="grid md:grid-cols-4 gap-3">
        <StatCard
          label="Total Users"
          value={money(kpi.totalUsers)}
          badge="All roles"
        />
        <StatCard
          label="Total Penalties"
          value={money(kpi.totalPenalties)}
          badge="Issued"
        />
        <StatCard
          label="Payments (SUCCESS)"
          value={money(kpi.totalPayments)}
          badge="Paid"
        />
        <StatCard
          label="Paid Penalties (LKR)"
          value={money(kpi.revenueLkr)}
          badge="Total"
        />
      </div>

      {/* ROLE KPIs (separate like you asked) */}
      <div className="grid md:grid-cols-5 gap-3">
        <StatCard
          label="Drivers"
          value={money(kpi.totalDrivers)}
          sub="Registered drivers"
        />
        <StatCard
          label="Officers"
          value={money(kpi.totalOfficers)}
          sub="Traffic officers"
        />
        <StatCard
          label="Dispatchers"
          value={money(kpi.totalDispatchers)}
          sub="Control room"
        />
        <StatCard
          label="Rescue Teams"
          value={money(kpi.totalRescue)}
          sub="Response units"
        />
        <StatCard
          label="Admins"
          value={money(kpi.totalAdmins)}
          sub="System admins"
        />
      </div>

      {/* Role distribution panel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="User Role Distribution" subtitle="How many users per role">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ProgressRow
                label="DRIVER"
                value={roleMap.DRIVER || 0}
                total={totalUsers}
              />
              <ProgressRow
                label="OFFICER"
                value={roleMap.OFFICER || 0}
                total={totalUsers}
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
              />
              <ProgressRow
                label="ADMIN"
                value={roleMap.ADMIN || 0}
                total={totalUsers}
              />
            </div>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleCounts}>
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card title="Penalty Status Split" subtitle="Paid vs Unpaid">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={penaltySplit}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Revenue Trend" subtitle="Daily revenue (LKR)">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amountLkr" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Top Violation Types"
          subtitle="Most frequent issued penalties"
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViolations}>
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Incidents by Severity" subtitle="Rescue load indicator">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsBySeverity}>
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Quick Health Summary" subtitle="Simple status indicators">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border rounded-xl p-3">
              <span className="text-gray-600">Unpaid penalties</span>
              <span className="px-3 py-1 rounded-full border bg-gray-50">
                {money(
                  penaltySplit.find((x) => x.name === "UNPAID")?.value || 0,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between border rounded-xl p-3">
              <span className="text-gray-600">Active rescue teams</span>
              <span className="px-3 py-1 rounded-full border bg-gray-50">
                {money(kpi.activeRescueTeams)}
              </span>
            </div>

            <div className="flex items-center justify-between border rounded-xl p-3">
              <span className="text-gray-600">
                Open incidents (NEW/DISPATCHED)
              </span>
              <span className="px-3 py-1 rounded-full border bg-gray-50">
                {money(kpi.openIncidents)}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              {/* Unpaid penalties */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <span className="text-gray-600">Unpaid penalties</span>
                <span className="px-3 py-1 rounded-full border bg-yellow-50 text-yellow-700">
                  {money(
                    penaltySplit.find((x) => x.name === "UNPAID")?.value || 0,
                  )}
                </span>
              </div>

              {/* Paid penalties */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <span className="text-gray-600">Resolved penalties</span>
                <span className="px-3 py-1 rounded-full border bg-green-50 text-green-700">
                  {money(
                    penaltySplit.find((x) => x.name === "PAID")?.value || 0,
                  )}
                </span>
              </div>

              {/* Open incidents */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <span className="text-gray-600">Active road incidents</span>
                <span className="px-3 py-1 rounded-full border bg-red-50 text-red-700">
                  {money(kpi.openIncidents)}
                </span>
              </div>

              {/* Rescue teams */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <span className="text-gray-600">Available rescue teams</span>
                <span className="px-3 py-1 rounded-full border bg-blue-50 text-blue-700">
                  {money(kpi.activeRescueTeams)}
                </span>
              </div>

              {/* Enforcement indicator */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <span className="text-gray-600">Driver compliance rate</span>
                <span className="px-3 py-1 rounded-full border bg-gray-50 text-gray-800">
                  {Math.max(
                    0,
                    100 -
                      Math.round(
                        ((penaltySplit.find((x) => x.name === "UNPAID")
                          ?.value || 0) /
                          (kpi.totalDrivers || 1)) *
                          100,
                      ),
                  )}
                  %
                </span>
              </div>

              {/* Road safety message */}
              <div className="text-xs text-gray-500 border rounded-xl p-3 bg-gray-50">
                Road safety monitoring panel. High unpaid penalties or frequent
                incidents may indicate enforcement gaps or high-risk driving
                areas.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
