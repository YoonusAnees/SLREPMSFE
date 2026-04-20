// src/pages/auth/Register.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";

const ROLES = [
  { value: "DRIVER", label: "Driver" },
  // { value: "OFFICER", label: "Officer" },
  // { value: "DISPATCHER", label: "Dispatcher" },
  // { value: "ADMIN", label: "Admin" },
  // { value: "RESCUE", label: "Rescue" },
];

export default function Register() {
  const navigate = useNavigate();
  const toast = useUIStore((s) => s.toast);
  const setLoadingGlobal = useUIStore((s) => s.setLoading);

  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DRIVER",
    phone: "",
    nic: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canGoDashboard = useMemo(() => !!accessToken, [accessToken]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoadingGlobal(true);

    try {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      const password = form.password;
      const role = form.role;

      if (!name) throw new Error("Full name is required");
      if (!email) throw new Error("Email is required");
      if (!password || password.length < 8)
        throw new Error("Password must be at least 8 characters");

      if (form.nic && form.nic.trim().length < 5) {
        throw new Error("NIC number appears too short");
      }

      const { http } = await import("../../api/http");

      await http.post("/auth/register", {
        name,
        email,
        role,
        password,
        phone: form.phone.trim() || undefined,
        nic: form.nic.trim() || undefined,
      });

      toast("success", "Account created successfully");

      if (canGoDashboard) {
        try {
          await hydrateMe();
        } catch {}
        navigate(-1);
      } else {
        navigate("/login");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      toast("error", msg);
    } finally {
      setIsSubmitting(false);
      setLoadingGlobal(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-5 sm:p-8 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#4f46e5_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#7c3aed_0%,transparent_35%)]" />
      </div>

      {/* Faint road lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent top-[30%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent top-[70%] animate-pulse-slow delay-1500" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            SLREPSMS Registration
          </h1>
          <p className="mt-2 text-indigo-200/90 text-lg font-medium">
            Road Safety • Traffic Enforcement • Emergency Personnel
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/65 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-700/70 via-purple-800/60 to-indigo-700/70 px-8 py-6 text-center relative">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[conic-gradient(at_top_right,_#4f46e5,_transparent_120deg)]" />
            <h2 className="text-2xl font-semibold text-white">
              Create New User Account
            </h2>
            <p className="text-indigo-200/80 mt-1.5 text-sm">
              For drivers, officers, dispatchers & rescue personnel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Mohamed Yoonus"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email / Official Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@slreps.gov.lk"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 appearance-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  NIC Number (optional)
                </label>
                <input
                  value={form.nic}
                  onChange={(e) =>
                    updateField("nic", e.target.value.toUpperCase())
                  }
                  placeholder="200012345678 / 123456789V"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300
                  ${
                    isSubmitting
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    Creating Account...
                  </span>
                ) : (
                  "Register Account"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          SLREPSMS • Authorized Personnel Only • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
