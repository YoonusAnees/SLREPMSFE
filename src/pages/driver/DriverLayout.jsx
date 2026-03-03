import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DriverLayout() {
  const items = [
    { to: "/driver", label: "Home", end: true },
    { to: "/driver/profile", label: "My Profile" },
    { to: "/driver/vehicles", label: "My Vehicles" },
    { to: "/driver/penalties", label: "My Penalties" },
    { to: "/driver/payments", label: "Payments" },
    { to: "/driver/incidents", label: "Report Incident" },
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
