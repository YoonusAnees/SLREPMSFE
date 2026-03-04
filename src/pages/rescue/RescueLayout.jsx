import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function RescueLayout() {
  const items = [
    { to: "/rescue", label: "Dashboard", end: true },
    { to: "/rescue/dispatches", label: "My Dispatches" },
    { to: "/rescue/profile", label: "My Team Profile" },
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
