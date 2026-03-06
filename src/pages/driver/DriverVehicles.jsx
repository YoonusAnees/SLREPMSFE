import { useEffect, useState } from "react";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles().catch(() => {});
  }, [loadVehicles]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleAddVehicle(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const plate = form.plateNo.trim().toUpperCase();
    if (!plate) {
      toast("error", "Vehicle plate number is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await addVehicle({
        plateNo: plate,
        type: form.type,
        model: form.model?.trim() || undefined,
        color: form.color?.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        insuranceExpiry: form.insuranceExpiry?.trim() || undefined,
      });

      toast("success", "Vehicle added successfully");
      setForm({
        plateNo: "",
        type: "Car",
        model: "",
        color: "",
        year: "",
        insuranceExpiry: "",
      });

      await loadVehicles();
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  }

  const vehicleColumns = [
    {
      key: "plateNo",
      header: "Plate Number",
      render: (row) => (
        <span className="font-mono font-medium tracking-wide">
          {row.plateNo}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className="capitalize">{row.type?.toLowerCase() || "—"}</span>
      ),
    },
    { key: "model", header: "Model", render: (row) => row.model || "—" },
    {
      key: "color",
      header: "Color",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.color && (
            <div
              className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
              style={{ backgroundColor: row.color.toLowerCase() }}
            />
          )}
          <span className="capitalize">{row.color?.toLowerCase() || "—"}</span>
        </div>
      ),
    },
    {
      key: "year",
      header: "Year",
      render: (row) => row.year || "—",
    },
    {
      key: "insuranceExpiry",
      header: "Insurance Expiry",
      render: (row) =>
        row.insuranceExpiry ? (
          <span className="text-orange-300">
            {new Date(row.insuranceExpiry).toLocaleDateString("en-GB")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "ownershipVerified",
      header: "Ownership",
      render: (row) =>
        row.ownershipVerified ? (
          <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-900/40 text-green-300 border border-green-700/50">
            Verified
          </span>
        ) : (
          <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Pending
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          My Vehicles
        </h1>
        <p className="mt-2 text-slate-400">
          Manage registered vehicles and add new ones
        </p>
      </div>

      {/* Add Vehicle Form */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">🚗</span>
            Register New Vehicle
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Plate number will be automatically uppercased and trimmed
          </p>
        </div>

        <form onSubmit={handleAddVehicle} className="p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Plate Number
              </label>
              <input
                required
                value={form.plateNo}
                onChange={(e) =>
                  updateField("plateNo", e.target.value.toUpperCase())
                }
                placeholder="e.g. ABC-1234 or CP CA 5678"
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase font-mono tracking-wide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Vehicle Type
              </label>
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Motorbike">Motorbike</option>
                <option value="Three Wheeler">Three Wheeler</option>
                <option value="Lorry">Lorry</option>
                <option value="Bus">Bus</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Make & Model
              </label>
              <input
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
                placeholder="e.g. Toyota Aqua, Honda CB125F"
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Color
              </label>
              <input
                value={form.color}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="e.g. Silver, Black Matte"
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateField("year", e.target.value)}
                placeholder="e.g. 2022"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Insurance Expiry
              </label>
              <input
                type="date"
                value={form.insuranceExpiry}
                onChange={(e) => updateField("insuranceExpiry", e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full sm:w-auto px-8 py-3.5 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  isSubmitting
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white shadow-emerald-900/30 hover:shadow-emerald-800/40"
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2.5">
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
                  Registering...
                </span>
              ) : (
                "Add Vehicle"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Vehicle List */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300">
            Registered Vehicles ({vehicles?.length || 0})
          </h2>
        </div>

        {vehicles?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/50">
                <tr>
                  {vehicleColumns.map((col) => (
                    <th key={col.key} className="px-6 py-4">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id || vehicle.plateNo}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {vehicleColumns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        {col.render
                          ? col.render(vehicle)
                          : vehicle[col.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No vehicles registered yet.
            <br />
            Add your first vehicle using the form above.
          </div>
        )}
      </div>
    </div>
  );
}
