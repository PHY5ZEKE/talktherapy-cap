import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy } from "react";

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
const Landing = lazy(() => import("./pages/System/Landing"));
const Login = lazy(() => import("./pages/System/Login"));
const RegisterAdmin = lazy(() => import("./pages/Register/AdminRegister"));
const RegisterClinician = lazy(() =>
  import("./pages/Register/ClinicianRegister")
);
const RegisterPatientSlp = lazy(() =>
  import("./pages/Register/PatientRegister")
);
const ForgotPassword = lazy(() => import("./pages/System/ForgotPassword"));

// Super Admin TalkTherapy
const SuperAdminHome = lazy(() => import("./pages/SuperAdmin/Home"));
const SuperAdminProfile = lazy(() => import("./pages/SuperAdmin/Profile"));
const SuperAdminArchival = lazy(() => import("./pages/SuperAdmin/Archival"));
const SuperAdminAudit = lazy(() => import("./pages/SuperAdmin/AuditLogs"));

// Admin TalkTherapy
const AdminHome = lazy(() => import("./pages/Admin/Home"));
const AdminContent = lazy(() => import("./pages/Admin/ManageContent"));
const AdminSchedule = lazy(() => import("./pages/Admin/ManageSchedule"));
const AdminArchival = lazy(() => import("./pages/Admin/Archival"));
const AdminProfile = lazy(() => import("./pages/Admin/Profile"));
const AdminPatients = lazy(() => import("./pages/Admin/SearchPatients"));

// Clinician TalkTherapy
const ClinicianHome = lazy(() => import("./pages/Clinician/Home"));
const ClinicianPatient = lazy(() => import("./pages/Clinician/SearchPatients"));
const ClinicianContent = lazy(() => import("./pages/Clinician/ViewContent"));
const ClinicianProfile = lazy(() => import("./pages/Clinician/Profile"));
const ClinicianSchedule = lazy(() =>
  import("./pages/Clinician/ManageSchedule")
);

// Patient TalkTherapy
const PatientHome = lazy(() => import("./pages/Patient/Home"));
const PatientContent = lazy(() => import("./pages/Patient/ViewContent"));
const PatientBook = lazy(() => import("./pages/Patient/BookSchedule"));
const PatientProfile = lazy(() => import("./pages/Patient/Profile"));
const PatientFeedback = lazy(() => import("./pages/Patient/FeedbackDiagnosis"));

//Auth
import PrivateRoute from "./pages/Authorization/PrivateRoute";
import PublicRoute from "./pages/Authorization/PublicRoute";

// Teleconference
const Room = lazy(() => import("./pages/System/Room"));

//Test Exercises
const WordStart = lazy(() => import("./pages/Exercises/WordStart"));
const AssistSpeech = lazy(() => import("./pages/Exercises/AssistSpeech"));
const ExerciseContent = lazy(() => import("./pages/Exercises/ExerciseContent"));
const ExerRun = lazy(() => import("./pages/Exercises/ExerRun"));
const ExerSpeech = lazy(() => import("./pages/Exercises/ExerSpeech"));
const ExerFace = lazy(() => import("./pages/Exercises/ExerFace"));
const AssistFace = lazy(() => import("./pages/Exercises/AssistFace"));

// Error Handlers
const NotFound = lazy(() => import("./pages/System/NotFound"));
const UnauthorizedAccess = lazy(() =>
  import("./pages/System/UnauthorizedAccess")
);

// Loader
import Loader from "./pages/System/Loader";

// Testing Pages

const routes = (
  <Router>
    <Suspense fallback={<Loader />}>
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
        <Route path="/exercise" element={<WordStart />} />
        <Route path="/assist/speech" element={<AssistSpeech />} />
        <Route path="/content/exercises/:id" element={<ExerciseContent />} />
        <Route path="/content/exercises/speech" element={<ExerRun />} />
        <Route path="/content/exercises/assistspeech" element={<ExerSpeech />} />
        <Route path="/content/exercises/facespeech" element={<ExerFace />} />
        <Route path="/assist/face" element={<AssistFace/>} />

        {/* TO DO: Create a page for landing instead of login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
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
      </Routes>
    </Suspense>
  </Router>
);

const App = () => {
  return (
    <AuthProvider>
      {routes}
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
