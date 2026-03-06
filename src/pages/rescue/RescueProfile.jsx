import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import MapPicker from "../../map/MapPicker";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

export default function RescueProfile() {
  const toast = useUIStore((s) => s.toast);
  const loadMe = useRescueStore((s) => s.loadMe);
  const updateMe = useRescueStore((s) => s.updateMe);
  const me = useRescueStore((s) => s.me);
  const loading = useRescueStore((s) => s.loading?.me || s.loading?.update);

  const [status, setStatus] = useState("AVAILABLE");
  const [phone, setPhone] = useState("");
  const [point, setPoint] = useState({ lat: 6.927079, lng: 79.861244 });
  const [baseLocationText, setBaseLocationText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadMe();
        if (!data) return;

        setStatus(data.status || "AVAILABLE");
        setPhone(data.phone || "");
        setBaseLocationText(data.baseLocationText || "");

        const coords = data.baseLocation?.coordinates;
        if (coords?.length === 2) {
          setPoint({ lng: coords[0], lat: coords[1] });
        }
      } catch (e) {
        toast("error", e?.response?.data?.message || "Failed to load profile");
      }
    })();
  }, [loadMe, toast]);

  async function save() {
    setSaving(true);

    try {
      await updateMe({
        status,
        phone: phone.trim() || undefined,
        baseLat: Number(point.lat),
        baseLng: Number(point.lng),
        baseLocationText: baseLocationText.trim() || undefined,
      });

      toast("success", "Team profile updated successfully");
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          My Rescue Team Profile
        </h1>
        <p className="mt-2 text-slate-400">
          Update availability, phone & base location
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-red-300 flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            Team Settings & Base Location
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Keep your status current so control room can dispatch you
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT: Form */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Team Availability Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="
                    w-[50%] px-4 py-3.5 bg-slate-800/70 border border-slate-600
                    rounded-lg text-white focus:border-red-500 focus:ring-2
                    focus:ring-red-500/30 transition-all
                  "
                >
                  <option value="AVAILABLE">
                    AVAILABLE (Ready to respond)
                  </option>
                  <option value="BUSY">BUSY (On another call)</option>
                  <option value="OFFLINE">OFFLINE (Unavailable)</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Control room sees this status when assigning incidents
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Emergency Contact Phone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Used for urgent coordination
                </p>
              </div>

              {/* Base Location Text */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Base / Station Location Text
                </label>
                <Input
                  value={baseLocationText}
                  onChange={(e) => setBaseLocationText(e.target.value)}
                  placeholder="e.g. Kandy Central Fire Station, Peradeniya Road"
                  className="w-full"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Auto-filled from map, but editable
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={save}
                  disabled={saving || loading}
                  className={`
                    w-full py-3.5 px-6 rounded-lg font-semibold text-base
                    transition-all duration-300 shadow-lg
                    ${
                      saving || loading
                        ? "bg-slate-700 cursor-not-allowed text-slate-400"
                        : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                    }
                  `}
                >
                  {saving || loading ? (
                    <div className="flex items-center justify-center gap-3">
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
                      Saving...
                    </div>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </div>

            {/* RIGHT: Map Section */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-slate-300">
                Base / Station Location
              </div>

              <div
                className="
                  rounded-xl overflow-hidden border-2 border-slate-700/70
                  shadow-inner shadow-black/50
                "
              >
                <MapPicker
                  value={point}
                  onChange={setPoint}
                  center={point}
                  zoom={12}
                  height="420px"
                />
              </div>

              <div className="text-xs text-slate-500 font-mono text-center">
                Current coordinates: {Number(point.lat).toFixed(6)},{" "}
                {Number(point.lng).toFixed(6)}
              </div>

              <p className="text-xs text-slate-500">
                Drag the marker or use the map to update your primary
                base/station location
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-slate-500 mt-6">
        Changes are saved immediately • Control room sees updated status &
        location
      </p>
    </div>
  );
}
