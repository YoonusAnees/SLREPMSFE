// src/pages/auth/Register.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";

const ROLES = [
  { value: "DRIVER", label: "Driver" },
  //   { value: "OFFICER", label: "Officer" },
  //   { value: "DISPATCHER", label: "Dispatcher" },
  //   { value: "ADMIN", label: "Admin" },
  // If you also want to create RESCUE users here, uncomment:
  // { value: "RESCUE", label: "Rescue" },
];

export default function Register() {
  const nav = useNavigate();
  const toast = useUIStore((s) => s.toast);

  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DRIVER",
    phone: "",
    nic: "",
  });

  const canGoDashboard = useMemo(() => !!accessToken, [accessToken]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);

      const name = form.name.trim();
      const email = form.email.trim();
      const password = form.password;
      const role = form.role;

      if (!name) return toast("error", "Name is required");
      if (!email) return toast("error", "Email is required");
      if (!password || password.length < 8)
        return toast("error", "Password must be at least 8 characters");

      // Optional: basic checks
      if (form.nic && form.nic.trim().length < 5) {
        return toast("error", "NIC looks too short");
      }

      await (
        await import("../../api/http")
      ).http.post("/auth/register", {
        name,
        email,
        role,
        password,
        phone: form.phone.trim() || undefined,
        nic: form.nic.trim() || undefined,
      });

      toast("success", "User registered");

      // If you are already logged in, refresh "me" and go back
      if (canGoDashboard) {
        try {
          await hydrateMe();
        } catch {}
        nav(-1);
        return;
      }

      // Otherwise go to login page
      nav("/login");
    } catch (err) {
      toast(
        "error",
        err?.response?.data?.message || err?.message || "Register failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div>
        <h1 className="text-xl font-semibold">Register User</h1>
        <p className="text-sm text-gray-600"></p>
      </div>

      <Card title="User Details" subtitle="Fill the details and register">
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g., Shahl Farook"
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="name@email.com"
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Min 8 characters"
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500"></div>
          </div>

          <Input
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+94..."
          />

          <Input
            label="NIC (optional)"
            value={form.nic}
            onChange={(e) => setField("nic", e.target.value)}
            placeholder="e.g., 200012345678 / 123456789V"
          />

          <div className="md:col-span-2 flex gap-2 justify-end pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border"
              onClick={() => nav(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
