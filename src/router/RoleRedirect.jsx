import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  const map = {
    DRIVER: "/driver",
    OFFICER: "/officer",
    ADMIN: "/admin",
    DISPATCHER: "/dispatcher",
    RESCUE: "/rescue",
  };

  return <Navigate to={map[user.role] || "/login"} replace />;
}
