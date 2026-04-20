import { useEffect, useState } from "react";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";

export default function DriverProfile() {
  const authUser = useAuthStore((s) => s.user);
  const updateMyUser = useDriverStore((s) => s.updateMyUser);
  const upsertMe = useDriverStore((s) => s.upsertMe);
  const driverMe = useDriverStore((s) => s.me);
  const loadMe = useDriverStore((s) => s.loadMe);
  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
    nic: authUser?.nic || "",
    licenseNo: driverMe?.licenseNo || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingLicense, setIsAddingLicense] = useState(false);

  useEffect(() => {
    loadMe().catch(() => {});
  }, [loadMe]);

  useEffect(() => {
    setForm({
      name: authUser?.name || "",
      phone: authUser?.phone || "",
      nic: authUser?.nic || "",
      licenseNo: driverMe?.licenseNo || "",
    });
  }, [
    authUser?.id,
    authUser?.name,
    authUser?.phone,
    authUser?.nic,
    driverMe?.licenseNo,
  ]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSavePersonal(e) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const updated = await updateMyUser({
        name: form.name?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        nic: form.nic?.trim().toUpperCase() || undefined,
      });

      toast("success", "Profile updated successfully");
      useAuthStore.setState({ user: { ...authUser, ...updated } });
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddLicense(e) {
    e.preventDefault();
    if (isAddingLicense) return;

    const license = form.licenseNo?.trim();
    if (!license) {
      toast("error", "Please enter your license number");
      return;
    }

    setIsAddingLicense(true);
    try {
      const added = await upsertMe({ licenseNo: license });
      toast("success", "Driving license added");
      useAuthStore.setState({ user: { ...authUser, ...added } });
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to add license");
    } finally {
      setIsAddingLicense(false);
    }
  }

  const hasLicense = !!driverMe?.licenseNo;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          My Profile
        </h1>
        <p className="mt-2 text-slate-400">
          Manage your personal information and driving license details
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">👤</span>
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Used for account verification and notifications
          </p>
        </div>

        <form onSubmit={handleSavePersonal} className="p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="e.g. Mohamed Yoonus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="+94 77 123 4567"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                NIC Number
              </label>
              <input
                type="text"
                value={form.nic}
                onChange={(e) =>
                  updateField("nic", e.target.value.toUpperCase())
                }
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase tracking-wide"
                placeholder="200012345678 / 123456789V"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Format: 10 or 12 digits (old/new NIC)
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className={`
                w-full sm:w-auto px-8 py-3 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  isSaving
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
                }
              `}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2.5">
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* License Section */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">🪪</span>
              Driving License
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Required for vehicle registration and penalty verification
            </p>
          </div>

          {hasLicense && (
            <div className="px-4 py-1.5 bg-green-900/40 text-green-300 rounded-full text-sm font-medium border border-green-700/50">
              Verified
            </div>
          )}
        </div>

        {hasLicense ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 bg-slate-800/50 p-5 rounded-lg border border-slate-700/60">
              <div className="text-4xl opacity-80">🪪</div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {driverMe.licenseNo}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Registered to: {authUser.name || "—"}
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              To update or change your license number, please contact support.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddLicense} className="p-6 sm:p-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Driving License Number
              </label>
              <input
                type="text"
                value={form.licenseNo}
                onChange={(e) =>
                  updateField("licenseNo", e.target.value.toUpperCase())
                }
                placeholder="e.g. B12345678"
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase tracking-wide"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Enter your official driving license number
              </p>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isAddingLicense}
                  className={`
                    w-full px-8 py-3 rounded-lg font-semibold
                    transition-all duration-200 shadow-lg
                    ${
                      isAddingLicense
                        ? "bg-slate-700 cursor-not-allowed text-slate-400"
                        : "bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white shadow-emerald-900/30 hover:shadow-emerald-800/40"
                    }
                  `}
                >
                  {isAddingLicense ? (
                    <span className="flex items-center justify-center gap-2.5">
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
                      Adding...
                    </span>
                  ) : (
                    "Add License Number"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
