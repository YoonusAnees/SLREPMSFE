import { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useOfficerStore } from "../../store/officer.store";
import { useUIStore } from "../../store/ui.store";

export default function OfficerVerifyVehicle() {
  const verifyVehicle = useOfficerStore((s) => s.verifyVehicle);
  const toast = useUIStore((s) => s.toast);

  const [plateNo, setPlateNo] = useState("CBR6172");
  const [result, setResult] = useState(null);

  async function onVerify() {
    try {
      const updated = await verifyVehicle(plateNo);
      setResult(updated);
      toast("success", "Vehicle verified");
    } catch (e) {
      setResult(null);
      toast("error", e?.response?.data?.message || "Verification failed");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Verify Vehicle Ownership</h1>

      <Card
        title="Vehicle Verification"
        subtitle="Only OFFICER/ADMIN can verify"
      >
        <div className="grid md:grid-cols-2 gap-3 items-end">
          <Input
            label="Plate Number"
            value={plateNo}
            onChange={(e) => setPlateNo(e.target.value)}
          />
          <Button onClick={onVerify} className="w-full md:w-auto">
            Verify
          </Button>
        </div>
      </Card>

      {result && (
        <Card
          title="Verification Result"
          className="bg-green-50 border-green-200"
        >
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Vehicle Details</h2>
            <div>
              <span className="font-semibold">Plate No:</span> {result.plateNo}
            </div>
            <div>
              <span className="font-semibold">Type:</span> {result.type}
            </div>
            <div>
              <span className="font-semibold">Model:</span> {result.model}
            </div>
            <div>
              <span className="font-semibold">Color:</span> {result.color}
            </div>
            <div>
              <span className="font-semibold">Year:</span> {result.year}
            </div>
            <div>
              <span className="font-semibold">Insurance Expiry:</span>{" "}
              {new Date(result.insuranceExpiry).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Ownership Verified:</span>{" "}
              {result.ownershipVerified ? "✅ Yes" : "❌ No"}
            </div>

            <h2 className="text-lg font-semibold mt-3">Driver Details</h2>
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {result.driver?.user?.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {result.driver?.user?.email}
            </div>
            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {result.driver?.user?.phone}
            </div>
            <div>
              <span className="font-semibold">NIC:</span>{" "}
              {result.driver?.user?.nic}
            </div>
            <div>
              <span className="font-semibold">License No:</span>{" "}
              {result.driver?.licenseNo}
            </div>
            <div>
              <span className="font-semibold">Current Points:</span>{" "}
              {result.driver?.currentPoints}
            </div>
            <div>
              <span className="font-semibold">License Status:</span>{" "}
              {result.driver?.licenseStatus}
            </div>
            {result.driver?.suspendedUntil && (
              <div>
                <span className="font-semibold">Suspended Until:</span>{" "}
                {new Date(result.driver.suspendedUntil).toLocaleDateString()}
              </div>
            )}

            <h2 className="text-lg font-semibold mt-3">Timestamps</h2>
            <div>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(result.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Updated At:</span>{" "}
              {new Date(result.updatedAt).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
