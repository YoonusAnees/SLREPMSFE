import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import MapPicker from "../../map/MapPicker";
import { SL_CITIES } from "../../map/slCities";
import { useIncidentStore } from "../../store/incident.store";
import { http } from "../../api/http";

export default function DriverIncidents() {
  const createIncident = useIncidentStore((s) => s.createIncident);
  const toast = useUIStore((s) => s.toast);

  const defaultCity = SL_CITIES?.[0] || {
    name: "Colombo",
    lat: 6.927079,
    lng: 79.861244,
  };

  const [city, setCity] = useState(defaultCity.name);
  const [point, setPoint] = useState({
    lat: defaultCity.lat,
    lng: defaultCity.lng,
  });

  const [form, setForm] = useState({
    type: "",
    severity: "",
    locationText: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityObj = useMemo(
    () => SL_CITIES.find((c) => c.name === city) || defaultCity,
    [city],
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Reverse geocoding
  async function fetchReverseGeocode(lat, lng) {
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

  useEffect(() => {
    let isMounted = true;
    const update = async () => {
      const lat = Number(point.lat);
      const lng = Number(point.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const addr = await fetchReverseGeocode(lat, lng);
      if (isMounted) {
        updateField("locationText", addr || cityObj.name);
      }
    };
    update();

    return () => {
      isMounted = false;
    };
  }, [point.lat, point.lng, cityObj.name]);

  async function uploadEvidence() {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await http.post("/incidents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err) {
      toast("error", "Failed to upload photo");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const lat = Number(point.lat);
      const lng = Number(point.lng);

      if (!form.type || !form.severity) {
        toast("error", "Type and severity are required");
        return;
      }

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast("error", "Please select a valid location on the map");
        return;
      }

      const evidenceUrl = await uploadEvidence();

      const payload = {
        type: form.type,
        severity: form.severity,
        lat,
        lng,
        description: form.description.trim() || undefined,
        locationText: form.locationText.trim() || cityObj.name,
        evidence: evidenceUrl || null,
      };

      await createIncident(payload);
      toast("success", "Incident reported successfully");

      // Reset form
      setForm({
        type: "",
        severity: "",
        locationText: "",
        description: "",
      });
      setFile(null);
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Report Road Incident
        </h1>
        <p className="mt-2 text-slate-300">
          Help make roads safer — report accidents, breakdowns, hazards or
          emergencies
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-red-950/30 via-slate-950/40 to-red-950/30">
          <h2 className="text-xl font-semibold text-red-300 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            New Incident Report
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Select location • Describe what happened • Attach photo if available
          </p>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* LEFT – Map & Location */}
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nearest City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCity(name);
                      const c = SL_CITIES.find((x) => x.name === name);
                      if (c) setPoint({ lat: c.lat, lng: c.lng });
                    }}
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

              <div className="rounded-xl overflow-hidden border-2 border-slate-700/70 shadow-inner shadow-black/40">
                <MapPicker
                  value={point}
                  onChange={setPoint}
                  center={{ lat: cityObj.lat, lng: cityObj.lng }}
                  zoom={11}
                  height={420}
                />
              </div>
            </div>

            {/* RIGHT – Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Incident Type
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                  >
                    <option value="">— Select type —</option>
                    {[
                      "ACCIDENT",
                      "BREAKDOWN",
                      "MEDICAL EMERGENCY",
                      "FIRE",
                      "HAZARD",
                      "OTHER",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Severity Level
                  </label>
                  <select
                    required
                    value={form.severity}
                    onChange={(e) => updateField("severity", e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                  >
                    <option value="">— Select level —</option>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
                      <option
                        key={s}
                        value={s}
                        className={
                          s === "CRITICAL" ? "text-red-400 font-medium" : ""
                        }
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Location Description (auto-filled)
                </label>
                <input
                  value={form.locationText}
                  onChange={(e) => updateField("locationText", e.target.value)}
                  placeholder="Street name, landmark, area..."
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Additional Details
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={5}
                  placeholder="What happened? Number of vehicles? Injuries? Road condition? ..."
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all resize-y min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Photo / Evidence (optional)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-5 file:rounded-lg
                      file:border-0 file:text-sm file:font-medium
                      file:bg-red-900/40 file:text-red-200
                      hover:file:bg-red-800/50 file:transition-colors
                      file:cursor-pointer cursor-pointer"
                  />
                </div>
                {file && (
                  <p className="mt-2 text-xs text-slate-400">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-3.5 px-6 rounded-xl font-semibold text-base
                  transition-all duration-300 shadow-lg
                  ${
                    isSubmitting
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                  }
                `}
              >
                {isSubmitting ? (
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
                    Submitting Report...
                  </div>
                ) : (
                  "Submit Incident Report"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500 pt-2">
        All reports are reviewed by dispatch / traffic control team
      </p>
    </div>
  );
}
