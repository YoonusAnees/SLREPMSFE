// src/pages/rescue/RescueRegister.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import MapPicker from "../../map/MapPicker";
import { SL_CITIES } from "../../map/slCities";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

// Optional reverse-geocode helper (same as DriverIncidents)
async function reverseGeocode(lat, lng) {
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

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Keep point synced when city changes
  useEffect(() => {
    setPoint({ lat: cityObj.lat, lng: cityObj.lng });
  }, [cityObj.lat, cityObj.lng]);

  // Auto-fill baseLocationText when map moves
  useEffect(() => {
    const run = async () => {
      const lat = Number(point.lat);
      const lng = Number(point.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const addr = await reverseGeocode(lat, lng);
      setForm((prev) => ({
        ...prev,
        baseLocationText: addr || prev.baseLocationText,
      }));
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.lat, point.lng]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const baseLat = Number(point.lat);
      const baseLng = Number(point.lng);

      if (!form.name.trim()) return toast("error", "Name is required");
      if (!form.email.trim()) return toast("error", "Email is required");
      if (!form.password || form.password.length < 8)
        return toast("error", "Password must be at least 8 characters");
      if (!form.teamCode.trim()) return toast("error", "Team code is required");
      if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng))
        return toast("error", "Invalid map location");

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

      toast("success", "Rescue team registered");

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
    } catch (e2) {
      toast(
        "error",
        e2?.response?.data?.message || e2?.message || "Register failed",
      );
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">Register Rescue Team</h1>
        <p className="text-sm text-gray-600">
          Create a RESCUE user + rescue team profile with base location.
        </p>
      </div>

      <Card
        title="Team Details"
        subtitle="Fill details and pin the base location"
      >
        <div className="grid md:grid-cols-2 gap-4">
          {/* LEFT: FORM */}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Team Name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g., Colombo Rescue Unit"
            />

            <Input
              label="Email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="team@email.com"
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="Min 8 characters"
            />

            <Input
              label="Team Code"
              value={form.teamCode}
              onChange={(e) => setField("teamCode", e.target.value)}
              placeholder="e.g., RT-COLOMBO-01"
            />

            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+94..."
            />

            <Input
              label="Base Location Text (auto-filled)"
              value={form.baseLocationText}
              onChange={(e) => setField("baseLocationText", e.target.value)}
              placeholder="Auto filled from map"
            />

            <Button className="w-full" disabled={!!loading}>
              {loading ? "Registering..." : "Register Rescue Team"}
            </Button>

            <div className="text-xs text-gray-500">
              After registering, team status defaults to <b>AVAILABLE</b>.
            </div>
          </form>

          {/* RIGHT: MAP */}
          <div className="space-y-2">
            <div className="rounded-xl border p-3 space-y-2">
              <label className="text-sm font-medium">City Preset</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
            </div>

            <div className="rounded-xl border overflow-hidden">
              <MapPicker
                value={point}
                onChange={setPoint}
                center={{ lat: cityObj.lat, lng: cityObj.lng }}
                zoom={11}
                height={360}
              />
            </div>

            <div className="text-xs text-gray-500">
              {Number(point.lat).toFixed(5)}, {Number(point.lng).toFixed(5)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
