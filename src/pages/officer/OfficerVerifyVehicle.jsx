import { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";

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

export default function OfficerVerifyVehicle() {
  const verifyVehicle = useOfficerStore((s) => s.verifyVehicle);
  const toast = useUIStore((s) => s.toast);

  const [plateNo, setPlateNo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    const plate = plateNo.trim().toUpperCase();
    if (!plate) return toast("error", "Please enter a vehicle plate number");

    setLoading(true);
    setResult(null);

    try {
      const data = await verifyVehicle(plate);
      setResult(data);
      toast("success", "Vehicle ownership verified successfully");
    } catch (err) {
      setResult(null);
      toast("error", err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const ownershipTone = result?.ownershipVerified ? "green" : "red";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Verify Vehicle Ownership
        </h1>
        <p className="mt-2 text-slate-400">
          Check registration, driver details & ownership status
        </p>
      </div>

      {/* Verification Input Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">🚗</span>
            Vehicle Plate Verification
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter plate number to fetch full vehicle & driver information
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Plate Number
              </label>
              <input
                value={plateNo}
                onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
                placeholder="e.g. CBR6172 or CP CA 5678"
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 uppercase font-mono
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all
                "
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Format: ABC-1234 or CP CA 5678 • Press Enter or click Verify
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || !plateNo.trim()}
              className={`
                w-full sm:w-auto px-8 py-3.5 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  loading || !plateNo.trim()
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-700/40"
                }
              `}
            >
              {loading ? (
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
                  Verifying...
                </span>
              ) : (
                "Verify Vehicle"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
              <span className="text-xl">✅</span>
              Verification Result
            </h2>
            <Badge tone={ownershipTone}>
              {result.ownershipVerified ? "Ownership Verified" : "Not Verified"}
            </Badge>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Vehicle Info */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">
                    Vehicle
                  </div>
                  <div className="mt-1 text-xl font-bold text-white font-mono">
                    {result.plateNo}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <div className="font-medium">{result.type || "—"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Model:</span>
                    <div className="font-medium">{result.model || "—"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Color:</span>
                    <div className="font-medium capitalize">
                      {result.color || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Year:</span>
                    <div className="font-medium">{result.year || "—"}</div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Insurance Expiry:</span>
                  <div className="font-medium text-orange-300 mt-0.5">
                    {result.insuranceExpiry
                      ? new Date(result.insuranceExpiry).toLocaleDateString(
                          "en-GB",
                        )
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">
                    Driver
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {result.driver?.user?.name || "—"}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">Email:</span>{" "}
                    <span className="font-mono">
                      {result.driver?.user?.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{" "}
                    <span className="font-mono">
                      {result.driver?.user?.phone || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">NIC:</span>{" "}
                    <span className="font-mono uppercase">
                      {result.driver?.user?.nic || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">License:</span>{" "}
                    <span className="font-mono">
                      {result.driver?.licenseNo || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    tone={
                      result.driver?.licenseStatus === "ACTIVE"
                        ? "green"
                        : "red"
                    }
                  >
                    {result.driver?.licenseStatus || "Unknown"}
                  </Badge>
                  <Badge
                    tone={
                      (result.driver?.currentPoints ?? 0) >= 12
                        ? "red"
                        : (result.driver?.currentPoints ?? 0) >= 8
                          ? "yellow"
                          : "green"
                    }
                  >
                    Points: {result.driver?.currentPoints ?? 0}
                  </Badge>
                </div>

                {result.driver?.suspendedUntil && (
                  <div className="text-sm text-red-300 mt-2">
                    Suspended until:{" "}
                    <span className="font-medium">
                      {new Date(
                        result.driver.suspendedUntil,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">
                    Timestamps
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>{" "}
                      {new Date(result.createdAt).toLocaleString("en-GB")}
                    </div>
                    <div>
                      <span className="text-slate-400">Last Updated:</span>{" "}
                      {new Date(result.updatedAt).toLocaleString("en-GB")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
