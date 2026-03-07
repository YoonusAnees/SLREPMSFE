import { useEffect, useMemo, useState } from "react";
import { http } from "../../api/http";
import { useUIStore } from "../../store/ui.store";

const STATUS_OPTIONS = [
  "ALL",
  "NEW",
  "UNDER_REVIEW",
  "DISPATCHED",
  "RESOLVED",
  "CANCELLED",
];

export default function IncidentReviewPage() {
  const toast = useUIStore((s) => s.toast);

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState(null);
  const [checkingVehicle, setCheckingVehicle] = useState(false);
  const [issuingPenalty, setIssuingPenalty] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    status: "ALL",
  });

  const [penaltyForm, setPenaltyForm] = useState({
    violationCode: "",
    occurredAt: new Date().toISOString().slice(0, 16),
    locationText: "",
    notes: "",
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    if (!selectedIncident) {
      setVehiclePreview(null);
      return;
    }

    const plateNo = selectedIncident?.plateNo;
    if (!plateNo) {
      setVehiclePreview(null);
      return;
    }

    lookupVehicle(plateNo);
  }, [selectedIncident?.id]);

  useEffect(() => {
    if (!selectedIncident) return;

    setPenaltyForm((prev) => ({
      ...prev,
      violationCode:
        selectedIncident?.suspectedViolationCode || prev.violationCode || "",
      locationText: selectedIncident?.locationText || prev.locationText || "",
      notes: selectedIncident?.description || prev.notes || "",
    }));
  }, [selectedIncident]);

  async function loadIncidents() {
    try {
      setLoading(true);
      const { data } = await http.get("/incidents");
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || "Failed to load incidents",
      );
    } finally {
      setLoading(false);
    }
  }

  async function lookupVehicle(plateNo) {
    if (!plateNo?.trim()) {
      setVehiclePreview(null);
      return;
    }

    try {
      setCheckingVehicle(true);
      const { data } = await http.get(
        `/vehicles/by-plate/${encodeURIComponent(plateNo)}`,
      );
      setVehiclePreview(data);
    } catch {
      setVehiclePreview(null);
    } finally {
      setCheckingVehicle(false);
    }
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function updatePenaltyField(key, value) {
    setPenaltyForm((prev) => ({ ...prev, [key]: value }));
  }

  const filteredIncidents = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return [...incidents]
      .filter((item) => {
        if (filters.status !== "ALL" && item?.status !== filters.status) {
          return false;
        }

        if (!q) return true;

        const haystack = [
          item?.id,
          item?.type,
          item?.severity,
          item?.status,
          item?.locationText,
          item?.description,
          item?.plateNo,
          item?.suspectedViolationCode,
          item?.reportedBy?.name,
          item?.reportedBy?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      })
      .sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
      );
  }, [incidents, filters]);

  function getIncidentBadge(status) {
    switch (String(status || "").toUpperCase()) {
      case "NEW":
        return "bg-blue-900/40 text-blue-300 border-blue-700/50";
      case "UNDER_REVIEW":
        return "bg-amber-900/40 text-amber-300 border-amber-700/50";
      case "DISPATCHED":
        return "bg-indigo-900/40 text-indigo-300 border-indigo-700/50";
      case "RESOLVED":
        return "bg-green-900/40 text-green-300 border-green-700/50";
      case "CANCELLED":
        return "bg-rose-900/40 text-rose-300 border-rose-700/50";
      default:
        return "bg-slate-800/50 text-slate-300 border-slate-700/50";
    }
  }

  function canIssuePenalty(incident) {
    if (!incident) return false;
    if (!incident?.plateNo) return false;
    if (!penaltyForm.violationCode) return false;
    if (!vehiclePreview?.driver?.licenseNo) return false;
    if (incident?.status === "RESOLVED" || incident?.status === "CANCELLED") {
      return false;
    }
    return true;
  }

  async function handleIssuePenalty() {
    if (!selectedIncident) return;

    if (!penaltyForm.violationCode) {
      toast("error", "Violation code is required");
      return;
    }

    if (!vehiclePreview?.driver?.licenseNo) {
      toast("error", "Driver license details not found for this plate");
      return;
    }

    try {
      setIssuingPenalty(true);

      await http.post("/penalties", {
        licenseNo: vehiclePreview.driver.licenseNo,
        plateNo: selectedIncident.plateNo,
        violationCode: penaltyForm.violationCode,
        occurredAt: penaltyForm.occurredAt
          ? new Date(penaltyForm.occurredAt).toISOString()
          : new Date().toISOString(),
        locationText:
          penaltyForm.locationText ||
          selectedIncident.locationText ||
          "Incident location",
        notes:
          penaltyForm.notes || `Issued from incident ${selectedIncident.id}`,
      });

      toast("success", "Penalty issued successfully");

      await loadIncidents();
    } catch (err) {
      toast("error", err?.response?.data?.message || "Failed to issue penalty");
    } finally {
      setIssuingPenalty(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/75 p-6 text-slate-300">
        Loading incidents...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Incident Review
          </h1>
          <p className="mt-1.5 text-slate-300">
            Review reported incidents, inspect vehicle records, and issue
            penalties where applicable.
          </p>
        </div>

        <button
          type="button"
          onClick={loadIncidents}
          className="px-4 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        {/* LEFT */}
        <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
            <h2 className="text-lg font-semibold text-indigo-300">
              Incident Queue
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Search and review incidents submitted to the system
            </p>
          </div>

          <div className="p-5 border-b border-slate-700/50 grid gap-4 md:grid-cols-[1fr_180px]">
            <input
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              placeholder="Search by plate, violation, reporter, location..."
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />

            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Statuses" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-[780px] overflow-y-auto p-5 space-y-4">
            {filteredIncidents.length ? (
              filteredIncidents.map((incident) => {
                const active = selectedIncident?.id === incident.id;

                return (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => setSelectedIncident(incident)}
                    className={`w-full text-left rounded-xl border p-4 transition ${
                      active
                        ? "border-indigo-500/60 bg-indigo-950/20"
                        : "border-slate-700/60 bg-slate-950/40 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="text-white font-semibold">
                          {incident?.type || "Incident"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {incident?.locationText || "Unknown location"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(
                            incident?.createdAt || Date.now(),
                          ).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${getIncidentBadge(
                          incident?.status,
                        )}`}
                      >
                        {incident?.status || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="text-slate-300">
                        <span className="text-slate-500">Plate:</span>{" "}
                        {incident?.plateNo || "—"}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500">Violation:</span>{" "}
                        {incident?.suspectedViolationCode || "—"}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500">Severity:</span>{" "}
                        {incident?.severity || "—"}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500">Reporter:</span>{" "}
                        {incident?.reportedBy?.name ||
                          incident?.reportedBy?.email ||
                          "—"}
                      </div>
                    </div>

                    {incident?.description ? (
                      <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                        {incident.description}
                      </p>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-8 text-sm text-slate-400 text-center">
                No incidents found for the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
              <h2 className="text-lg font-semibold text-indigo-300">
                Incident Details
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Review incident, matched vehicle, and issue penalty
              </p>
            </div>

            <div className="p-6">
              {selectedIncident ? (
                <div className="space-y-6">
                  <div className="grid gap-3">
                    <InfoRow
                      label="Incident ID"
                      value={selectedIncident.id}
                      mono
                    />
                    <InfoRow
                      label="Type"
                      value={selectedIncident.type || "—"}
                    />
                    <InfoRow
                      label="Severity"
                      value={selectedIncident.severity || "—"}
                    />
                    <InfoRow
                      label="Status"
                      value={
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getIncidentBadge(
                            selectedIncident?.status,
                          )}`}
                        >
                          {selectedIncident?.status || "UNKNOWN"}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Plate No"
                      value={selectedIncident.plateNo || "—"}
                      mono
                    />
                    <InfoRow
                      label="Suspected Violation"
                      value={selectedIncident.suspectedViolationCode || "—"}
                    />
                    <InfoRow
                      label="Location"
                      value={selectedIncident.locationText || "—"}
                    />
                    <InfoRow
                      label="Reporter"
                      value={
                        selectedIncident?.reportedBy?.name ||
                        selectedIncident?.reportedBy?.email ||
                        "—"
                      }
                    />
                    <InfoRow
                      label="Created At"
                      value={new Date(
                        selectedIncident.createdAt || Date.now(),
                      ).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    />
                  </div>

                  {selectedIncident?.description ? (
                    <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                        Description
                      </div>
                      <p className="text-sm text-slate-200 leading-6">
                        {selectedIncident.description}
                      </p>
                    </div>
                  ) : null}

                  {selectedIncident?.evidence ? (
                    <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                        Evidence
                      </div>
                      <a
                        href={selectedIncident.evidence}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-300 hover:text-blue-200 underline break-all"
                      >
                        {selectedIncident.evidence}
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-8 text-sm text-slate-400 text-center">
                  Select an incident to review its details.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
              <h2 className="text-lg font-semibold text-emerald-300">
                Matched Vehicle
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Vehicle and driver information from the plate number
              </p>
            </div>

            <div className="p-6">
              {!selectedIncident ? (
                <div className="text-sm text-slate-400">
                  Choose an incident first.
                </div>
              ) : checkingVehicle ? (
                <div className="text-sm text-slate-400">
                  Checking vehicle details...
                </div>
              ) : vehiclePreview ? (
                <div className="space-y-5">
                  <div className="grid gap-3">
                    <InfoRow
                      label="Plate No"
                      value={vehiclePreview.plateNo || "—"}
                      mono
                    />
                    <InfoRow label="Type" value={vehiclePreview.type || "—"} />
                    <InfoRow
                      label="Model"
                      value={vehiclePreview.model || "—"}
                    />
                    <InfoRow
                      label="Color"
                      value={vehiclePreview.color || "—"}
                    />
                    <InfoRow label="Year" value={vehiclePreview.year || "—"} />
                    <InfoRow
                      label="Ownership Verified"
                      value={vehiclePreview.ownershipVerified ? "Yes" : "No"}
                    />
                    <InfoRow
                      label="Insurance Expiry"
                      value={vehiclePreview.insuranceExpiry || "—"}
                    />
                  </div>

                  <div className="rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-4 space-y-3">
                    <div className="text-sm font-semibold text-emerald-300">
                      Driver Details
                    </div>
                    <InfoRow
                      label="Name"
                      value={vehiclePreview?.driver?.user?.name || "—"}
                    />
                    <InfoRow
                      label="License No"
                      value={vehiclePreview?.driver?.licenseNo || "—"}
                      mono
                    />
                    <InfoRow
                      label="Current Points"
                      value={vehiclePreview?.driver?.currentPoints ?? "—"}
                    />
                    <InfoRow
                      label="License Status"
                      value={vehiclePreview?.driver?.licenseStatus || "—"}
                    />
                    <InfoRow
                      label="Suspended Until"
                      value={vehiclePreview?.driver?.suspendedUntil || "—"}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-6 text-sm text-slate-400 text-center">
                  No registered vehicle found for this incident plate number.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-950/40">
              <h2 className="text-lg font-semibold text-rose-300">
                Issue Penalty
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Create a manual penalty from the selected incident
              </p>
            </div>

            <div className="p-6 space-y-4">
              <Field
                label="Violation Code"
                value={penaltyForm.violationCode}
                onChange={(e) =>
                  updatePenaltyField("violationCode", e.target.value)
                }
                placeholder="Example: DRUNK_DRIVE"
              />

              <Field
                label="Occurred At"
                type="datetime-local"
                value={penaltyForm.occurredAt}
                onChange={(e) =>
                  updatePenaltyField("occurredAt", e.target.value)
                }
              />

              <Field
                label="Location Text"
                value={penaltyForm.locationText}
                onChange={(e) =>
                  updatePenaltyField("locationText", e.target.value)
                }
                placeholder="Road, town, landmark..."
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={penaltyForm.notes}
                  onChange={(e) => updatePenaltyField("notes", e.target.value)}
                  placeholder="Officer review note..."
                  className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              <button
                type="button"
                disabled={!canIssuePenalty(selectedIncident) || issuingPenalty}
                onClick={handleIssuePenalty}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
                  !canIssuePenalty(selectedIncident) || issuingPenalty
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white"
                }`}
              >
                {issuingPenalty ? "Issuing Penalty..." : "Issue Penalty"}
              </button>

              <p className="text-xs text-slate-500">
                Penalty can be issued only when incident has a plate number, a
                valid violation code, and matched driver license details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center gap-4 py-1.5 border-b border-slate-800/60">
      <span className="text-slate-400 text-sm">{label}</span>
      <span
        className={`text-white text-right text-sm ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400"
      />
    </div>
  );
}
