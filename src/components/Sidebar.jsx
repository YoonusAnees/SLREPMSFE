import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  const isAdmin = window.location.pathname.startsWith("/admin");

  return (
    <aside
      className={`
        w-64 bg-gradient-to-b from-slate-950 to-indigo-950
        border-r border-slate-700/50
        min-h-screen p-4 flex flex-col
        hidden lg:block fixed lg:relative z-20
        shadow-2xl shadow-black/60
      `}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-2 py-10 mb-8 border-b border-slate-700/60">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-xl">
          A
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            {isAdmin ? "SLREPSMS Admin" : "SLREPSMS"}
          </div>
          <div className="text-xs text-indigo-300/70 font-medium">
            {isAdmin ? "Control Center" : "Driver Portal"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-900/70 text-white border-l-4 border-indigo-400 shadow-md shadow-indigo-900/40"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent"
              }`
            }
          >
            <span className="w-5 h-5 flex items-center justify-center text-xl opacity-90">
              {item.icon || "→"}
            </span>
            <span>{item.label}</span>

            <span className="ml-auto opacity-0 group-hover:opacity-70 transition-opacity text-xs">
              →
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 pb-4 px-2 border-t border-slate-700/50">
        <div className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} SLREPSMS
        </div>
      </div>
    </aside>
  );
}
