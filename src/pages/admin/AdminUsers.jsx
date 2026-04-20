import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/admin.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

export default function AdminUsers() {
  const toast = useUIStore((s) => s.toast);
  const loadUsers = useAdminStore((s) => s.loadUsers);
  const users = useAdminStore((s) => s.users);
  const loading = useAdminStore((s) => s.loading.users);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (page = 1) => {
    try {
      await loadUsers({
        page,
        limit: 20,
        q: q.trim() || undefined,
        role: role || undefined,
      });
      setCurrentPage(page);
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = () => {
    fetchUsers(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (row) => (
          <span className="font-medium text-slate-200">{row.name || "—"}</span>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (row) => (
          <span className="font-mono text-xs text-indigo-300">{row.email}</span>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (row) => {
          const roleColors = {
            ADMIN: "bg-red-900/50 text-red-300 border-red-700/50",
            OFFICER: "bg-orange-900/50 text-orange-300 border-orange-700/50",
            DISPATCHER: "bg-blue-900/50 text-blue-300 border-blue-700/50",
            RESCUE: "bg-amber-900/50 text-amber-300 border-amber-700/50",
            DRIVER: "bg-green-900/50 text-green-300 border-green-700/50",
          };
          const classes =
            roleColors[row.role] ||
            "bg-slate-800 text-slate-400 border-slate-700";

          return (
            <span
              className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${classes}`}
            >
              {row.role || "—"}
            </span>
          );
        },
      },
      {
        key: "phone",
        header: "Phone",
        render: (row) => row.phone || "—",
      },
      {
        key: "nic",
        header: "NIC",
        render: (row) => (
          <span className="font-mono text-xs uppercase">{row.nic || "—"}</span>
        ),
      },
      {
        key: "createdAt",
        header: "Joined",
        render: (row) => (
          <span className="text-slate-400 text-sm">
            {new Date(row.createdAt).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.ceil((users?.total || 0) / 20);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            System Users
          </h1>
          <p className="mt-1.5 text-slate-400">
            Manage all registered accounts • Drivers • Officers • Rescue •
            Admins
          </p>
        </div>

        {loading && (
          <div className="text-sm px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading...
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            Filter & Search
          </h2>
        </div>

        <div className="p-6 grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Search by name or email
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, partial match..."
              className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Filter by Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="">All Roles</option>
              <option value="DRIVER">DRIVER</option>
              <option value="OFFICER">OFFICER</option>
              <option value="DISPATCHER">DISPATCHER</option>
              <option value="RESCUE">RESCUE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`
                w-full py-3.5 px-6 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
                }
              `}
            >
              {loading ? "Searching..." : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo-300">
            Registered Users
          </h2>
          <div className="text-sm text-slate-400">
            Showing {users?.rows?.length || 0} of {users?.total || 0}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            Loading users...
          </div>
        ) : users?.rows?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table columns={columns} rows={users.rows} />
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-slate-700/50 flex items-center justify-between text-sm">
              <div className="text-slate-400">
                Page{" "}
                <span className="text-white font-medium">{currentPage}</span> of{" "}
                <span className="text-white font-medium">
                  {totalPages || 1}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium border
                    ${
                      currentPage <= 1 || loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-300"
                    }
                  `}
                >
                  Previous
                </button>

                <button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium border
                    ${
                      currentPage >= totalPages || loading
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 hover:bg-slate-800/60 text-slate-300"
                    }
                  `}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-40">👥</div>
            <p className="text-lg mb-2">No users found</p>
            <p className="text-sm">Try adjusting the search or role filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
