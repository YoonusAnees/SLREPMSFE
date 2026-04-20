import { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";

export default function DriverHome() {
  const me = useDriverStore((s) => s.me);
  const vehicles = useDriverStore((s) => s.vehicles);
  const penalties = useDriverStore((s) => s.penalties);
  const incidents = useDriverStore((s) => s.incidents);
  const loadDashboardData = useDriverStore((s) => s.loadDashboardData);
  const loading = useDriverStore((s) => s.loading);

  const authUser = useAuthStore((s) => s.user);
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    loadDashboardData().catch((err) =>
      toast(
        "error",
        err?.response?.data?.message || "Failed to load driver dashboard",
      ),
    );
  }, [loadDashboardData, toast]);

  const driverName = me?.user?.name || authUser?.name || "—";
  const driverEmail = me?.user?.email || authUser?.email || "—";
  const driverPhone = me?.user?.phone || authUser?.phone || "—";
  const driverNic = me?.user?.nic || authUser?.nic || "—";
  const licenseNo = me?.licenseNo || authUser?.licenseNo || "—";

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-900/40 text-green-300 border-green-700/50";
      case "SUSPENDED":
      case "REVOKED":
        return "bg-red-900/50 text-red-300 border-red-700/50 animate-pulse";
      case "EXPIRED":
      case "SUSPENDED_PENDING":
        return "bg-orange-900/40 text-orange-300 border-orange-700/50";
      default:
        return "bg-slate-800/50 text-slate-400 border-slate-700/50";
    }
  };

  const currentPoints = Number(me?.currentPoints ?? 0);
  const maxPoints = 5;

  const pointTextClass =
    currentPoints >= 5
      ? "text-red-400"
      : currentPoints >= 3
        ? "text-orange-400"
        : "text-green-400";

  const pointBarClass =
    currentPoints >= 5
      ? "bg-red-500"
      : currentPoints >= 3
        ? "bg-orange-400"
        : "bg-green-500";

  const pointPercent = Math.min((currentPoints / maxPoints) * 100, 100);
  const statusClasses = getStatusStyle(me?.licenseStatus);

  const dashboard = useMemo(() => {
    const totalVehicles = vehicles?.length || 0;
    const totalPenalties = penalties?.length || 0;
    const totalIncidents = incidents?.length || 0;

    const unpaidPenalties = penalties.filter(
      (p) =>
        p?.status?.toUpperCase() === "UNPAID" ||
        p?.paymentStatus?.toUpperCase() === "UNPAID" ||
        p?.paid === false,
    ).length;

    const paidPenalties = penalties.filter(
      (p) =>
        p?.status?.toUpperCase() === "PAID" ||
        p?.paymentStatus?.toUpperCase() === "PAID" ||
        p?.paid === true,
    ).length;

    const pendingIncidents = incidents.filter((i) =>
      ["PENDING", "OPEN", "SUBMITTED"].includes(i?.status?.toUpperCase()),
    ).length;

    const resolvedIncidents = incidents.filter((i) =>
      ["RESOLVED", "CLOSED", "COMPLETED"].includes(i?.status?.toUpperCase()),
    ).length;

    const verifiedVehicles = vehicles.filter((v) => v?.ownershipVerified).length;
    const uninsuredOrUnknownVehicles = vehicles.filter((v) => !v?.insuranceExpiry)
      .length;

    const insuranceExpiringSoon = vehicles.filter((v) => {
      if (!v?.insuranceExpiry) return false;
      const expiry = new Date(v.insuranceExpiry);
      const now = new Date();
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    return {
      totalVehicles,
      totalPenalties,
      totalIncidents,
      unpaidPenalties,
      paidPenalties,
      pendingIncidents,
      resolvedIncidents,
      verifiedVehicles,
      uninsuredOrUnknownVehicles,
      insuranceExpiringSoon,
    };
  }, [vehicles, penalties, incidents]);

  const overviewBarData = useMemo(
    () => [
      { name: "Vehicles", total: dashboard.totalVehicles },
      { name: "Penalties", total: dashboard.totalPenalties },
      { name: "Incidents", total: dashboard.totalIncidents },
    ],
    [dashboard],
  );

  const penaltyChartData = useMemo(
    () => [
      { name: "Paid", value: dashboard.paidPenalties },
      { name: "Unpaid", value: dashboard.unpaidPenalties },
    ],
    [dashboard],
  );

  const incidentChartData = useMemo(
    () => [
      { name: "Pending", value: dashboard.pendingIncidents },
      { name: "Resolved", value: dashboard.resolvedIncidents },
    ],
    [dashboard],
  );

  const recentPenalties = useMemo(() => {
    return [...penalties]
      .sort(
        (a, b) =>
          new Date(b?.occurredAt || b?.createdAt || b?.issuedAt || 0) -
          new Date(a?.occurredAt || a?.createdAt || a?.issuedAt || 0),
      )
      .slice(0, 4);
  }, [penalties]);

  const recentVehicles = useMemo(() => {
    return [...vehicles]
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
      )
      .slice(0, 4);
  }, [vehicles]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort(
        (a, b) =>
          new Date(b?.createdAt || b?.reportedAt || 0) -
          new Date(a?.createdAt || a?.reportedAt || 0),
      )
      .slice(0, 4);
  }, [incidents]);

  const licenseInsight = useMemo(() => {
    const status = me?.licenseStatus?.toUpperCase();

    if (!me?.licenseStatus) return "Your license details are still loading.";
    if (status === "SUSPENDED" || status === "REVOKED") {
      return "Your license is currently restricted. Resolve penalties and check your suspension details immediately.";
    }
    if (status === "EXPIRED") {
      return "Your license appears expired. Renew it as soon as possible to avoid issues with driving and verification.";
    }
    if (currentPoints >= 5) {
      return "You are at the maximum demerit point threshold. Immediate action is recommended.";
    }
    if (currentPoints >= 3) {
      return "Your demerit points are getting high. Avoid further violations and clear outstanding penalties.";
    }
    return "Your license is currently in a stable state. Keep your profile and vehicle records updated.";
  }, [me, currentPoints]);

  const vehicleInsight = useMemo(() => {
    if (!vehicles?.length) {
      return "You have not registered any vehicles yet. Add your first vehicle to start managing it here.";
    }
    if (dashboard.insuranceExpiringSoon > 0) {
      return `${dashboard.insuranceExpiringSoon} vehicle(s) have insurance expiring within 30 days.`;
    }
    if (dashboard.verifiedVehicles < vehicles.length) {
      return `${vehicles.length - dashboard.verifiedVehicles} vehicle(s) still have pending ownership verification.`;
    }
    return "Your vehicle records look healthy and up to date.";
  }, [vehicles, dashboard]);

  const penaltyInsight = useMemo(() => {
    if (!penalties?.length) {
      return "Great news — no penalties have been recorded on your account.";
    }
    if (dashboard.unpaidPenalties > 0) {
      return `You have ${dashboard.unpaidPenalties} unpaid penalty record(s). Clearing them early can help avoid further issues.`;
    }
    return "All currently listed penalties appear to be paid.";
  }, [penalties, dashboard]);

  const incidentInsight = useMemo(() => {
    if (!incidents?.length) {
      return "No incidents have been linked to your account recently.";
    }
    if (dashboard.pendingIncidents > 0) {
      return `${dashboard.pendingIncidents} incident report(s) are still pending review or resolution.`;
    }
    return "All recent incidents appear to be resolved.";
  }, [incidents, dashboard]);

  const COLORS_1 = ["#22c55e", "#ef4444"];
  const COLORS_2 = ["#f59e0b", "#3b82f6"];

  if (loading && !me) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 p-6 text-slate-300">
        Loading driver dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Driver Dashboard
          </h1>
          <p className="mt-1.5 text-indigo-300/90">
            {driverName !== "—"
              ? `Welcome back, ${driverName.split(" ")[0]}`
              : "Overview of your driver account, license, vehicles and penalties"}
          </p>
        </div>

        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border self-start lg:self-auto ${statusClasses}`}
        >
          {me?.licenseStatus || "Unknown"}
        </div>
      </div>

      {/* top stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Demerit Points"
          value={`${currentPoints} / ${maxPoints}`}
          subtitle="Current risk level"
          icon="⚠️"
          valueClass={pointTextClass}
        />
        <StatCard
          title="Vehicles"
          value={dashboard.totalVehicles}
          subtitle={`${dashboard.verifiedVehicles} verified`}
          icon="🚗"
        />
        <StatCard
          title="Penalties"
          value={dashboard.totalPenalties}
          subtitle={`${dashboard.unpaidPenalties} unpaid`}
          icon="📄"
        />
        <StatCard
          title="Incidents"
          value={dashboard.totalIncidents}
          subtitle={`${dashboard.pendingIncidents} pending`}
          icon="🚨"
        />
      </div>

      {/* profile + license + overview */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Driver Profile"
          subtitle="Your verified account details"
          icon="👤"
        >
          <div className="space-y-3">
            <InfoRow label="Full Name" value={driverName} />
            <InfoRow label="Email" value={driverEmail} />
            <InfoRow label="Phone" value={driverPhone} />
            <InfoRow label="NIC" value={driverNic} />
          </div>
        </SectionCard>

        <SectionCard
          title="License Summary"
          subtitle="Status and driving eligibility"
          icon="🪪"
        >
          <div className="space-y-4">
            <InfoRow label="License Number" value={licenseNo} mono />
            <InfoRow
              label="Status"
              value={
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusClasses}`}
                >
                  {me?.licenseStatus || "Unknown"}
                </span>
              }
            />
            <InfoRow
              label="Current Points"
              value={
                <span className={`font-semibold ${pointTextClass}`}>
                  {currentPoints} / {maxPoints}
                </span>
              }
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Points Usage</span>
                <span className={`text-xs font-medium ${pointTextClass}`}>
                  {Math.round(pointPercent)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pointBarClass}`}
                  style={{ width: `${pointPercent}%` }}
                />
              </div>
            </div>

            {me?.suspendedUntil && (
              <div className="pt-3 border-t border-red-900/30">
                <div className="text-xs text-red-300/90 mb-1 uppercase tracking-wide">
                  Suspended Until
                </div>
                <div className="text-red-200 font-medium">
                  {new Date(me.suspendedUntil).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Driver Insight"
          subtitle="Main account health summary"
          icon="📊"
        >
          <div className="space-y-4">
            <InsightBox title="License" text={licenseInsight} tone="indigo" />
            <InsightBox title="Vehicles" text={vehicleInsight} tone="emerald" />
            <InsightBox title="Penalties" text={penaltyInsight} tone="rose" />
            <InsightBox title="Incidents" text={incidentInsight} tone="amber" />
          </div>
        </SectionCard>
      </div>

      {/* charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              Activity Overview
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Vehicles, penalties and incidents in one view
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <SectionCard
          title="Vehicle Health"
          subtitle="Registration and insurance quick view"
          icon="🚘"
        >
          <div className="space-y-3">
            <MiniMetric
              label="Total Vehicles"
              value={dashboard.totalVehicles}
              valueClass="text-white"
            />
            <MiniMetric
              label="Verified Ownership"
              value={dashboard.verifiedVehicles}
              valueClass="text-green-300"
            />
            <MiniMetric
              label="Insurance Expiring Soon"
              value={dashboard.insuranceExpiringSoon}
              valueClass="text-orange-300"
            />
            <MiniMetric
              label="Missing Insurance Info"
              value={dashboard.uninsuredOrUnknownVehicles}
              valueClass="text-red-300"
            />
          </div>
        </SectionCard>
      </div>

      {/* status charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Penalty Payment Status"
          subtitle="Paid vs unpaid penalty records"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={penaltyChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {penaltyChartData.map((entry, index) => (
                    <Cell
                      key={`penalty-cell-${index}`}
                      fill={COLORS_1[index % COLORS_1.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {penaltyChartData.map((item, idx) => (
              <LegendPill
                key={item.name}
                label={item.name}
                value={item.value}
                color={COLORS_1[idx % COLORS_1.length]}
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Incident Resolution Status"
          subtitle="Pending vs resolved incident records"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {incidentChartData.map((entry, index) => (
                    <Cell
                      key={`incident-cell-${index}`}
                      fill={COLORS_2[index % COLORS_2.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {incidentChartData.map((item, idx) => (
              <LegendPill
                key={item.name}
                label={item.name}
                value={item.value}
                color={COLORS_2[idx % COLORS_2.length]}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      {/* recent activity */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent Vehicles"
          subtitle="Latest registered vehicles"
          icon="🚗"
        >
          {recentVehicles.length ? (
            <div className="space-y-3">
              {recentVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-medium font-mono">
                        {vehicle.plateNo || "Unknown Plate"}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {[vehicle.type, vehicle.model, vehicle.color]
                          .filter(Boolean)
                          .join(" • ") || "Vehicle details unavailable"}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        vehicle.ownershipVerified
                          ? "bg-green-900/40 text-green-300 border-green-700/50"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {vehicle.ownershipVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No vehicles found for this account." />
          )}
        </SectionCard>

        <SectionCard
          title="Recent Penalties"
          subtitle="Latest traffic fine records"
          icon="📄"
        >
          {recentPenalties.length ? (
            <div className="space-y-3">
              {recentPenalties.map((p) => {
                const paymentStatus =
                  p?.paymentStatus || p?.status || (p?.paid ? "PAID" : "UNPAID");

                const badgeClass =
                  String(paymentStatus).toUpperCase() === "PAID"
                    ? "bg-green-900/40 text-green-300 border-green-700/50"
                    : "bg-red-900/40 text-red-300 border-red-700/50";

                return (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-medium">
                          {p?.violationType?.title ||
                            p?.title ||
                            p?.reason ||
                            "Traffic violation"}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          Fine: Rs. {Number(p?.fineLkr || p?.amount || p?.fineAmount || 0).toLocaleString("si-LK")}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(
                            p?.occurredAt || p?.createdAt || p?.issuedAt || Date.now(),
                          ).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>

                      <div
                        className={`text-xs px-2.5 py-1 rounded-full border ${badgeClass}`}
                      >
                        {paymentStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No penalty records found." />
          )}
        </SectionCard>

        <SectionCard
          title="Recent Incidents"
          subtitle="Latest incident reports"
          icon="🚨"
        >
          {recentIncidents.length ? (
            <div className="space-y-3">
              {recentIncidents.map((incident) => {
                const status = incident?.status || "UNKNOWN";

                const badgeClass =
                  ["RESOLVED", "CLOSED", "COMPLETED"].includes(
                    status?.toUpperCase(),
                  )
                    ? "bg-blue-900/40 text-blue-300 border-blue-700/50"
                    : "bg-orange-900/40 text-orange-300 border-orange-700/50";

                return (
                  <div
                    key={incident.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-medium">
                          {incident?.title || incident?.type || "Road Incident"}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {incident?.location || incident?.city || "Unknown location"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(
                            incident?.createdAt ||
                              incident?.reportedAt ||
                              Date.now(),
                          ).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>

                      <div
                        className={`text-xs px-2.5 py-1 rounded-full border ${badgeClass}`}
                      >
                        {status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No incident reports found." />
          )}
        </SectionCard>
      </div>

      <div className="text-xs text-center sm:text-left text-slate-500 pt-2">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

/* helpers */

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

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
        <h2 className="text-lg font-semibold text-indigo-300">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
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

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-6 text-sm text-slate-400 text-center">
      {text}
    </div>
  );
}

function LegendPill({ label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
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

function MiniMetric({ label, value, valueClass = "text-white" }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}