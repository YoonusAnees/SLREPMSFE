import { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";

export default function OfficerVerifyVehicle() {
  const verifyVehicle = useOfficerStore((s) => s.verifyVehicle);
  const toast = useUIStore((s) => s.toast);

  const [plateNo, setPlateNo] = useState("CBM-7663");
  const [result, setResult] = useState(null);

  async function onVerify() {
    try {
      const updated = await verifyVehicle(plateNo);
      setResult(updated);
      toast("success", "Vehicle verified");
    } catch (e) {
      toast("error", e?.response?.data?.message || "Verification failed");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Verify Vehicle Ownership</h1>
      <Card title="Verification" subtitle="Only OFFICER/ADMIN can verify">
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            label="Plate No"
            value={plateNo}
            onChange={(e) => setPlateNo(e.target.value)}
          />
          <Button onClick={onVerify}>Verify</Button>
        </div>

        {result && (
          <pre className="text-xs bg-gray-50 border rounded-xl p-3 mt-3 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}
