import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DispatcherLayout() {
  const items = [
    { to: "/dispatcher", label: "Dashboard", end: true },
    { to: "/dispatcher/incidents", label: "Incidents" },
    // { to: "/dispatcher/dispatches", label: "My Dispatches" },
    // optional:
    // { to: "/dispatcher/teams", label: "Rescue Teams" },
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
