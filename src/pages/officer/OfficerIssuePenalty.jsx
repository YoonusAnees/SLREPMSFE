// src/pages/officer/OfficerIssuePenalty.jsx
import { useEffect, useMemo, useState } from "react";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";
import { useDebounce } from "../../utils/useDebounce";

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-slate-700/50 text-slate-300 border-slate-600/50",
    green: "bg-green-900/50 text-green-300 border-green-700/50",
    red: "bg-red-900/50 text-red-300 border-red-700/50 animate-pulse",
    yellow: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    blue: "bg-indigo-900/50 text-indigo-300 border-indigo-700/50",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function OfficerIssuePenalty() {
  const loadViolationTypes = useOfficerStore((s) => s.loadViolationTypes);
  const violationTypes = useOfficerStore((s) => s.violationTypes);
  const issuePenalty = useOfficerStore((s) => s.issuePenalty);

  const lookupDriverByLicense = useOfficerStore((s) => s.lookupDriverByLicense);
  const lookedUp = useOfficerStore((s) => s.lookedUp);
  const lookupLoading = useOfficerStore((s) => s.lookupLoading);
  const lookupError = useOfficerStore((s) => s.lookupError);
  const clearLookup = useOfficerStore((s) => s.clearLookup);

  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    licenseNo: "",
    plateNo: "",
    violationCode: "",
    locationText: "",
    occurredAt: new Date().toISOString().slice(0, 16), // better default for datetime-local
    notes: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadViolationTypes().catch(() => {});
  }, [loadViolationTypes]);

  // Debounced license lookup
  const debouncedLicense = useDebounce(form.licenseNo.trim(), 600);

  useEffect(() => {
    if (debouncedLicense.length < 5) {
      clearLookup();
      return;
    }
    lookupDriverByLicense(debouncedLicense).catch(() => {});
  }, [debouncedLicense, lookupDriverByLicense, clearLookup]);

  // Auto-select first vehicle if none chosen
  useEffect(() => {
    if (!lookedUp?.vehicles?.length) return;
    if (form.plateNo.trim()) return;
    updateField("plateNo", lookedUp.vehicles[0].plateNo);
  }, [lookedUp]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!lookedUp?.driver?.licenseNo) {
      return toast("error", "Please load valid driver details first");
    }

    try {
      await issuePenalty({
        licenseNo: form.licenseNo.trim(),
        plateNo: form.plateNo.trim() || undefined,
        violationCode: form.violationCode,
        locationText: form.locationText.trim() || undefined,
        occurredAt: form.occurredAt,
        notes: form.notes.trim() || undefined,
      });

      toast("success", "Penalty issued successfully");

      // Reset form (keep license for consecutive issuance)
      setForm((prev) => ({
        ...prev,
        plateNo: "",
        violationCode: "",
        locationText: "",
        notes: "",
        occurredAt: new Date().toISOString().slice(0, 16),
      }));
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to issue penalty");
    }
  }

  const vehicles = lookedUp?.vehicles || [];

  const statusTone =
    lookedUp?.driver?.licenseStatus === "SUSPENDED" ||
    lookedUp?.driver?.licenseStatus === "REVOKED"
      ? "red"
      : lookedUp?.driver?.licenseStatus === "ACTIVE"
        ? "green"
        : "yellow";

  const pointsTone =
    (lookedUp?.driver?.currentPoints ?? 0) >= 12
      ? "red"
      : (lookedUp?.driver?.currentPoints ?? 0) >= 8
        ? "orange"
        : "green";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Issue Traffic Penalty
          </h1>
          <p className="mt-1.5 text-slate-400">
            Verify driver → Select violation → Issue fine & demerit points
          </p>
        </div>

        {lookupLoading && <Badge tone="yellow">Searching driver...</Badge>}
      </div>

      {/* Driver Lookup + Preview Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">👤</span>
            Driver & License Lookup
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter license number to fetch driver profile & vehicles
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                License Number
              </label>
              <input
                value={form.licenseNo}
                onChange={(e) =>
                  updateField("licenseNo", e.target.value.toUpperCase())
                }
                placeholder="e.g. B12345678"
                className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase font-mono tracking-wide"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Enter full license number • Auto-lookup after 600ms
              </p>
            </div>

            <div className="flex items-end gap-3">
              {lookupLoading && <Badge tone="yellow">Searching...</Badge>}
              {lookupError && <Badge tone="red">{lookupError}</Badge>}
              {lookedUp?.driver && !lookupLoading && (
                <Badge tone={statusTone}>{lookedUp.driver.licenseStatus}</Badge>
              )}
            </div>
          </div>

          {lookedUp?.driver && (
            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/60">
              {/* Driver Info */}
              <div className="space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  Driver
                </div>
                <div className="text-lg font-semibold text-white">
                  {lookedUp.user?.name || "—"}
                </div>
                <div className="text-sm space-y-1 text-slate-300">
                  <div>
                    Email:{" "}
                    <span className="font-mono">
                      {lookedUp.user?.email || "—"}
                    </span>
                  </div>
                  <div>
                    Phone:{" "}
                    <span className="font-mono">
                      {lookedUp.user?.phone || "—"}
                    </span>
                  </div>
                  <div>
                    NIC:{" "}
                    <span className="font-mono uppercase">
                      {lookedUp.user?.nic || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* License Status */}
              <div className="space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  License
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={statusTone}>
                    {lookedUp.driver.licenseStatus || "Unknown"}
                  </Badge>
                  <Badge tone={pointsTone}>
                    Demerit: {lookedUp.driver.currentPoints ?? 0}
                  </Badge>
                </div>
                {lookedUp.driver.suspendedUntil && (
                  <div className="text-sm text-red-300 mt-2">
                    Suspended until:{" "}
                    <span className="font-medium">
                      {new Date(
                        lookedUp.driver.suspendedUntil,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicles */}
              <div className="space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  Registered Vehicles ({vehicles.length})
                </div>
                {vehicles.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No vehicles found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <span className="font-mono font-medium text-indigo-300">
                            {v.plateNo}
                          </span>{" "}
                          • {v.type} {v.model ? `(${v.model})` : ""}
                        </div>
                        <Badge tone={v.ownershipVerified ? "green" : "yellow"}>
                          {v.ownershipVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                    {vehicles.length > 3 && (
                      <div className="text-xs text-slate-500">
                        + {vehicles.length - 3} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Penalty Issuance Form */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">⚖️</span>
            Issue New Penalty
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Only available after successful driver lookup
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plate selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Vehicle Plate
              </label>
              {vehicles.length > 0 ? (
                <select
                  value={form.plateNo}
                  onChange={(e) => updateField("plateNo", e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                >
                  <option value="">(Select vehicle or leave blank)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNo}>
                      {v.plateNo} — {v.type} {v.model ? `(${v.model})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.plateNo}
                  onChange={(e) =>
                    updateField("plateNo", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. ABC-1234 (optional)"
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase font-mono"
                />
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Select from registered vehicles or type manually
              </p>
            </div>

            {/* Violation Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Violation Code
              </label>
              <select
                required
                value={form.violationCode}
                onChange={(e) => updateField("violationCode", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="">— Select violation —</option>
                {violationTypes.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.code} — {v.title} (LKR {v.baseFineLkr}, {v.demeritPoints}{" "}
                    pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Location / Road
              </label>
              <input
                value={form.locationText}
                onChange={(e) => updateField("locationText", e.target.value)}
                placeholder="e.g. Kandy-Colombo Road, Digana"
                className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Occurred At */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Date & Time of Violation
              </label>
              <input
                type="datetime-local"
                value={form.occurredAt}
                onChange={(e) => updateField("occurredAt", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Additional Notes / Remarks
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
                placeholder="e.g. Speeding 95 km/h in 60 zone, no seatbelt..."
                className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all resize-y min-h-[100px]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60">
            <button
              type="submit"
              disabled={
                lookupLoading || !lookedUp?.driver || !form.violationCode
              }
              className={`
                w-full py-4 px-8 rounded-xl font-semibold text-base
                transition-all duration-300 shadow-lg flex items-center justify-center gap-3
                ${
                  lookupLoading || !lookedUp?.driver || !form.violationCode
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                }
              `}
            >
              {lookupLoading ? (
                <>
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
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Issue Penalty"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
