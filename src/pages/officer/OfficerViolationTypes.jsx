import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";

export default function OfficerViolationTypes() {
  const violationTypes = useOfficerStore((s) => s.violationTypes);
  const loadViolationTypes = useOfficerStore((s) => s.loadViolationTypes);
  const createViolationType = useOfficerStore((s) => s.createViolationType);

  const toast = useUIStore((s) => s.toast);

  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    code: "",
    title: "",
    baseFineLkr: "",
    demeritPoints: "",
    description: "",
  });

  useEffect(() => {
    loadViolationTypes().catch(() =>
      toast("error", "Failed to load violation types"),
    );
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.code || !form.title) {
      toast("error", "Code and Title are required");
      return;
    }

    setBusy(true);

    try {
      await createViolationType({
        code: form.code.trim(),
        title: form.title.trim(),
        baseFineLkr: Number(form.baseFineLkr),
        demeritPoints: Number(form.demeritPoints),
        description: form.description.trim(),
      });

      toast("success", "Violation type created");

      setForm({
        code: "",
        title: "",
        baseFineLkr: "",
        demeritPoints: "",
        description: "",
      });

      await loadViolationTypes();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Creation failed");
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: "code", header: "Code" },
    { key: "title", header: "Title" },
    {
      key: "baseFineLkr",
      header: "Fine (LKR)",
      render: (row) => `Rs. ${row.baseFineLkr?.toLocaleString()}`,
    },
    { key: "demeritPoints", header: "Points" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Violation Types Management</h1>

      {/* Create Form */}
      <Card title="Add New Violation Type">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Code (e.g. OVER_SPEED)"
            className="border p-2 rounded"
          />

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="border p-2 rounded"
          />

          <input
            type="number"
            name="baseFineLkr"
            value={form.baseFineLkr}
            onChange={handleChange}
            placeholder="Base Fine (LKR)"
            className="border p-2 rounded"
          />

          <input
            type="number"
            name="demeritPoints"
            value={form.demeritPoints}
            onChange={handleChange}
            placeholder="Demerit Points"
            className="border p-2 rounded"
          />

          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded col-span-2"
          />

          <div className="col-span-2">
            <Button type="submit" loading={busy}>
              Create Violation Type
            </Button>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card title="All Violation Types">
        <Table columns={columns} rows={violationTypes} />
      </Card>
    </div>
  );
}
