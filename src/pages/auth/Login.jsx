import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useUIStore } from "../../store/ui.store";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const toast = useUIStore((s) => s.toast);
  const setLoading = useUIStore((s) => s.setLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
  await login(email, password);
  toast("success", "Authentication successful");
  navigate("/role");
} catch (err) {
  let msg = "Something went wrong";

  if (err?.response?.status === 401) {
    msg = "Invalid email or password";
  } else if (!err?.response) {
    msg = "Network error. Check your connection";
  }

  toast("error", msg);
} finally {
  setIsSubmitting(false);
  setLoading(false);
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background subtle pattern / overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,#4f46e5_0%,transparent_25%),radial-gradient(circle_at_85%_30%,#7c3aed_0%,transparent_30%)]" />
      </div>

      {/* Floating subtle road-like lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent top-[35%] animate-pulse-slow" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent top-[65%] animate-pulse-slow delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden">
          {/* Header with theme accent */}
          <div className="bg-gradient-to-r from-indigo-600/80 to-purple-700/70 px-8 py-6 text-center relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl" />

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              SLREPSMS
            </h1>
            <p className="text-indigo-200/90 mt-1.5 text-sm md:text-base font-medium">
              Road Crime • Traffic Enforcement • Emergency Response
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Email / Badge ID
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  placeholder="name@slreps.gov.lk"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3.5 px-6 rounded-lg font-semibold text-base
                transition-all duration-300 shadow-lg
                ${
                  isSubmitting
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-600/40"
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2.5">
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
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Authenticating...
                </div>
              ) : (
                "Secure Login"
              )}
            </button>

            <div className="text-center text-sm text-slate-400">
              New Driver / Create Account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Create account
              </Link>
            </div>

            {/* Optional: Forgot password link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-slate-400 hover:text-slate-300 text-xs transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>

        {/* Subtle footer note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          SLREPSMS • Secure Access Only • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
