import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute";
import ToastHost from "./components/ToastHost";
import LoadingOverlay from "./components/LoadingOverlay";
import { ErrorBoundary } from "./components/ErrorBoundary";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleRedirect from "./router/RoleRedirect";

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
import OfficerIncidentCreate from "./pages/officer/OfficerIncidentCreate";
import IncidentReviewPage from "./pages/officer/IncidentReviewPage";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPenalties from "./pages/admin/AdminPenalties";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminIncidents from "./pages/admin/AdminIncidents";

// Dispatcher
import DispatcherLayout from "./pages/dispatcher/DispatcherLayout";
import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard";
import DispatcherIncidents from "./pages/dispatcher/DispatcherIncidents";

// Rescue
import RescueDashboard from "./pages/rescue/RescueDashboard";
import RescueDispatches from "./pages/rescue/RescueDispatches";
import RescueLayout from "./pages/rescue/RescueLayout";
import RescueProfile from "./pages/rescue/RescueProfile";
import RescueRegister from "./pages/rescue/RescueRegister";

import PublicLayout from "./pages/public/PublicLayout";
import HomePage from "./pages/public/HomePage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";
import PublicIncidentReportPage from "./pages/public/PublicIncidentReportPage";
import StatisticsPage from "./pages/public/StatisticsPage";
import RoadSafetyPage from "./pages/public/RoadSafetyPage";
import EmergencyInfoPage from "./pages/public/EmergencyInfoPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastHost />
        <LoadingOverlay />

        <Routes>
          {/* PUBLIC LAYOUT */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route
              path="/report-incident"
              element={<PublicIncidentReportPage />}
            />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/road-safety" element={<RoadSafetyPage />} />
            <Route path="/emergency" element={<EmergencyInfoPage />} />

            {/* auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role" element={<RoleRedirect />} />
          </Route>

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
            <Route path="incidents" element={<OfficerIncidentCreate />} />
            <Route path="incident-review" element={<IncidentReviewPage />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="penalties" element={<AdminPenalties />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="incidents" element={<AdminIncidents />} />
            <Route path="register" element={<RescueRegister />} />
          </Route>

          {/* Dispatcher */}
          <Route
            path="/dispatcher"
            element={
              <ProtectedRoute roles={["DISPATCHER"]}>
                <DispatcherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DispatcherDashboard />} />
            <Route path="incidents" element={<DispatcherIncidents />} />
          </Route>

          {/* Rescue */}
          <Route
            path="/rescue"
            element={
              <ProtectedRoute roles={["RESCUE"]}>
                <RescueLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RescueDashboard />} />
            <Route path="dispatches" element={<RescueDispatches />} />
            <Route path="profile" element={<RescueProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
