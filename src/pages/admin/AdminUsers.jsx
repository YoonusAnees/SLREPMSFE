import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table"; // your existing component

export default function AdminUsers() {
  const toast = useUIStore((s) => s.toast);
  const loadUsers = useAdminStore((s) => s.loadUsers);
  const users = useAdminStore((s) => s.users);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  async function fetch(page = 1) {
    try {
      await loadUsers({
        page,
        limit: 20,
        q: q || undefined,
        role: role || undefined,
      });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load users");
    }
  }

  useEffect(() => {
    fetch(1);
  }, []);

  const columns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
      { key: "phone", header: "Phone" },
      { key: "nic", header: "NIC" },
      {
        key: "createdAt",
        header: "Created",
        render: (r) => new Date(r.createdAt).toLocaleString(),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Users</h1>

      <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-3 gap-2">
        <input
          className="border rounded-xl px-3 py-2 text-sm"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="DRIVER">DRIVER</option>
          <option value="OFFICER">OFFICER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DISPATCHER">DISPATCHER</option>
          <option value="RESCUE">RESCUE</option>
        </select>
        <button
          className="rounded-xl bg-black text-white text-sm px-3 py-2"
          onClick={() => fetch(1)}
        >
          Apply
        </button>
      </div>

      <Table columns={columns} rows={users?.rows || []} />

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Page <b>{users?.page || 1}</b> · Total <b>{users?.total || 0}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={(users?.page || 1) <= 1}
            onClick={() => fetch((users?.page || 1) - 1)}
          >
            Prev
          </button>
          <button
            className="border rounded-xl px-3 py-1 disabled:opacity-50"
            disabled={
              (users?.page || 1) * (users?.limit || 20) >= (users?.total || 0)
            }
            onClick={() => fetch((users?.page || 1) + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
