import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex flex-col">
      {/* Background subtle effects */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent top-[18%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-red-400/50 to-transparent bottom-[28%] animate-pulse-slow delay-2000" />
      </div>

      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800/50 bg-slate-950/40">
        SLREPSMS • Public Information Portal • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}