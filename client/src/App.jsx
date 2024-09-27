import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSuperAdmin from "./pages/Login/LoginSuperAdmin";
import RegisterAdmin from "./pages/Register/RegisterAdmin";
import RegisterClinician from "./pages/Register/RegisterClinician";
import RegisterPatientSlp from "./pages/Register/RegisterPatientSlp";
import ForgotPassword from "./pages/Forgot-Password/ForgotPassword";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Super Admin TalkTherapy
import SuperAdminHome from "./pages/SuperAdmin/Home";
import SuperAdminProfile from "./pages/SuperAdmin/Profile";
import SuperAdminRegister from "./pages/SuperAdmin/RegisterAdmin";
import SuperAdminManage from "./pages/SuperAdmin/ManageAdmin";
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

const routes = (
  <Router>
    <Routes>
      <Route path="/registerAdmin" element={<RegisterAdmin />} />
      <Route path="/registerClinician" element={<RegisterClinician />} />
      <Route path="/registerPatientSlp" element={<RegisterPatientSlp />} />

      <Route path="/forgotPassword" element={<ForgotPassword />} />

      <Route path="/login" element={<LoginSuperAdmin />} />
      {/* Super Admin */}
      <Route
        path="/superAdminHome"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/superAdminProfile"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/superAdminRegister"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminRegister />
          </PrivateRoute>
        }
      />
      <Route
        path="/superAdminManage"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminManage />
          </PrivateRoute>
        }
      />
      <Route
        path="/superAdminArchival"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminArchival />
          </PrivateRoute>
        }
      />
      <Route
        path="/superAdminAudit"
        element={
          <PrivateRoute allowedRoles={["superAdmin"]}>
            <SuperAdminAudit />
          </PrivateRoute>
        }
      />
      {/*Admin */}
      <Route
        path="/clinicianRegister"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ClinicianRegister />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminHome"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminUsers"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminContent"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminSchedule"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminSchedule />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminArchival"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminArchival />
          </PrivateRoute>
        }
      />
      <Route
        path="/adminProfile"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </PrivateRoute>
        }
      />
      {/*Clinician */}

      <Route
        path="/clinicianHome"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinicianPatients"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianPatient />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinicianContent"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinicianProfile"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/clinicianSchedule"
        element={
          <PrivateRoute allowedRoles={["clinician"]}>
            <ClinicianSchedule />
          </PrivateRoute>
        }
      />
      {/*Patient */}
      <Route
        path="/patientHome"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/patientContent"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientContent />
          </PrivateRoute>
        }
      />
      <Route
        path="/patientBook"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientBook />
          </PrivateRoute>
        }
      />
      <Route
        path="/patientProfile"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/patientFeedbacks"
        element={
          <PrivateRoute allowedRoles={["patientslp"]}>
            <PatientFeedback />
          </PrivateRoute>
        }
      />
      <Route
        path="/patientPerform"
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
