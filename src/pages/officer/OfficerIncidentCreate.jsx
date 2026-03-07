import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../../store/ui.store";
import { useIncidentStore } from "../../store/incident.store";
import { http } from "../../api/http";
import MapPicker from "../../map/MapPicker";
import { SL_CITIES } from "../../map/slCities";

const INCIDENT_TYPES = ["ACCIDENT", "BREAKDOWN", "MEDICAL", "FIRE", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const VIOLATION_OPTIONS = [
  { code: "", label: "— None / not sure —" },
  { code: "DRUNK_DRIVE", label: "Drunken Driving" },
  { code: "RECKLESS_DRIVING", label: "Reckless Driving" },
  { code: "NO_HELMET", label: "No Helmet" },
  { code: "RED_LIGHT_VIOLATION", label: "Red Light Violation" },
];

export default function OfficerIncidentCreate() {
  const toast = useUIStore((s) => s.toast);
  const createIncident = useIncidentStore((s) => s.createIncident);

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
    suspectedViolationCode: "",
    plateNo: "",
    locationText: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState(null);
  const [checkingVehicle, setCheckingVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityObj = useMemo(
    () => SL_CITIES.find((c) => c.name === city) || defaultCity,
    [city],
  );

  const selectedViolation = useMemo(
    () =>
      VIOLATION_OPTIONS.find((v) => v.code === form.suspectedViolationCode) ||
      null,
    [form.suspectedViolationCode],
  );

  const needsPlateField = useMemo(() => {
    const desc = form.description.toLowerCase();

    return (
      !!form.suspectedViolationCode ||
      desc.includes("drunk") ||
      desc.includes("drunken") ||
      desc.includes("drink drive") ||
      desc.includes("reckless") ||
      desc.includes("helmet") ||
      desc.includes("red light") ||
      desc.includes("signal jump")
    );
  }, [form.description, form.suspectedViolationCode]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
    let active = true;

    async function updateAddress() {
      const lat = Number(point.lat);
      const lng = Number(point.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const address = await fetchReverseGeocode(lat, lng);
      if (active) {
        updateField("locationText", address || cityObj.name);
      }
    }

    updateAddress();

    return () => {
      active = false;
    };
  }, [point.lat, point.lng, cityObj.name]);

  async function lookupVehicle(plateNo) {
    const raw = String(plateNo || "").trim();

    if (!raw) {
      setVehiclePreview(null);
      return;
    }

    try {
      setCheckingVehicle(true);
      const res = await http.get(
        `/vehicles/by-plate/${encodeURIComponent(raw)}`,
      );
      setVehiclePreview(res.data);
    } catch {
      setVehiclePreview(null);
    } finally {
      setCheckingVehicle(false);
    }
  }

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
      toast("error", "Failed to upload evidence image");
      return null;
    }
  }

  function resetForm() {
    setForm({
      type: "",
      severity: "",
      suspectedViolationCode: "",
      plateNo: "",
      locationText: "",
      description: "",
    });
    setFile(null);
    setVehiclePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const lat = Number(point.lat);
      const lng = Number(point.lng);

      if (!form.type || !form.severity) {
        toast("error", "Incident type and severity are required");
        setIsSubmitting(false);
        return;
      }

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast("error", "Please choose a valid incident location");
        setIsSubmitting(false);
        return;
      }

      if (needsPlateField && !form.plateNo.trim()) {
        toast("error", "Vehicle number plate is required for this report");
        setIsSubmitting(false);
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
        plateNo: form.plateNo.trim() || undefined,
        suspectedViolationCode: form.suspectedViolationCode || undefined,
      };

      const result = await createIncident(payload);

      if (result?.autoPenalty) {
        toast("success", "Incident created and penalty auto-issued");
      } else if (result?.requiresOfficerReview) {
        toast("success", "Incident created. Officer review still required");
      } else {
        toast("success", "Incident created successfully");
      }

      resetForm();
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to create officer incident",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Officer Incident Create
        </h1>
        <p className="text-slate-300">
          Record a road incident, identify vehicle details, and auto-process a
          penalty where applicable.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-blue-950/30 via-slate-950/40 to-red-950/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">🚓</span>
            Incident + Violation Capture
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Add location, suspected violation, plate number, and supporting
            evidence
          </p>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* LEFT */}
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
                      const selected = SL_CITIES.find((x) => x.name === name);
                      if (selected) {
                        setPoint({ lat: selected.lat, lng: selected.lng });
                      }
                    }}
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
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
                        setPoint((prev) => ({ ...prev, lat: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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
                        setPoint((prev) => ({ ...prev, lng: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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
                  height={430}
                />
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-5">
                <h3 className="text-base font-semibold text-white mb-3">
                  Auto Penalty Rules
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>Reporter role must be OFFICER.</p>
                  <p>Vehicle must exist and belong to the matched driver.</p>
                  <p>Violation code must match a registered violation type.</p>
                  <p>Ownership must be verified and insurance must be valid.</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
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
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Severity
                  </label>
                  <select
                    required
                    value={form.severity}
                    onChange={(e) => updateField("severity", e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                  >
                    <option value="">— Select level —</option>
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Suspected Violation
                </label>
                <select
                  value={form.suspectedViolationCode}
                  onChange={(e) =>
                    updateField("suspectedViolationCode", e.target.value)
                  }
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all"
                >
                  {VIOLATION_OPTIONS.map((v) => (
                    <option key={v.code || "none"} value={v.code}>
                      {v.label}
                    </option>
                  ))}
                </select>
                {selectedViolation?.code ? (
                  <p className="mt-2 text-xs text-amber-300">
                    Selected violation code: {selectedViolation.code}
                  </p>
                ) : null}
              </div>

              {needsPlateField && (
                <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Vehicle Number Plate
                    </label>
                    <input
                      value={form.plateNo}
                      onChange={(e) => updateField("plateNo", e.target.value)}
                      onBlur={() => lookupVehicle(form.plateNo)}
                      placeholder="Enter vehicle plate number"
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>

                  {checkingVehicle && (
                    <p className="text-sm text-slate-400">
                      Checking registered vehicle details...
                    </p>
                  )}

                  {vehiclePreview && (
                    <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-4 text-sm text-slate-200 space-y-1.5">
                      <h4 className="font-semibold text-emerald-300 mb-2">
                        Registered Vehicle Found
                      </h4>
                      <div>
                        <span className="text-slate-400">Plate:</span>{" "}
                        {vehiclePreview.plateNo}
                      </div>
                      <div>
                        <span className="text-slate-400">Type:</span>{" "}
                        {vehiclePreview.type || "-"}
                      </div>
                      <div>
                        <span className="text-slate-400">Model:</span>{" "}
                        {vehiclePreview.model || "-"}
                      </div>
                      <div>
                        <span className="text-slate-400">Color:</span>{" "}
                        {vehiclePreview.color || "-"}
                      </div>
                      <div>
                        <span className="text-slate-400">Year:</span>{" "}
                        {vehiclePreview.year || "-"}
                      </div>
                      <div>
                        <span className="text-slate-400">
                          Ownership Verified:
                        </span>{" "}
                        {vehiclePreview.ownershipVerified ? "Yes" : "No"}
                      </div>
                      <div>
                        <span className="text-slate-400">
                          Insurance Expiry:
                        </span>{" "}
                        {vehiclePreview.insuranceExpiry || "-"}
                      </div>

                      <div className="pt-3 mt-3 border-t border-emerald-800/30">
                        <div>
                          <span className="text-slate-400">Owner:</span>{" "}
                          {vehiclePreview?.driver?.user?.name || "-"}
                        </div>
                        <div>
                          <span className="text-slate-400">License No:</span>{" "}
                          {vehiclePreview?.driver?.licenseNo || "-"}
                        </div>
                        <div>
                          <span className="text-slate-400">
                            Current Points:
                          </span>{" "}
                          {vehiclePreview?.driver?.currentPoints ?? "-"}
                        </div>
                        <div>
                          <span className="text-slate-400">
                            License Status:
                          </span>{" "}
                          {vehiclePreview?.driver?.licenseStatus || "-"}
                        </div>
                        <div>
                          <span className="text-slate-400">
                            Suspended Until:
                          </span>{" "}
                          {vehiclePreview?.driver?.suspendedUntil || "-"}
                        </div>
                      </div>
                    </div>
                  )}

                  {!checkingVehicle &&
                    form.plateNo.trim() &&
                    !vehiclePreview && (
                      <p className="text-sm text-amber-400">
                        No registered vehicle found for this number plate
                      </p>
                    )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Location Description
                </label>
                <input
                  value={form.locationText}
                  onChange={(e) => updateField("locationText", e.target.value)}
                  placeholder="Road name, junction, landmark, town..."
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Officer Notes / Description
                </label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the incident, behaviour of driver, witness notes, road condition, etc."
                  className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all resize-y min-h-[140px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Evidence Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-900/40 file:text-blue-200 hover:file:bg-blue-800/50 file:transition-colors file:cursor-pointer cursor-pointer"
                />
                {file ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Selected: {file.name}
                  </p>
                ) : null}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg ${
                    isSubmitting
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Create Officer Incident"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 border border-slate-600 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500">
        Officer-created incidents can automatically generate a penalty when all
        validation rules are satisfied.
      </p>
    </div>
  );
}
