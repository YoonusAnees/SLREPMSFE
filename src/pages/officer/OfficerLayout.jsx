import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function OfficerLayout() {
  const items = [
    { to: "/officer", label: "Home", end: true },
    { to: "/officer/issue-penalty", label: "Issue Penalty" },
    { to: "/officer/verify-vehicle", label: "Verify Vehicle" },
    { to: "/officer/violation-types", label: "Violation Types" },
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
