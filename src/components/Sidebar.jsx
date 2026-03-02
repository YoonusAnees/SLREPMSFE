import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <aside className="w-[240px] bg-white border-r min-h-screen p-3 hidden md:block">
      <div className="font-semibold px-2 py-2">SLREPSMS</div>
      <nav className="mt-2 space-y-1">
        {items.map((x) => (
          <NavLink
            key={x.to}
            to={x.to}
            end={x.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl text-sm ${
                isActive ? "bg-black text-white" : "hover:bg-gray-50"
              }`
            }
          >
            {x.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
