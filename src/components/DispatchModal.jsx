import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import MiniMap from "./MiniMap";
import Input from "./Input";
import { useUIStore } from "../store/ui.store";
import { useDispatcherStore } from "../store/dispatcher.store";

export default function DispatchModal({ open, incident, onClose, onDone }) {
  const toast = useUIStore((s) => s.toast);
  const nearestTeams = useDispatcherStore((s) => s.nearestTeams);
  const dispatchTeam = useDispatcherStore((s) => s.dispatchTeam);
  const updateDispatchStatus = useDispatcherStore(
    (s) => s.updateDispatchStatus,
  );
  const loading = useDispatcherStore((s) => s.loading);

  const [teams, setTeams] = useState([]);
  const [notes, setNotes] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [maxDistanceMeters, setMaxDistanceMeters] = useState(30000);

  const coords = useMemo(() => {
    const [lng, lat] =
      incident?.baseLocation?.coordinates ||
      incident?.location?.coordinates ||
      [];
    return { lat: Number(lat), lng: Number(lng) };
  }, [incident]);

  useEffect(() => {
    if (!open) return;
    setTeams([]);
    setNotes("");
    setSelectedTeamId("");
    setMaxDistanceMeters(30000);
  }, [open]);

  if (!open || !incident) return null;

  async function findTeams() {
    try {
      if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
        toast("error", "Incident location missing");
        return;
      }
      const data = await nearestTeams({
        lat: coords.lat,
        lng: coords.lng,
        limit: 8,
        maxDistanceMeters: Number(maxDistanceMeters) || 30000,
      });
      setTeams(data || []);
      if ((data || []).length) setSelectedTeamId((data || [])[0]?.id || "");
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to load nearest teams",
      );
    }
  }

  async function doDispatch() {
    try {
      if (!selectedTeamId) {
        toast("error", "Select a rescue team");
        return;
      }
      const d = await dispatchTeam({
        incidentId: incident.id,
        rescueTeamId: selectedTeamId,
        notes: notes?.trim() || undefined,
      });
      toast("success", "Team dispatched");
      // optional: if you want immediate status updates (EN_ROUTE)
      // await updateDispatchStatus({ dispatchId: d.id, status: "EN_ROUTE" });
      await onDone?.();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Dispatch failed");
    }
  }

  async function quickUpdateLastDispatch(status) {
    try {
      // if your dispatchTeam returns the new dispatch object with id:
      // you can update right away. Otherwise skip this part.
      toast(
        "error",
        "Use dispatch list page to update statuses (recommended).",
      );
    } catch (e) {
      toast("error", e?.response?.data?.message || "Update failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Dispatch Rescue Team</div>
            <div className="text-xs text-gray-600">
              Incident: <b>{incident.type}</b> · {incident.severity} ·{" "}
              {incident.status}
            </div>
          </div>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-4">
          {/* LEFT: incident info */}
          <div className="space-y-3">
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Location</div>
              <div className="text-xs text-gray-600 mt-1">
                {incident.locationText || "-"}
              </div>

              <div className="mt-3 w-full h-[220px] rounded-xl overflow-hidden border">
                <MiniMap lat={coords.lat} lng={coords.lng} />
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {Number.isFinite(coords.lat) ? coords.lat.toFixed(5) : "-"},{" "}
                {Number.isFinite(coords.lng) ? coords.lng.toFixed(5) : "-"}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-gray-700 mt-1">
                {incident.description || (
                  <span className="text-gray-400">No description</span>
                )}
              </div>

              {incident.evidence ? (
                <a
                  href={incident.evidence}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline mt-2 inline-block"
                >
                  View Evidence
                </a>
              ) : (
                <div className="text-xs text-gray-400 mt-2">No evidence</div>
              )}
            </div>
          </div>

          {/* RIGHT: teams + dispatch */}
          <div className="space-y-3">
            <div className="rounded-xl border p-3 space-y-2">
              <div className="text-sm font-medium">Find Nearest Teams</div>

              <Input
                label="Max distance (meters)"
                value={maxDistanceMeters}
                onChange={(e) => setMaxDistanceMeters(e.target.value)}
              />

              <Button onClick={findTeams} disabled={loading.nearest}>
                {loading.nearest ? "Finding..." : "Find Teams"}
              </Button>
            </div>

            <div className="rounded-xl border p-3 space-y-2">
              <div className="text-sm font-medium">Select Team</div>

              <select
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">Select</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.code || "Team"} ·{" "}
                    {Math.round(t.distanceMeters || 0)}m · {t.status}
                  </option>
                ))}
              </select>

              <Input
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button onClick={doDispatch} disabled={loading.dispatch}>
                {loading.dispatch ? "Dispatching..." : "Dispatch Team"}
              </Button>

              <div className="text-xs text-gray-500">
                After dispatch: team becomes <b>BUSY</b>, incident becomes{" "}
                <b>DISPATCHED</b>.
              </div>
            </div>

            {/* Optional quick status section */}
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Dispatch Status Updates</div>
              <div className="text-xs text-gray-600 mt-1">
                Recommended: create a separate “My Dispatches” page (below).
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
