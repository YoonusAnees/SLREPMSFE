import { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";

export default function DriverIncidents() {
  const createIncident = useDriverStore((s) => s.createIncident);
  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    type: "ACCIDENT",
    severity: "HIGH",
    lat: "7.169",
    lng: "79.886",
    locationText: "Katunayake Road",
    description: "Two vehicles collided. One injured.",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await createIncident({
        type: form.type,
        severity: form.severity,
        lat: Number(form.lat),
        lng: Number(form.lng),
        locationText: form.locationText || undefined,
        description: form.description || undefined,
      });
      toast("success", "Incident reported");
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to report incident");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Report Incident</h1>
      <Card
        title="Incident Details"
        subtitle="Coordinates should be WGS84 (lat/lng)"
      >
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
          <Input
            label="Type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          />
          <Input
            label="Severity"
            value={form.severity}
            onChange={(e) => set("severity", e.target.value)}
          />
          <Input
            label="Latitude"
            value={form.lat}
            onChange={(e) => set("lat", e.target.value)}
          />
          <Input
            label="Longitude"
            value={form.lng}
            onChange={(e) => set("lng", e.target.value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Location Text"
              value={form.locationText}
              onChange={(e) => set("locationText", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button className="w-full">Submit Incident</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
