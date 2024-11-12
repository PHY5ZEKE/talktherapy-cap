import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Context
import { AuthProvider } from "./utils/AuthContext";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tooltip/dist/react-tooltip.css";

// CSS
import "./styles/text.css";
import "./styles/containers.css";
import "./styles/images.css";
import "react-toastify/dist/ReactToastify.css";

// System
import Login from "./pages/Login/Login";
import RegisterAdmin from "./pages/Register/AdminRegister";
import RegisterClinician from "./pages/Register/ClinicianRegister";
import RegisterPatientSlp from "./pages/Register/PatientRegister";
import ForgotPassword from "./pages/Forgot-Password/ForgotPassword";

// Super Admin TalkTherapy
import SuperAdminHome from "./pages/SuperAdmin/Home";
import SuperAdminProfile from "./pages/SuperAdmin/Profile";
import SuperAdminArchival from "./pages/SuperAdmin/Archival";
import SuperAdminAudit from "./pages/SuperAdmin/AuditLogs";

// Admin TalkTherapy
import AdminHome from "./pages/Admin/Home";
import AdminContent from "./pages/Admin/ManageContent";
import AdminSchedule from "./pages/Admin/ManageSchedule";
import AdminArchival from "./pages/Admin/Archival";
import AdminProfile from "./pages/Admin/Profile";
import AdminPatients from "./pages/Admin/SearchPatients";

// Clinician TalkTherapy
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
import ExerciseContent from "./pages/Exercises/ExerciseContent";

//Auth
import PrivateRoute from "./pages/Authorization/PrivateRoute";
import PublicRoute from "./pages/Authorization/PublicRoute";

// Teleconference
import Room from "./pages/System/Room";

//Test Exercises
import ExerciseStart from "./pages/Exercises/Exercises";
import AssistSpeech from "./pages/Exercises/AssistSpeech";

// Error Handlers
import NotFound from "./pages/System/NotFound";
import UnauthorizedAccess from "./pages/System/UnauthorizedAccess";

const routes = (
  <Router>
    <Routes>
      {/* Error Page for No-Match Paths */}
      <Route path="*" element={<NotFound />} />

      {/* Unauthorized Access Page */}
      <Route path="/unauthorized" element={<UnauthorizedAccess />} />

      {/* Auth */}
      <Route path="/register/admin" element={<RegisterAdmin />} />
      <Route path="/register/clinician" element={<RegisterClinician />} />
      <Route path="/register/patientslp" element={<RegisterPatientSlp />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Teleconference */}
      <Route
        path="/room/:roomid"
        element={
          <PrivateRoute allowedRoles={["patientslp", "clinician"]}>
            <Room />
          </PrivateRoute>
        }
      />

      {/* Exercises */}
      <Route path="/exercise" element={<ExerciseStart />} />
      <Route path="/assist/speech" element={<AssistSpeech />} />
      <Route path="/content/exercises/:id" element={<ExerciseContent /> }/>

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
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminHome />
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
        path="/admin/patients"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminPatients />
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
      {/* <Route
        path="/patient/content/exercises/:id"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <ExerciseContent />
          </PrivateRoute>
        }
      /> */}

    </Routes>
  </Router>
);

const App = () => {
  return (
    <AuthProvider>
      <div className="vw-100">
        {routes}
        <ToastContainer />
      </div>
    </AuthProvider>
  );
};

export default App;
