import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useDriverStore } from "../../store/driver.store";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";

export default function DriverProfile() {
  const authUser = useAuthStore((s) => s.user);
  const updateMyUser = useDriverStore((s) => s.updateMyUser);
  const upsertMe = useDriverStore((s) => s.upsertMe);
  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
    nic: authUser?.nic || "",
    licenseNo: authUser?.licenseNo || "",
  });

  useEffect(() => {
    setForm({
      name: authUser?.name || "",
      phone: authUser?.phone || "",
      nic: authUser?.nic || "",
      licenseNo: authUser?.licenseNo || "",
    });
  }, [authUser?.id]);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Update profile (PUT)
  async function onSave(e) {
    e.preventDefault();
    try {
      const updated = await updateMyUser({
        name: form.name || undefined,
        phone: form.phone || undefined,
        nic: form.nic || undefined,
      });
      toast("success", "Profile updated");
      useAuthStore.setState({ user: { ...authUser, ...updated } });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Update failed");
    }
  }

  // Add licenseNo (POST)
  async function onAddLicense(e) {
    e.preventDefault();
    try {
      const added = await upsertMe({
        licenseNo: form.licenseNo,
      });
      toast("success", "License added");
      useAuthStore.setState({ user: { ...authUser, ...added } });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Adding license failed");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Profile</h1>

      {/* Update Personal Details */}
      <Card
        title="Update Personal Details"
        subtitle="NIC & phone are used for verification"
      >
        <form onSubmit={onSave} className="grid md:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="NIC"
            value={form.nic}
            onChange={(e) => set("nic", e.target.value)}
          />
          <div className="md:col-span-2">
            <Button className="w-full">Save</Button>
          </div>
        </form>
      </Card>

      {/* Add License Number */}
      {!authUser?.licenseNo && (
        <Card
          title="Add License Number"
          subtitle="License number is required for verification"
        >
          <form onSubmit={onAddLicense} className="grid md:grid-cols-2 gap-3">
            <Input
              label="License Number"
              value={form.licenseNo}
              onChange={(e) => set("licenseNo", e.target.value)}
            />
            <div className="md:col-span-2">
              <Button className="w-full">Add License</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
