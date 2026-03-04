import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import MiniMap from "../../components/MiniMap";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useUIStore } from "../../store/ui.store";
import { useRescueStore } from "../../store/rescue.store";

export default function RescueDispatches() {
  const toast = useUIStore((s) => s.toast);
  const loadMyDispatches = useRescueStore((s) => s.loadMyDispatches);
  const updateDispatchStatus = useRescueStore((s) => s.updateDispatchStatus);
  const myDispatches = useRescueStore((s) => s.myDispatches);
  const loading = useRescueStore((s) => s.loading);

  const [status, setStatus] = useState("");

  async function fetch() {
    try {
      await loadMyDispatches();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load dispatches");
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const rows = useMemo(() => {
    const list = myDispatches || [];
    return status ? list.filter((d) => d.status === status) : list;
  }, [myDispatches, status]);

  async function setStatusFor(dispatchId, newStatus) {
    try {
      await updateDispatchStatus({ dispatchId, status: newStatus });
      toast("success", "Status updated");
      await fetch();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to update status");
    }
  }

  function openMaps(d) {
    const [lng, lat] =
      d.incident?.baseLocation?.coordinates ||
      d.incident?.location?.coordinates ||
      [];
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return toast("error", "No incident location");
    }
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }

  const columns = useMemo(
    () => [
      { key: "status", header: "Status" },
      {
        key: "incident",
        header: "Incident",
        render: (d) =>
          `${d.incident?.type || "-"} · ${d.incident?.severity || "-"}`,
      },
      {
        key: "locationText",
        header: "Location",
        render: (d) => d.incident?.locationText || "-",
      },
      {
        key: "map",
        header: "Map",
        render: (d) => {
          const [lng, lat] =
            d.incident?.baseLocation?.coordinates ||
            d.incident?.location?.coordinates ||
            [];
          if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
            return <span className="text-xs text-gray-500">No map</span>;
          }
          return (
            <div className="w-[200px] h-[130px] rounded-lg overflow-hidden border">
              <MiniMap lat={lat} lng={lng} />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (d) => {
          const isDone = d.status === "COMPLETED" || d.status === "CANCELLED";

          return (
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-1 rounded-lg text-xs bg-blue-600 text-white"
                onClick={() => openMaps(d)}
              >
                Open Maps
              </button>

              {isDone ? (
                <span className="text-xs px-2 py-1 rounded-full border text-gray-600">
                  {d.status}
                </span>
              ) : (
                <>
                  <button
                    className="px-3 py-1 rounded-lg text-xs bg-black text-white disabled:opacity-50"
                    disabled={loading.update || d.status === "EN_ROUTE"}
                    onClick={() => setStatusFor(d.id, "EN_ROUTE")}
                  >
                    EN_ROUTE
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs bg-black text-white disabled:opacity-50"
                    disabled={loading.update || d.status === "ON_SCENE"}
                    onClick={() => setStatusFor(d.id, "ON_SCENE")}
                  >
                    ON_SCENE
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white disabled:opacity-50"
                    disabled={loading.update}
                    onClick={() => setStatusFor(d.id, "COMPLETED")}
                  >
                    COMPLETED
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white disabled:opacity-50"
                    disabled={loading.update}
                    onClick={() => setStatusFor(d.id, "CANCELLED")}
                  >
                    CANCEL
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [loading.update],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Rescue · My Dispatches</h1>
          <p className="text-sm text-gray-600">
            Update status as you move to the incident.
          </p>
        </div>

        <Button onClick={fetch} disabled={loading.dispatches}>
          Refresh
        </Button>
      </div>

      <Card title="Filter" subtitle="Filter dispatches by status">
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="EN_ROUTE">EN_ROUTE</option>
          <option value="ON_SCENE">ON_SCENE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Card>

      <Table columns={columns} rows={rows} />
    </div>
  );
}
