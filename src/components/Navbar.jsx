import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";
import logo from "/logo.png";

function linkClass({ isActive }) {
  return `
    px-3 py-2 rounded-lg text-sm font-medium transition-all
    ${
      isActive
        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
    }
  `;
}

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useUIStore((s) => s.toast);
  const navigate = useNavigate();

  const role = user?.role;
  const isLoggedIn = !!user;

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/statistics", label: "Statistics" },
    { to: "/road-safety", label: "Road Safety" },
    { to: "/emergency", label: "Emergency" },
    { to: "/report-incident", label: "Report Incident" },
    { to: "/privacy-policy", label: "Privacy Policy" },
  ];

  const portalMap = {
    DRIVER: { to: "/driver", label: "Driver Portal" },
    OFFICER: { to: "/officer", label: "Officer Portal" },
    ADMIN: { to: "/admin", label: "Admin Portal" },
    DISPATCHER: { to: "/dispatcher", label: "Dispatcher Portal" },
    RESCUE: { to: "/rescue", label: "Rescue Portal" },
  };

  const portalLink = role ? portalMap[role] : null;

  async function handleLogout() {
    try {
      await logout();
      toast("info", "Logged out successfully");
      navigate("/login");
    } catch {
      toast("error", "Logout failed");
    }
  }

  return (
    <header className="bg-gradient-to-r from-slate-950 to-indigo-950 border-b border-slate-700/60 px-4 sm:px-6 lg:px-8 py-4 shadow-lg shadow-black/40 z-30 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div
            className="
      w-full h-full rounded-full overflow-hidden
      bg-slate-950 flex items-center justify-center
    "
          >
            <img
              src={logo}
              alt="SLREPSMS Logo"
              className="w-7 h-7 object-contain"
            />
          </div>

          <NavLink
            to={isLoggedIn && portalLink ? portalLink.to : "/"}
            className="
    text-2xl font-bold tracking-tight
    bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent
    drop-shadow-[0_1.5px_4px_rgba(99,102,241,0.35)]
  "
          >
            SLREPSMS
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Public navigation (only when NOT logged in) */}
          {!isLoggedIn &&
            publicLinks.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}

          {/* Portal navigation (only when logged in) */}
          {isLoggedIn && portalLink && (
            <NavLink to={portalLink.to} className={linkClass}>
              {portalLink.label}
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex flex-col items-end text-xs">
                <span className="text-slate-300 font-medium">
                  {user.name || user.email}
                </span>
                <span className="text-indigo-300 font-semibold">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-900/70 hover:bg-red-800/80 border border-red-700/60 text-red-100 flex items-center gap-2"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/70 text-sm font-medium"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
