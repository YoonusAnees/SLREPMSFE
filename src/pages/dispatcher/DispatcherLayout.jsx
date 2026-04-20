// src/layouts/DispatcherLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DispatcherLayout() {
  const items = [
    { to: "/dispatcher", label: "Dashboard", icon: "📡", end: true },
    { to: "/dispatcher/incidents", label: "Incidents", icon: "🚨" },
    // { to: "/dispatcher/dispatches", label: "My Dispatches", icon: "📤" },
    // { to: "/dispatcher/teams", label: "Rescue Teams", icon: "🛡️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex">
      {/* Subtle animated background lines – same road theme */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent top-[22%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent bottom-[35%] animate-pulse-slow delay-2500" />
      </div>

      <Sidebar items={items} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10">
        <Navbar />

        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <Outlet />
          </div>
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800/50 bg-slate-950/50">
          SLREPSMS • Dispatcher Control Room • Restricted Access • ©{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
