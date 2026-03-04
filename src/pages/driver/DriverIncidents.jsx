import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
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

  const cityObj = useMemo(
    () => SL_CITIES.find((c) => c.name === city) || defaultCity,
    [city],
  );

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  /* -----------------------------
      REVERSE GEOCODE
  ------------------------------*/
  async function fetchReverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      );
      const json = await res.json();
      return json.display_name || "";
    } catch {
      return "";
    }
  }

  /* -----------------------------
      ALWAYS UPDATE locationText
      WHEN MAP POINT CHANGES
  ------------------------------*/
  useEffect(() => {
    const update = async () => {
      const lat = Number(point.lat);
      const lng = Number(point.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const addr = await fetchReverseGeocode(lat, lng);
      setForm((prev) => ({ ...prev, locationText: addr || "" }));
    };

    update();
  }, [point.lat, point.lng]);

  /* --------------------------------
      FILE UPLOAD
  -------------------------------- */
  async function uploadEvidence() {
    if (!file) return null;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await http.post("/incidents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (e) {
      toast("error", "Failed to upload evidence");
      return null;
    }
  }

  /* --------------------------------
      SUBMIT INCIDENT
  -------------------------------- */
  async function onSubmit(e) {
    e.preventDefault();

    try {
      const lat = Number(point.lat);
      const lng = Number(point.lng);

      if (!form.type || !form.severity) {
        toast("error", "Please select type and severity");
        return;
      }

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast("error", "Invalid map location");
        return;
      }

      const evidenceUrl = await uploadEvidence();

      const payload = {
        type: form.type,
        severity: form.severity,
        lat,
        lng,
        description: form.description.trim() || undefined,
        locationText: form.locationText.trim() || `${cityObj.name}`,
        evidence: evidenceUrl || null,
      };

      await createIncident(payload);
      toast("success", "Incident reported");

      setForm({
        type: "",
        severity: "",
        locationText: "",
        description: "",
      });

      setFile(null);
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to report incident",
      );
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">Report Incident</h1>
        <p className="text-sm text-gray-600">
          Pick a location on the map, add details, and upload evidence.
        </p>
      </div>

      <Card title="Incident Location" subtitle="Click map or drag marker">
        <div className="grid md:grid-cols-2 gap-3">
          {/* LEFT: MAP */}
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={city}
              onChange={(e) => {
                const name = e.target.value;
                setCity(name);
                const c = SL_CITIES.find((x) => x.name === name);
                if (c) setPoint({ lat: c.lat, lng: c.lng });
              }}
            >
              {SL_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Latitude"
                value={point.lat}
                onChange={(e) =>
                  setPoint((prev) => ({ ...prev, lat: e.target.value }))
                }
              />
              <Input
                label="Longitude"
                value={point.lng}
                onChange={(e) =>
                  setPoint((prev) => ({ ...prev, lng: e.target.value }))
                }
              />
            </div>

            <MapPicker
              value={point}
              onChange={(pos) => setPoint(pos)}
              center={{ lat: cityObj.lat, lng: cityObj.lng }}
              zoom={11}
              height={360}
            />
          </div>

          {/* RIGHT: FORM */}
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Type</label>
              <select
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="">Select type</option>
                {["ACCIDENT", "BREAKDOWN", "MEDICAL", "FIRE", "OTHER"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Severity</label>
              <select
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={form.severity}
                onChange={(e) => setField("severity", e.target.value)}
              >
                <option value="">Select severity</option>
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location Text (auto-filled)"
              value={form.locationText}
              onChange={(e) => setField("locationText", e.target.value)}
            />

            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />

            <div>
              <label className="text-xs text-gray-600">Evidence (Image)</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <Button className="w-full">Submit Incident</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
