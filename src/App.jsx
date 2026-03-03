import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute";
import ToastHost from "./components/ToastHost";
import LoadingOverlay from "./components/LoadingOverlay";
import Login from "./pages/auth/Login";
import RoleRedirect from "./router/RoleRedirect";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Driver
import DriverLayout from "./pages/driver/DriverLayout";
import DriverHome from "./pages/driver/DriverHome";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverPenalties from "./pages/driver/DriverPenalties";
import DriverVehicles from "./pages/driver/DriverVehicles";
import DriverIncidents from "./pages/driver/DriverIncidents";
import DriverPayment from "./pages/driver/DriverPayment";

// Officer
import OfficerLayout from "./pages/officer/OfficerLayout";
import OfficerHome from "./pages/officer/OfficerHome";
import OfficerIssuePenalty from "./pages/officer/OfficerIssuePenalty";
import OfficerVerifyVehicle from "./pages/officer/OfficerVerifyVehicle";
import OfficerViolationTypes from "./pages/officer/OfficerViolationTypes";

// Admin
// import AdminLayout from "../pages/admin/AdminLayout";
// import AdminHome from "../pages/admin/AdminHome";
// import AdminUsers from "../pages/admin/AdminUsers";

// Dispatcher
// import DispatcherLayout from "../pages/dispatcher/DispatcherLayout";
// import DispatchCenter from "../pages/dispatcher/DispatchCenter";

// Rescue
// import RescueLayout from "../pages/rescue/RescueLayout";
// import RescueRegister from "../pages/rescue/RescueRegister";
// import RescueMe from "../pages/rescue/RescueMe";
// import RescueDispatches from "../pages/rescue/RescueDispatches";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastHost />
        <LoadingOverlay />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/role" element={<RoleRedirect />} />

          {/* Rescue register public */}
          {/* <Route path="/rescue/register" element={<RescueRegister />} /> */}

          {/* Driver */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={["DRIVER"]}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverHome />} />
            <Route path="profile" element={<DriverProfile />} />
            <Route path="vehicles" element={<DriverVehicles />} />
            <Route path="penalties" element={<DriverPenalties />} />
            <Route path="payments" element={<DriverPayment />} />
            <Route path="incidents" element={<DriverIncidents />} />
          </Route>

          {/* Officer */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute roles={["OFFICER"]}>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OfficerHome />} />
            <Route path="issue-penalty" element={<OfficerIssuePenalty />} />
            <Route path="verify-vehicle" element={<OfficerVerifyVehicle />} />
            <Route path="violation-types" element={<OfficerViolationTypes />} />
          </Route>

          {/* Admin */}
          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
          </Route> */}

          {/* Dispatcher */}
          {/* <Route
            path="/dispatcher"
            element={
              <ProtectedRoute roles={["DISPATCHER"]}>
                <DispatcherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DispatchCenter />} />
          </Route> */}

          {/* Rescue */}
          {/* <Route
            path="/rescue"
            element={
              <ProtectedRoute roles={["RESCUE"]}>
                <RescueLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RescueMe />} />
            <Route path="dispatches" element={<RescueDispatches />} />
          </Route> */}

          <Route path="/" element={<Navigate to="/role" replace />} />
          <Route path="*" element={<Navigate to="/role" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
