import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";
import Table from "../../components/Table";

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
  }, [loadViolationTypes, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const code = form.code.trim();
    const title = form.title.trim();
    const fine = Number(form.baseFineLkr);
    const points = Number(form.demeritPoints);

    if (!code || !title) {
      return toast("error", "Code and Title are required");
    }

    if (isNaN(fine) || fine < 0) {
      return toast("error", "Base fine must be a valid non-negative number");
    }

    if (isNaN(points) || points < 0) {
      return toast(
        "error",
        "Demerit points must be a valid non-negative number",
      );
    }

    setBusy(true);

    try {
      await createViolationType({
        code,
        title,
        baseFineLkr: fine,
        demeritPoints: points,
        description: form.description.trim() || undefined,
      });

      toast("success", "Violation type created successfully");

      setForm({
        code: "",
        title: "",
        baseFineLkr: "",
        demeritPoints: "",
        description: "",
      });

      await loadViolationTypes();
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to create violation type",
      );
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (row) => (
          <span className="font-mono font-medium text-indigo-300 tracking-wide">
            {row.code}
          </span>
        ),
      },
      {
        key: "title",
        header: "Violation Title",
        render: (row) => (
          <span className="font-medium text-slate-200">{row.title}</span>
        ),
      },
      {
        key: "baseFineLkr",
        header: "Base Fine (LKR)",
        render: (row) => (
          <span className="font-medium text-emerald-300">
            Rs. {Number(row.baseFineLkr).toLocaleString("si-LK")}
          </span>
        ),
      },
      {
        key: "demeritPoints",
        header: "Demerit Points",
        render: (row) => (
          <span
            className={`
              font-semibold
              ${
                row.demeritPoints >= 6
                  ? "text-red-400"
                  : row.demeritPoints >= 3
                    ? "text-orange-400"
                    : "text-green-400"
              }
            `}
          >
            {row.demeritPoints}
          </span>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (row) => (
          <span className="text-slate-400 line-clamp-2 max-w-[300px]">
            {row.description || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Violation Types Management
        </h1>
        <p className="mt-2 text-slate-400">
          Define traffic violations • Set fines & demerit points • Used by
          officers
        </p>
      </div>

      {/* Create New Violation Card */}
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
          <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            Add New Violation Type
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Create codes used when issuing penalties
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Violation Code
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SPEED_80_PLUS"
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase font-mono tracking-wide
                "
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Unique short code (uppercase recommended)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Violation Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Speeding over 80 km/h"
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30 transition-all
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Base Fine (LKR)
              </label>
              <input
                type="number"
                name="baseFineLkr"
                value={form.baseFineLkr}
                onChange={handleChange}
                placeholder="e.g. 5000"
                min="0"
                step="100"
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30 transition-all
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Demerit Points
              </label>
              <input
                type="number"
                name="demeritPoints"
                value={form.demeritPoints}
                onChange={handleChange}
                placeholder="e.g. 3"
                min="0"
                max="12"
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30 transition-all
                "
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description / Legal Reference
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed description, relevant section of the Motor Traffic Act..."
                className="
                  w-full px-4 py-3.5 bg-slate-800/70 border border-slate-600
                  rounded-lg text-white placeholder-slate-400 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30 transition-all resize-y min-h-[100px]
                "
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={busy}
              className={`
                px-8 py-3.5 rounded-lg font-semibold
                transition-all duration-200 shadow-lg
                ${
                  busy
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                }
              `}
            >
              {busy ? (
                <span className="flex items-center gap-2.5">
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
                  Creating...
                </span>
              ) : (
                "Create Violation Type"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Violation Types Table */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo-300">
            All Violation Types ({violationTypes?.length || 0})
          </h2>
          <div className="text-sm text-slate-400">
            Used when issuing penalties
          </div>
        </div>

        {violationTypes?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} rows={violationTypes} theme="incident" />
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-5 opacity-80">
              <div className="text-6xl">📋</div>
              <div className="text-xl font-medium text-slate-300">
                No violation types yet
              </div>
              <div className="text-sm max-w-md">
                Use the form above to add the first violation type
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
