import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useUIStore((s) => s.toast);

  const isAdmin = user?.role === "ADMIN";

  async function handleLogout() {
    try {
      await logout();
      toast("info", "Logged out successfully");
      window.location.href = "/login";
    } catch (err) {
      toast("error", "Logout failed");
    }
  }

  return (
    <header
      className="
        bg-gradient-to-r from-slate-950 to-indigo-950
        border-b border-slate-700/60
        px-6 sm:px-8 py-4 flex items-center justify-between
        shadow-lg shadow-black/40 z-30 relative
      "
    >
      {/* Subtle horizontal accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-white tracking-tight">
          {isAdmin ? "Admin Control" : "SLREPSMS"}
        </div>

        {isAdmin && (
          <div className="hidden sm:block text-xs px-3 py-1 rounded-full bg-red-900/40 text-red-200 border border-red-800/40">
            Administrator Mode
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {user && (
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="text-slate-300 font-medium">
              {user.name || user.email}
            </span>
            <span className="text-indigo-300 font-semibold">{user.role}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="
            px-5 py-2.5 rounded-lg text-sm font-medium
            bg-red-900/70 hover:bg-red-800/80 active:bg-red-950
            border border-red-700/60 text-red-100
            transition-all duration-200 shadow-sm hover:shadow-red-900/30
            flex items-center gap-2
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7"
            />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
