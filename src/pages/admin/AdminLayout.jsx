// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminLayout() {
  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊", end: true },
    { to: "/admin/users", label: "Users", icon: "👥" },
    { to: "/admin/penalties", label: "Penalties", icon: "⚖️" },
    { to: "/admin/payments", label: "Payments", icon: "💳" },
    { to: "/admin/incidents", label: "Incidents", icon: "🚨" },
    { to: "/admin/register", label: "Rescue Registration", icon: "🛡️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex overflow-hidden">
      {/* Very subtle animated background lines (road theme) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent top-[18%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent top-[82%] animate-pulse-slow delay-3000" />
      </div>

      {/* Sidebar - fixed on large screens */}
      <Sidebar items={navItems} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <Navbar />

        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <Outlet />
          </div>
        </main>

        {/* Footer note */}
        <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800/50 bg-slate-950/40">
          SLREPSMS • Administrator Panel • Restricted Access • ©{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
