import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminLayout() {
  const items = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/penalties", label: "Penalties" },
    { to: "/admin/payments", label: "Payments" },
    { to: "/admin/incidents", label: "Incidents" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
