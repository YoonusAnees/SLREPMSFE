import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm ${
    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">SLREPMS — Admin</div>
            <div className="text-xs text-gray-500">
              Dashboard & system management
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            Users
          </NavLink>
          <NavLink to="/admin/penalties" className={linkClass}>
            Penalties
          </NavLink>
          <NavLink to="/admin/payments" className={linkClass}>
            Payments
          </NavLink>
          <NavLink to="/admin/incidents" className={linkClass}>
            Incidents
          </NavLink>
        </div>

        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
