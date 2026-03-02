import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useUIStore } from "../../store/ui.store";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function Login() {
  const nav = useNavigate();
  const login = useAuthStore((s) => s.login);
  const toast = useUIStore((s) => s.toast);
  const setLoading = useUIStore((s) => s.setLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btn, setBtn] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBtn(true);
    setLoading(true);
    try {
      await login(email, password);
      toast("success", "Login successful");
      nav("/role");
    } catch (e) {
      toast("error", e?.response?.data?.message || "Login failed");
    } finally {
      setBtn(false);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border rounded-2xl p-6"
      >
        <h1 className="text-xl font-semibold">SLREPSMS Login</h1>
        <p className="text-sm text-gray-600 mt-1">Access your portal</p>

        <div className="mt-4 space-y-3">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button loading={btn} className="w-full">
            Login
          </Button>

          <div className="text-sm text-gray-600">
            Rescue team new?{" "}
            <Link className="underline" to="/rescue/register">
              Register
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
