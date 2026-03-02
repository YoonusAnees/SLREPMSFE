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
  const toast = useUIStore((s) => s.toast);

  const [form, setForm] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
    nic: authUser?.nic || "",
  });

  useEffect(() => {
    setForm({
      name: authUser?.name || "",
      phone: authUser?.phone || "",
      nic: authUser?.nic || "",
    });
  }, [authUser?.id]);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSave(e) {
    e.preventDefault();
    try {
      const updated = await updateMyUser({
        name: form.name || undefined,
        phone: form.phone || undefined,
        nic: form.nic || undefined,
      });
      toast("success", "Profile updated");
      // optional: update auth store user
      useAuthStore.setState({ user: { ...authUser, ...updated } });
    } catch (e) {
      toast("error", e?.response?.data?.message || "Update failed");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Profile</h1>

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
    </div>
  );
}
