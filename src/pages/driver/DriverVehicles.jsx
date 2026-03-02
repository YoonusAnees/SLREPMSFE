import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";

export default function DriverVehicles() {
  const loadVehicles = useDriverStore((s) => s.loadVehicles);
  const addVehicle = useDriverStore((s) => s.addVehicle);
  const vehicles = useDriverStore((s) => s.vehicles);
  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    plateNo: "",
    type: "Car",
    model: "",
    color: "",
    year: "",
    insuranceExpiry: "",
  });

  useEffect(() => {
    loadVehicles().catch(() => {});
  }, []);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onAdd(e) {
    e.preventDefault();
    try {
      await addVehicle({
        plateNo: form.plateNo,
        type: form.type,
        model: form.model || undefined,
        color: form.color || undefined,
        year: form.year ? Number(form.year) : undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
      });
      toast("success", "Vehicle added");
      setForm({
        plateNo: "",
        type: "Car",
        model: "",
        color: "",
        year: "",
        insuranceExpiry: "",
      });
      await loadVehicles();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to add vehicle");
    }
  }

  const columns = [
    { key: "plateNo", header: "Plate No" },
    { key: "type", header: "Type" },
    { key: "model", header: "Model", render: (r) => r.model || "-" },
    { key: "color", header: "Color", render: (r) => r.color || "-" },
    { key: "year", header: "Year", render: (r) => r.year || "-" },
    {
      key: "insuranceExpiry",
      header: "Insurance Expiry",
      render: (r) =>
        r.insuranceExpiry
          ? new Date(r.insuranceExpiry).toLocaleDateString()
          : "-",
    },
    {
      key: "ownershipVerified",
      header: "Verified",
      render: (r) => (r.ownershipVerified ? "YES" : "NO"),
    },
  ];

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Vehicles</h1>

      <Card
        title="Add Vehicle"
        subtitle="Plate format will be normalized (uppercase/trim)"
      >
        <form onSubmit={onAdd} className="grid md:grid-cols-3 gap-3">
          <Input
            label="Plate No"
            value={form.plateNo}
            onChange={(e) => set("plateNo", e.target.value)}
            placeholder="CBM-7663"
          />
          <Input
            label="Type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          />
          <Input
            label="Model"
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="Honda Vezel"
          />
          <Input
            label="Color"
            value={form.color}
            onChange={(e) => set("color", e.target.value)}
            placeholder="Black"
          />
          <Input
            label="Year"
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="2024"
          />
          <Input
            label="Insurance Expiry (YYYY-MM-DD)"
            value={form.insuranceExpiry}
            onChange={(e) => set("insuranceExpiry", e.target.value)}
          />
          <div className="md:col-span-3">
            <Button className="w-full">Add Vehicle</Button>
          </div>
        </form>
      </Card>

      <Table columns={columns} rows={vehicles} />
    </div>
  );
}
