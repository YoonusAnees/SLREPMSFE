import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";
import MapPicker from "../../map/MapPicker";

export default function RescueProfile() {
  const toast = useUIStore((s) => s.toast);
  const loadMe = useRescueStore((s) => s.loadMe);
  const updateMe = useRescueStore((s) => s.updateMe);
  const me = useRescueStore((s) => s.me);

  const [status, setStatus] = useState("AVAILABLE");
  const [phone, setPhone] = useState("");
  const [point, setPoint] = useState({ lat: 6.927079, lng: 79.861244 });
  const [baseLocationText, setBaseLocationText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await loadMe();
        if (!data) return;

        setStatus(data.status || "AVAILABLE");
        setPhone(data.phone || "");
        setBaseLocationText(data.baseLocationText || "");

        const coords = data.baseLocation?.coordinates;
        if (coords?.length === 2) setPoint({ lng: coords[0], lat: coords[1] });
      } catch (e) {
        toast("error", e?.response?.data?.message || "Failed to load profile");
      }
    })();
  }, []);

  async function save() {
    try {
      await updateMe({
        status,
        phone: phone || undefined,
        baseLat: Number(point.lat),
        baseLng: Number(point.lng),
        baseLocationText: baseLocationText || undefined,
      });
      toast("success", "Updated rescue team");
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to update");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Team Profile</h1>

      <Card title="Team Status" subtitle="Keep your availability updated">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Status</label>
              <select
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              label="Base Location Text"
              value={baseLocationText}
              onChange={(e) => setBaseLocationText(e.target.value)}
            />

            <Button onClick={save}>Save</Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Base Location</div>
            <MapPicker
              value={point}
              onChange={setPoint}
              center={point}
              zoom={12}
              height={320}
            />
            <div className="text-xs text-gray-500">
              {Number(point.lat).toFixed(5)}, {Number(point.lng).toFixed(5)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}