// src/layouts/OfficerLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function OfficerLayout() {
  const items = [
    { to: "/officer", label: "Dashboard", icon: "📊", end: true },
    { to: "/officer/issue-penalty", label: "Issue Penalty", icon: "⚖️" },
    { to: "/officer/verify-vehicle", label: "Verify Vehicle", icon: "🚗" },
    { to: "/officer/violation-types", label: "Violation Types", icon: "📋" },
    { to: "/officer/incidents", label: "Incidents", icon: "📋" },
    { to: "/officer/incident-review", label: "Incident Review", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex">
      {/* Subtle animated road lines background — same as driver */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent top-[20%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent bottom-[30%] animate-pulse-slow delay-2000" />
      </div>

      <Sidebar items={items} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800/50 bg-slate-950/40">
          SLREPSMS • Officer Enforcement Portal • Restricted Access • ©{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
