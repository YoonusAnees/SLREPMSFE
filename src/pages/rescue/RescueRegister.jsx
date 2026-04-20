// src/pages/rescue/RescueRegister.jsx
import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";
import MapPicker from "../../map/MapPicker";
import { SL_CITIES } from "../../map/slCities";

// Optional reverse-geocode helper
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    );
    if (!res.ok) return "";
    const json = await res.json();
    return json.display_name || "";
  } catch {
    return "";
  }
}

export default function RescueRegister() {
  const toast = useUIStore((s) => s.toast);
  const rescueRegister = useRescueStore((s) => s.rescueRegister);
  const loading = useRescueStore((s) => s.loading?.register);

  const defaultCity = SL_CITIES?.[0] || {
    name: "Colombo",
    lat: 6.927079,
    lng: 79.861244,
  };

  const [city, setCity] = useState(defaultCity.name);
  const cityObj = useMemo(
    () => SL_CITIES.find((c) => c.name === city) || defaultCity,
    [city],
  );

  const [point, setPoint] = useState({ lat: cityObj.lat, lng: cityObj.lng });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    teamCode: "",
    phone: "",
    baseLocationText: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Sync map center when city preset changes
  useEffect(() => {
    setPoint({ lat: cityObj.lat, lng: cityObj.lng });
  }, [cityObj]);

  // Auto-reverse geocode when marker moves
  useEffect(() => {
    let isCurrent = true;
    const update = async () => {
      const lat = Number(point.lat);
      const lng = Number(point.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const addr = await reverseGeocode(lat, lng);
      if (isCurrent) {
        updateField("baseLocationText", addr || cityObj.name);
      }
    };
    update();

    return () => {
      isCurrent = false;
    };
  }, [point.lat, point.lng, cityObj.name]);

  async function handleSubmit(e) {
    e.preventDefault();

    const baseLat = Number(point.lat);
    const baseLng = Number(point.lng);

    if (!form.name.trim()) return toast("error", "Team name is required");
    if (!form.email.trim()) return toast("error", "Email is required");
    if (!form.password || form.password.length < 8)
      return toast("error", "Password must be at least 8 characters");
    if (!form.teamCode.trim()) return toast("error", "Team code is required");
    if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng))
      return toast("error", "Please select a valid base location on the map");

    try {
      await rescueRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        teamCode: form.teamCode.trim(),
        phone: form.phone.trim() || undefined,
        baseLat,
        baseLng,
        baseLocationText: form.baseLocationText.trim() || cityObj.name,
      });

      toast("success", "Rescue team registered successfully");

      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        teamCode: "",
        phone: "",
        baseLocationText: "",
      });
      setCity(defaultCity.name);
      setPoint({ lat: defaultCity.lat, lng: defaultCity.lng });
    } catch (err) {
      toast("error", err?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Register Rescue Team
          </h1>
          <p className="mt-3 text-slate-300 text-lg">
            Create a new RESCUE account and set your team's base location
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-900/75 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-6 py-6 md:px-8 md:py-8 border-b border-slate-700/50 bg-gradient-to-r from-red-950/30 to-slate-950/40">
            <h2 className="text-2xl font-semibold text-red-300 flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              Rescue Team Registration
            </h2>
            <p className="mt-2 text-slate-400">
              Fill team details and pin your primary base/station location on
              the map
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* LEFT: Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Team Name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Kandy Central Rescue Unit"
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="rescue.kandy@slreps.lk"
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
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
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Unique Team Code
                    </label>
                    <input
                      required
                      value={form.teamCode}
                      onChange={(e) =>
                        updateField("teamCode", e.target.value.toUpperCase())
                      }
                      placeholder="e.g. RT-KDY-001"
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all uppercase font-mono tracking-wide"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Contact Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Base Location (auto-filled from map)
                  </label>
                  <input
                    value={form.baseLocationText}
                    onChange={(e) =>
                      updateField("baseLocationText", e.target.value)
                    }
                    placeholder="Auto-filled from map pin"
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Coordinates: {Number(point.lat).toFixed(6)},{" "}
                    {Number(point.lng).toFixed(6)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full py-4 px-8 rounded-xl font-semibold text-base
                    transition-all duration-300 shadow-lg
                    ${
                      loading
                        ? "bg-slate-700 cursor-not-allowed text-slate-400"
                        : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                    }
                  `}
                >
                  {loading ? (
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
                      Registering Team...
                    </div>
                  ) : (
                    "Register Rescue Team"
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  After registration, team status defaults to{" "}
                  <span className="text-green-400 font-medium">AVAILABLE</span>.
                </p>
              </form>

              {/* RIGHT: Map Section */}
              <div className="space-y-6">
                <div className="bg-slate-950/50 border border-slate-700/60 rounded-xl p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Nearest City (preset)
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                    >
                      {SL_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={point.lat}
                        onChange={(e) =>
                          setPoint((p) => ({ ...p, lat: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={point.lng}
                        onChange={(e) =>
                          setPoint((p) => ({ ...p, lng: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div
                  className="
                    rounded-xl overflow-hidden border-2 border-slate-700/70
                    shadow-inner shadow-black/50
                  "
                >
                  <MapPicker
                    value={point}
                    onChange={setPoint}
                    center={{ lat: cityObj.lat, lng: cityObj.lng }}
                    zoom={12}
                    height="420px"
                  />
                </div>

                <div className="text-xs text-slate-500 text-center">
                  Pin your team's main base/station location
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          All rescue team registrations are reviewed by admin before activation
        </p>
      </div>
    </div>
  );
}
