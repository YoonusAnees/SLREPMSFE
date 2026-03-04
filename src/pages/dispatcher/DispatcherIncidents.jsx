import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import MiniMap from "../../components/MiniMap";
import { useUIStore } from "../../store/ui.store";
import { useDispatcherStore } from "../../store/dispatcher.store";
import DispatchModal from "../../components/DispatchModal";

export default function DispatcherIncidents() {
  const toast = useUIStore((s) => s.toast);
  const loadIncidents = useDispatcherStore((s) => s.loadIncidents);
  const incidents = useDispatcherStore((s) => s.incidents);
  const loading = useDispatcherStore((s) => s.loading);

  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  async function fetch() {
    try {
      await loadIncidents();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to load incidents");
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const filtered = useMemo(() => {
    if (!status) return incidents || [];
    return (incidents || []).filter((x) => x.status === status);
  }, [incidents, status]);

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Created",
        render: (r) => new Date(r.createdAt).toLocaleString(),
      },
      { key: "status", header: "Status" },
      { key: "type", header: "Type" },
      { key: "severity", header: "Severity" },
      {
        key: "reportedBy",
        header: "Reported By",
        render: (r) => r.reportedBy?.email || "-",
      },
      { key: "locationText", header: "Location" },
      {
        key: "map",
        header: "Map",
        render: (r) => {
          const [lng, lat] =
            r.baseLocation?.coordinates || r.location?.coordinates || [];
          if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
            return <span className="text-xs text-gray-500">No location</span>;
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
        render: (r) => (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg text-xs bg-black text-white"
              onClick={() => setSelected(r)}
            >
              Dispatch
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Dispatcher · Incidents</h1>
          <p className="text-sm text-gray-600">
            Pick an incident → find nearest teams → dispatch.
          </p>
        </div>
        <Button onClick={fetch} disabled={loading.incidents}>
          Refresh
        </Button>
      </div>

      <Card title="Filters" subtitle="Filter incidents by status">
        <div className="grid md:grid-cols-3 gap-2">
          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="NEW">NEW</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: <b className="ml-2">{filtered.length}</b>
          </div>
        </div>
      </Card>

      <Table columns={columns} rows={filtered} />

      <DispatchModal
        open={!!selected}
        incident={selected}
        onClose={() => setSelected(null)}
        onDone={async () => {
          setSelected(null);
          await fetch();
        }}
      />
    </div>
  );
}
