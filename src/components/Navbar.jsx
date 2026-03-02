import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useUIStore((s) => s.toast);

  async function onLogout() {
    await logout();
    toast("info", "Logged out");
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="font-semibold">SLREPSMS</div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-xs text-gray-600">
            {user.email} • <span className="font-semibold">{user.role}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded-xl border hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
