import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";
import { useDebounce } from "../../utils/useDebounce";

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs border rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function OfficerIssuePenalty() {
  const loadViolationTypes = useOfficerStore((s) => s.loadViolationTypes);
  const violationTypes = useOfficerStore((s) => s.violationTypes);
  const issuePenalty = useOfficerStore((s) => s.issuePenalty);

  const lookupDriverByLicense = useOfficerStore((s) => s.lookupDriverByLicense);
  const lookedUp = useOfficerStore((s) => s.lookedUp);
  const lookupLoading = useOfficerStore((s) => s.lookupLoading);
  const lookupError = useOfficerStore((s) => s.lookupError);
  const clearLookup = useOfficerStore((s) => s.clearLookup);

  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    licenseNo: "",
    plateNo: "",
    violationCode: "",
    locationText: "",
    occurredAt: new Date().toISOString(),
    notes: "",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  useEffect(() => {
    loadViolationTypes().catch(() => {});
  }, [loadViolationTypes]);

  // ✅ debounce license lookup
  const debouncedLicense = useDebounce(form.licenseNo, 600);

  useEffect(() => {
    const lic = (debouncedLicense || "").trim();
    if (lic.length < 5) {
      clearLookup();
      return;
    }

    lookupDriverByLicense(lic).catch(() => {});
  }, [debouncedLicense, lookupDriverByLicense, clearLookup]);

  // ✅ when lookup returns vehicles and plate is empty → auto-fill first vehicle
  useEffect(() => {
    if (!lookedUp?.vehicles?.length) return;
    if (form.plateNo && form.plateNo.trim()) return;
    set("plateNo", lookedUp.vehicles[0].plateNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookedUp]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!lookedUp?.driver?.licenseNo) {
      toast(
        "error",
        "Please enter a valid license number and load driver details first.",
      );
      return;
    }

    try {
      await issuePenalty({
        licenseNo: form.licenseNo.trim(),
        plateNo: form.plateNo?.trim() ? form.plateNo.trim() : undefined,
        violationCode: form.violationCode,
        locationText: form.locationText,
        occurredAt: form.occurredAt,
        notes: form.notes?.trim() ? form.notes.trim() : undefined,
      });

      toast("success", "Penalty issued");

      // optionally clear only some fields
      setForm((p) => ({
        ...p,
        plateNo: "",
        violationCode: "",
        locationText: "",
        notes: "",
        occurredAt: new Date().toISOString(),
      }));
    } catch (e2) {
      toast("error", e2?.response?.data?.message || "Failed to issue penalty");
    }
  }

  const vehicles = lookedUp?.vehicles || [];

  const statusTone =
    lookedUp?.driver?.licenseStatus === "SUSPENDED" ? "red" : "green";

  const pointsTone =
    (lookedUp?.driver?.currentPoints ?? 0) === 0 ? "red" : "blue";

  const violationOptions = useMemo(() => {
    // Keep a default placeholder
    if (!violationTypes?.length) return [];
    return violationTypes;
  }, [violationTypes]);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Issue Penalty</h1>

      {/* ✅ Driver Preview */}
      <Card
        title="Driver Lookup"
        subtitle="Enter license number to fetch driver + vehicles"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            label="License No"
            value={form.licenseNo}
            onChange={(e) => set("licenseNo", e.target.value)}
            placeholder="e.g., B1234567"
          />

          <div className="flex items-end gap-2">
            <div className="text-sm text-gray-600">
              {lookupLoading ? "Searching…" : lookupError ? "" : ""}
            </div>
            {lookupLoading ? <Badge tone="yellow">Loading</Badge> : null}
            {lookupError ? <Badge tone="red">{lookupError}</Badge> : null}
            {lookedUp?.driver ? <Badge tone="green">Found</Badge> : null}
          </div>
        </div>

        {lookedUp?.driver ? (
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-xs text-gray-500">Driver</div>
              <div className="mt-1 font-semibold">
                {lookedUp.user?.name || "—"}
              </div>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div>
                  Email:{" "}
                  <span className="font-medium">
                    {lookedUp.user?.email || "—"}
                  </span>
                </div>
                <div>
                  Phone:{" "}
                  <span className="font-medium">
                    {lookedUp.user?.phone || "—"}
                  </span>
                </div>
                <div>
                  NIC:{" "}
                  <span className="font-medium">
                    {lookedUp.user?.nic || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-xs text-gray-500">License</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone}>{lookedUp.driver.licenseStatus}</Badge>
                <Badge tone={pointsTone}>
                  Points: {lookedUp.driver.currentPoints}
                </Badge>
              </div>
              {lookedUp.driver.licenseStatus === "SUSPENDED" ? (
                <div className="mt-2 text-sm text-red-700">
                  Suspended until:{" "}
                  <b>
                    {new Date(lookedUp.driver.suspendedUntil).toLocaleString()}
                  </b>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-600">License active</div>
              )}
            </div>

            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-xs text-gray-500">Vehicles</div>
              <div className="mt-2 text-sm text-gray-700">
                {vehicles.length === 0 ? (
                  <div className="text-gray-500">No vehicles registered</div>
                ) : (
                  <ul className="space-y-2">
                    {vehicles.slice(0, 4).map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium">
                            {v.plateNo} — {v.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {v.model || "—"} • {v.color || "—"} •{" "}
                            {v.year || "—"}
                          </div>
                        </div>
                        <Badge tone={v.ownershipVerified ? "green" : "yellow"}>
                          {v.ownershipVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ✅ Penalty Form */}
      <Card
        title="Penalty Form"
        subtitle="Issue penalty after verifying driver details"
      >
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
          {/* Plate choose from vehicles if available */}
          {vehicles.length > 0 ? (
            <div>
              <label className="text-xs text-gray-600">Vehicle Plate</label>
              <select
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={form.plateNo}
                onChange={(e) => set("plateNo", e.target.value)}
              >
                <option value="">(Select a vehicle)</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plateNo}>
                    {v.plateNo} — {v.type} {v.model ? `(${v.model})` : ""}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                You can still type manually if needed.
              </div>
            </div>
          ) : (
            <Input
              label="Plate No (optional)"
              value={form.plateNo}
              onChange={(e) => set("plateNo", e.target.value)}
              placeholder="e.g., CBM-7663"
            />
          )}

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Violation Code</label>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={form.violationCode}
              onChange={(e) => set("violationCode", e.target.value)}
            >
              <option value="">(Select violation)</option>
              {violationOptions.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.code} — {v.title} (LKR {v.baseFineLkr}, Pts{" "}
                  {v.demeritPoints})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Location"
            value={form.locationText}
            onChange={(e) => set("locationText", e.target.value)}
            placeholder="e.g., Negombo Road, Katunayake"
          />
          <Input
            label="Occurred At (ISO)"
            value={form.occurredAt}
            onChange={(e) => set("occurredAt", e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              className="w-full"
              disabled={lookupLoading || !lookedUp?.driver}
            >
              Issue Penalty
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
