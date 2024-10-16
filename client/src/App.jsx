import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// CSS
import './styles/text.css'
import './styles/button.css'
import './styles/containers.css'
import './styles/images.css'

// System
import Login from "./pages/Login/Login";
import RegisterAdmin from "./pages/Register/RegisterAdmin";
import RegisterClinician from "./pages/Register/RegisterClinician";
import RegisterPatientSlp from "./pages/Register/RegisterPatientSlp";
import ForgotPassword from "./pages/Forgot-Password/ForgotPassword";

// Super Admin TalkTherapy
import SuperAdminHome from "./pages/SuperAdmin/Home";
import SuperAdminProfile from "./pages/SuperAdmin/Profile";
import SuperAdminArchival from "./pages/SuperAdmin/Archival";
import SuperAdminAudit from "./pages/SuperAdmin/AuditLogs";

// Admin TalkTherapy
import AdminHome from "./pages/Admin/Home";
import AdminUsers from "./pages/Admin/ManageUsers";
import AdminContent from "./pages/Admin/ManageContent";
import AdminSchedule from "./pages/Admin/ManageSchedule";
import AdminArchival from "./pages/Admin/Archival";
import AdminProfile from "./pages/Admin/Profile";

// Clinician TalkTherapy
import ClinicianRegister from "./pages/Admin/RegisterClinician";
import ClinicianHome from "./pages/Clinician/Home";
import ClinicianPatient from "./pages/Clinician/SearchPatients";
import ClinicianContent from "./pages/Clinician/ViewContent";
import ClinicianProfile from "./pages/Clinician/Profile";
import ClinicianSchedule from "./pages/Clinician/ManageSchedule";

// Patient TalkTherapy
import PatientHome from "./pages/Patient/Home";
import PatientContent from "./pages/Patient/ViewContent";
import PatientBook from "./pages/Patient/BookSchedule";
import PatientProfile from "./pages/Patient/Profile";
import PatientFeedback from "./pages/Patient/FeedbackDiagnosis";
import PatientPerform from "./pages/Patient/Perform";

//Auth
import PrivateRoute from "./pages/Authorization/PrivateRoute";
import PublicRoute from "./pages/Authorization/PublicRoute";

// Teleconference
import Room from "./pages/System/Room";

// Error Handlers
import NotFound from "./pages/System/NotFound";
import UnauthorizedAccess from "./pages/System/UnauthorizedAccess";

// Test Layout
import Layout from "./pages/Patient/Home";
import Home2 from './pages/Patient/Home'

const routes = (
  <Router>
    <Routes>
      {/* Error Page for No-Match Paths */}
      <Route path="*" element={<NotFound />} />

      <Route path="/layout" element={<Layout />} />
      <Route path="/home2" element={<Home2 />} />

      {/* Unauthorized Access Page */}
      <Route path="/unauthorized" element={<UnauthorizedAccess />} />

      {/* Auth */}
      <Route path="/register/admin" element={<RegisterAdmin />} />
      <Route path="/register/clinician" element={<RegisterClinician />} />
      <Route path="/register/patientslp" element={<RegisterPatientSlp />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Teleconference */}
      <Route
        path="/room/:appid/:roomid"
        element={
          <PrivateRoute allowedRoles={["patientslp", "clinician"]}>
            <Room />
          </PrivateRoute>
        }
      />

      {/* TO DO: Create a page for landing instead of login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/sudo"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/sudo/profile"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/sudo/archival"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminArchival />
          </PrivateRoute>
        }
      />
      <Route
        path="/sudo/audit"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminAudit />
          </PrivateRoute>
        }
      />

      {/*Admin */}
      <Route
        path="/admin/register"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ClinicianRegister />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminSchedule />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/archival"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminArchival />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </PrivateRoute>
        }
      />
      {/*Clinician */}

      <Route
        path="/clinician"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinician/patients"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianPatient />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinician/content"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinician/profile"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinician/schedule"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianSchedule />
          </PrivateRoute>
        }
      />
      {/*Patient */}
      <Route
        path="/patient"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/content"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/book"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientBook />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/feedback"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientFeedback />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/perform"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientPerform />
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

const App = () => {
  return <div>{routes}</div>;
};

export default App;
