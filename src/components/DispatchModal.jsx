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
        toast("error", "Incident location coordinates missing");
        return;
      }

      const data = await nearestTeams({
        lat: coords.lat,
        lng: coords.lng,
        limit: 8,
        maxDistanceMeters: Number(maxDistanceMeters) || 30000,
      });

      setTeams(data || []);
      if (data?.length) setSelectedTeamId(data[0]?.id || "");
    } catch (e) {
      toast(
        "error",
        e?.response?.data?.message || "Failed to find nearest teams",
      );
    }
  }

  async function doDispatch() {
    if (!selectedTeamId) {
      return toast("error", "Please select a rescue team");
    }

    try {
      await dispatchTeam({
        incidentId: incident.id,
        rescueTeamId: selectedTeamId,
        notes: notes.trim() || undefined,
      });

      toast("success", "Rescue team dispatched successfully");
      onDone?.();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Dispatch failed");
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm
        flex items-center justify-center p-4 overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-4xl bg-gradient-to-b from-slate-900/95 to-slate-950/95
          backdrop-blur-xl border border-slate-700/60 rounded-2xl
          shadow-2xl shadow-black/70 overflow-hidden
          text-slate-100
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/60 bg-slate-950/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-3">
              <span className="text-2xl">🚑</span>
              Dispatch Rescue Team
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Incident:{" "}
              <span className="text-slate-200 font-medium capitalize">
                {incident.type?.toLowerCase() || "Unknown"}
              </span>
              {" · "}
              <span
                className={`
                font-medium
                ${
                  incident.severity === "CRITICAL"
                    ? "text-red-400"
                    : incident.severity === "HIGH"
                      ? "text-orange-400"
                      : "text-amber-300"
                }
              `}
              >
                {incident.severity || "?"}
              </span>
              {" · "}
              <span className="text-slate-300">{incident.status || "—"}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              px-5 py-2.5 rounded-lg text-sm font-medium
              bg-slate-800 hover:bg-slate-700 active:bg-slate-900
              border border-slate-600 text-slate-200
              transition-all duration-200 shadow-sm
            "
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 md:gap-8">
          {/* LEFT: Incident Info */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner shadow-black/30">
              <div className="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📍</span>
                Location
              </div>
              <div className="text-sm text-slate-300 mb-3 line-clamp-2">
                {incident.locationText || "No location description"}
              </div>

              <div
                className="
                  w-full h-[220px] sm:h-[260px] rounded-lg overflow-hidden
                  border-2 border-slate-700 hover:border-cyan-600 transition-all
                  shadow-inner shadow-black/40 cursor-pointer
                "
                onClick={() =>
                  incident?.baseLocation?.coordinates &&
                  window.open(
                    `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
                    "_blank",
                  )
                }
              >
                {Number.isFinite(coords.lat) && Number.isFinite(coords.lng) ? (
                  <MiniMap lat={coords.lat} lng={coords.lng} zoom={14} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No valid coordinates
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-500 font-mono">
                {Number.isFinite(coords.lat)
                  ? coords.lat.toFixed(6) + ", " + coords.lng.toFixed(6)
                  : "No coordinates available"}
              </div>
            </div>

            {/* Description & Evidence */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner shadow-black/30">
              <div className="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Incident Details
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-line">
                {incident.description || (
                  <span className="text-slate-500 italic">
                    No description provided
                  </span>
                )}
              </p>

              {incident.evidence ? (
                <a
                  href={incident.evidence}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    mt-4 inline-flex items-center gap-2 text-sm font-medium
                    text-cyan-400 hover:text-cyan-300 transition-colors
                  "
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                    />
                  </svg>
                  View Evidence Photo
                </a>
              ) : (
                <div className="mt-4 text-sm text-slate-500 italic">
                  No evidence photo attached
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Team Selection & Dispatch */}
          <div className="space-y-6">
            {/* Find Teams */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner shadow-black/30">
              <div className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Find Nearest Rescue Teams
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Max Distance (meters)
                  </label>
                  <input
                    type="number"
                    value={maxDistanceMeters}
                    onChange={(e) => setMaxDistanceMeters(e.target.value)}
                    placeholder="30000"
                    className="
                      w-full px-4 py-3 bg-slate-800/70 border border-slate-600
                      rounded-lg text-white placeholder-slate-400 focus:border-cyan-500
                      focus:ring-2 focus:ring-cyan-500/30 transition-all
                    "
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Search radius from incident location
                  </p>
                </div>

                <Button
                  onClick={findTeams}
                  disabled={loading.nearest}
                  className={`
                    w-full py-3 rounded-lg font-semibold
                    transition-all duration-200 shadow-lg
                    ${
                      loading.nearest
                        ? "bg-slate-700 cursor-not-allowed text-slate-400"
                        : "bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white shadow-cyan-900/40 hover:shadow-cyan-800/50"
                    }
                  `}
                >
                  {loading.nearest ? "Searching..." : "Find Nearest Teams"}
                </Button>
              </div>
            </div>

            {/* Select Team & Dispatch */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner shadow-black/30">
              <div className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                <span className="text-lg">🚑</span>
                Select & Dispatch Team
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Available Teams ({teams.length})
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    disabled={teams.length === 0}
                    className="
                      w-full px-4 py-3 bg-slate-800/70 border border-slate-600
                      rounded-lg text-white focus:border-cyan-500 focus:ring-2
                      focus:ring-cyan-500/30 transition-all disabled:opacity-50
                    "
                  >
                    <option value="">— Select nearest team —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.code || "Team"} •{" "}
                        {Math.round(t.distanceMeters || 0)}m • {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Dispatch Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional instructions, e.g. 'Priority 1 - critical patient'"
                    className="
                      w-full px-4 py-3 bg-slate-800/70 border border-slate-600
                      rounded-lg text-white placeholder-slate-400 focus:border-cyan-500
                      focus:ring-2 focus:ring-cyan-500/30 transition-all resize-y min-h-[90px]
                    "
                  />
                </div>

                <Button
                  onClick={doDispatch}
                  disabled={loading.dispatch || !selectedTeamId}
                  className={`
                    w-full py-3.5 rounded-lg font-semibold text-base
                    transition-all duration-200 shadow-lg flex items-center justify-center gap-2
                    ${
                      loading.dispatch || !selectedTeamId
                        ? "bg-slate-700 cursor-not-allowed text-slate-400"
                        : "bg-red-700 hover:bg-red-600 active:bg-red-800 text-white shadow-red-900/40 hover:shadow-red-800/50"
                    }
                  `}
                >
                  {loading.dispatch ? (
                    <>
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
                      Dispatching...
                    </>
                  ) : (
                    "Dispatch Selected Team"
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  After dispatch: team status →{" "}
                  <span className="text-amber-300 font-medium">BUSY</span>,
                  incident →{" "}
                  <span className="text-cyan-300 font-medium">DISPATCHED</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 bg-slate-950/60 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="
              px-6 py-2.5 rounded-lg font-medium
              bg-slate-800 hover:bg-slate-700 active:bg-slate-900
              border border-slate-600 text-slate-200
            "
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
