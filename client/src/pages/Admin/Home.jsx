import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../utils/AuthContext";
import axios from "axios";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import AppointmentDetails from "../../components/Modals/AppointmentDetails";
import MenuDropdown from "../../components/Layout/AdminMenu";
import EditProfile from "../../components/Modals/EditProfile";
import RegisterClinician from "../../components/Modals/RegisterClinician";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserDoctor, faUser } from "@fortawesome/free-solid-svg-icons";

// Utils
import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { emailEditInfo } from "../../utils/emailEditInfo";
import formatDate from "../../utils/formatDate";
import SocketFetch from "../../utils/SocketFetch";
import { emailAccountStatus } from "../../utils/emailAccountStatus";

const appURL = import.meta.env.VITE_APP_URL;

export default function Home() {
  const [patients, setPatients] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("patients");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { authState } = useContext(AuthContext);

  const accessToken = authState.accessToken;

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  // Handle Edit Profile Modal
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [editProfileAPI, setEditProfileAPI] = useState("");

  const handleModal = (user, role) => {
    setIsOpen(!isOpen);
    setUserDetails(user);
    setRole(role);
    if (role === "patientslp") {
      setEditProfileAPI(route.admin.editPatient);
    } else {
      setEditProfileAPI(route.admin.editClinician);
    }
  };

  // Handle Appointment Details Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const closeModal = () => setIsConfirm(false);

  const openModal = async (appointmentId) => {
    try {
      const response = await axios.get(
        `${appURL}/${route.appointment.getById}/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSelectedAppointment(response.data);
      setIsConfirm(true);
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  // Handle Add Clinician Modal
  const [isAddClinician, setIsAddClinician] = useState(false);
  const closeAddClinician = () => setIsAddClinician(!isAddClinician);

  // WebSocket Notification
  const socket = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch Admin Data
    fetchAdminData();

    // Fetch Appointments
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${appURL}/${route.appointment.getAll}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        setError(error.message);
        console.log("Error fetch appointments :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    fetchClinicians();
    fetchPatients();

    // Get Notifications from MongoDB
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${appURL}/${route.notification.get}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notif");
        }
        const data = await response.json();

        setNotifications(data.decryptedNotifications);
      } catch (error) {
        console.error("Error fetch notif", error);
      }
    };

    fetchNotifications();

    socket.current = new WebSocket(`ws://${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchAppointments();
        fetchNotifications();
      }

      if (message.type === "fetch-action") {
        fetchClinicians();
        fetchPatients();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const webSocketNotification = async (message) => {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};

    if (parsed.notif === "higherAccountEdit") {
      notification = {
        body: `${adminData?.firstName} ${adminData.lastName} edited ${parsed.user}'s profile information`,
        date: new Date(),
        show_to: role !== "admin" ? "superadmin" : "admin",
      };
    }

    if (parsed.notif === "appointmentRequestStatus") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    if (parsed.notif === "registerClinician") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    try {
      const response = await fetch(`${appURL}/${route.notification.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      const result = await response.json();

      // Notify WebSocket server
      const resultWithNotif = { ...result, type: "notification" };

      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const webSocketFetch = async () => {
    SocketFetch(socket);
    sendEmail(userDetails.email);
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();
      setAdminData(data.admin);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchClinicians = async () => {
    try {
      const response = await fetch(
        `${appURL}/${route.admin.getAllClinicians}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setClinicians(data.clinicians);
      } else {
        failNotify(toastMessage.fail.fetch);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.getAllPatients}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (!data.error) {
        setPatients(data.patients);
      } else {
        failNotify(toastMessage.fail.fetch);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const handleUserTypeChange = (type) => {
    setSelectedUserType(type);
  };

  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Pending" ||
      appointment.status === "Temporary Reschedule Request" ||
      appointment.status === "Schedule Change Request"
  ).length;
  const rejectedAppointments = appointments.filter(
    (appointment) => appointment.status === "Rejected"
  ).length;
  const acceptedAppointments = appointments.filter(
    (appointment) => appointment.status === "Accepted"
  ).length;

  // Function to toggle activation status
  const toggleClinicianStatus = async (userData) => {
    if (!userData) return;

    setIsProcessing(true); // Start processing

    try {
      const url = userData.active
        ? `${appURL}/${route.clinician.removeClinician}`
        : `${appURL}/${route.clinician.activateClinician}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: userData.email }), // Automatically pass the selected clinician's email
      });

      const data = await response.json();

      if (!data.error) {
        emailAccountStatus(
          userData.email,
          userData.active ? "deactivated" : "activated"
        );
        notify(toastMessage.success.status);
        // Optionally, update the clinicians list to reflect the change
        setClinicians(
          clinicians.map((clinician) =>
            clinician._id === userData._id
              ? { ...clinician, active: !userData.active }
              : clinician
          )
        );
      } else {
        failNotify(toastMessage.fail.status);
      }
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  const togglePatientStatus = async (userData) => {
    if (!userData) return;

    setIsProcessing(true); // Start processing

    try {
      const url = userData.active
        ? `${appURL}/${route.patient.deactivate}`
        : `${appURL}/${route.patient.activate}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: userData.email }), // Automatically pass the selected patient's email
      });

      const data = await response.json();

      if (!data.error) {
        emailAccountStatus(
          userData.email,
          userData.active ? "deactivated" : "activated"
        );
        notify(toastMessage.success.status);
        // Optionally, update the patients list to reflect the change
        setPatients(
          patients.map((patient) =>
            patient._id === userData._id
              ? { ...patient, active: !userData.active }
              : patient
          )
        );
      } else {
        failNotify(toastMessage.fail.status);
      }
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  const sendEmail = (email) => {
    emailEditInfo(email);
  };

  return (
    <>
      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {isConfirm && (
        <AppointmentDetails
          openModal={closeModal}
          appointment={selectedAppointment}
          onWebSocket={webSocketNotification}
        />
      )}

      {/* EDIT PROFILE MODAL */}
      {isOpen && (
        <EditProfile
          editProfileAPI={editProfileAPI}
          editPictureAPI={""}
          userDetails={userDetails}
          closeModal={handleModal}
          isOwner={false}
          whatRole={role}
          onWebSocket={webSocketNotification}
          onFetch={webSocketFetch}
        />
      )}

      {/* ADD CLINICIAN MODAL */}
      {isAddClinician && (
        <RegisterClinician
          openModal={closeAddClinician}
          admin={adminData}
          onWebSocket={webSocketNotification}
        />
      )}

      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}{" "}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Appointments</p>
                    <p className="mb-0">See appointments</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <h6 className="text-center fw-bold">Total Appointments</h6>

                    <div className="text-center border border-top-0 border-start-0 border-end-0 pb-3 mb-3 d-flex justify-content-center align-content-center gap-4">
                      <div className="status-pending status-size">
                        <h4 className="mb-0">{pendingAppointments}</h4>
                        <p className="mb-0 fw-bold p-2 border rounded-3 text-warning">
                          Pending
                        </p>
                      </div>
                      <div className="status-cancelled status-size">
                        <h4 className="mb-0">{rejectedAppointments}</h4>
                        <p className="mb-0 fw-bold p-2 border rounded-3 text-danger">
                          Rejected
                        </p>
                      </div>
                      <div className="status-accepted status-size">
                        <h4 className="mb-0">{acceptedAppointments}</h4>
                        <p className="mb-0 fw-bold p-2 border rounded-3 text-success">
                          Accepted
                        </p>
                      </div>
                    </div>

                    {error ? (
                      <p>{error}</p>
                    ) : appointments ? (
                      <>
                        {appointments.filter(
                          (appointment) =>
                            appointment.status === "Pending" ||
                            appointment.status === "Schedule Change Request" ||
                            appointment.status ===
                              "Temporary Reschedule Request"
                        ).length > 0 &&
                          appointments
                            .filter(
                              (appointment) =>
                                appointment.status === "Pending" ||
                                appointment.status ===
                                  "Schedule Change Request" ||
                                appointment.status ===
                                  "Temporary Reschedule Request"
                            )
                            .map((appointment, index) => (
                              <div
                                key={index}
                                className="mb-3 border border border-top-0 border-start-0 border-end-0"
                                style={{ cursor: "pointer" }}
                                onClick={() => openModal(appointment._id)}
                              >
                                <div className="d-flex align-items-center gap-3 mb-2">
                                  <h5 className="mb-0 fw-bold">
                                    {appointment.status ===
                                    "Schedule Change Request"
                                      ? appointment.newSchedule?.day
                                      : appointment.status ===
                                        "Temporary Reschedule Request"
                                      ? appointment.temporaryReschedule?.day
                                      : appointment.selectedSchedule?.day}
                                  </h5>

                                  <div className="mb-0 text-pending">
                                    {appointment.status === "Pending"
                                      ? "Pending"
                                      : appointment.status ===
                                        "Schedule Change Request"
                                      ? "Schedule Change Request"
                                      : "Temporary Schedule Request"}
                                  </div>
                                </div>

                                <p className="mb-0">
                                  {appointment.status ===
                                  "Schedule Change Request"
                                    ? `${appointment.newSchedule?.startTime} to ${appointment.newSchedule?.endTime}`
                                    : appointment.status ===
                                      "Temporary Reschedule Request"
                                    ? `${appointment.temporaryReschedule?.startTime} to ${appointment.temporaryReschedule?.endTime}`
                                    : `${appointment.selectedSchedule?.startTime} to ${appointment.selectedSchedule?.endTime}`}
                                </p>
                                <p className="mb-3">
                                  {appointment.status ===
                                  "Schedule Change Request"
                                    ? `${appointment.patientId.firstName} ${appointment.patientId.middleName} ${appointment.patientId.lastName} has requested for a change in her schedule`
                                    : appointment.status ===
                                      "Temporary Reschedule Request"
                                    ? `${appointment.patientId.firstName} ${appointment.patientId.middleName} ${appointment.patientId.lastName} has requested a temporary reschedule`
                                    : `${appointment.patientId.firstName} ${appointment.patientId.middleName} ${appointment.patientId.lastName} has requested a session with ${appointment.selectedSchedule?.clinicianName}`}
                                </p>
                              </div>
                            ))}

                        {appointments.filter(
                          (appointment) =>
                            appointment.status === "Accepted" ||
                            appointment.status === "Temporarily Rescheduled"
                        ).length > 0 &&
                          appointments
                            .filter(
                              (appointment) =>
                                appointment.status === "Accepted" ||
                                appointment.status === "Temporarily Rescheduled"
                            )
                            .map((appointment, index) => (
                              <div
                                key={index}
                                className="mb-3 border border border-top-0 border-start-0 border-end-0"
                                style={{ cursor: "pointer" }}
                                onClick={() => openModal(appointment._id)}
                              >
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <h5 className="mb-0 fw-bold">
                                    {appointment.status ===
                                    "Temporarily Rescheduled"
                                      ? appointment.temporaryReschedule?.day
                                      : appointment.selectedSchedule?.day}
                                  </h5>
                                  <div className="mb-0 text-accepted">
                                    {appointment.status}
                                  </div>
                                </div>

                                <p className="mb-0">
                                  {appointment.status ===
                                  "Temporarily Rescheduled"
                                    ? appointment.temporaryReschedule?.startTime
                                    : appointment.selectedSchedule
                                        ?.startTime}{" "}
                                  to{" "}
                                  {appointment.status ===
                                  "Temporarily Rescheduled"
                                    ? appointment.temporaryReschedule?.endTime
                                    : appointment.selectedSchedule?.endTime}
                                </p>
                                <p className="mb-3">
                                  {appointment.patientId.firstName}{" "}
                                  {appointment.patientId.middleName}{" "}
                                  {appointment.patientId.lastName} has a session
                                  with{" "}
                                  {appointment.status ===
                                  "Temporarily Rescheduled"
                                    ? appointment.temporaryReschedule
                                        ?.clinicianName
                                    : appointment.selectedSchedule
                                        ?.clinicianName}
                                </p>
                              </div>
                            ))}

                        {appointments.filter(
                          (appointment) => appointment.status === "Rejected"
                        ).length > 0 &&
                          appointments
                            .filter(
                              (appointment) => appointment.status === "Rejected"
                            )
                            .map((appointment, index) => (
                              <div
                                key={index}
                                className="mb-3 border border border-top-0 border-start-0 border-end-0"
                                style={{ cursor: "pointer" }}
                                onClick={() => openModal(appointment._id)}
                              >
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <h5 className="mb-0 fw-bold">
                                    {appointment.selectedSchedule.day}
                                  </h5>
                                  <div className="mb-0 text-cancelled">
                                    Rejected
                                  </div>
                                </div>

                                <p className="mb-0">
                                  {appointment.selectedSchedule.startTime} to{" "}
                                  {appointment.selectedSchedule.endTime}
                                </p>
                                <p className="mb-3">
                                  {appointment.patientId.firstName}{" "}
                                  {appointment.patientId.middleName}{" "}
                                  {appointment.patientId.lastName} session
                                  request with{" "}
                                  {appointment.selectedSchedule.clinicianName}{" "}
                                  was rejected
                                </p>
                              </div>
                            ))}

                        {appointments.filter(
                          (appointment) => appointment.status === "Completed"
                        ).length > 0 &&
                          appointments
                            .filter(
                              (appointment) =>
                                appointment.status === "Completed"
                            )
                            .map((appointment, index) => (
                              <div
                                key={index}
                                className="mb-3 border border border-top-0 border-start-0 border-end-0"
                                style={{ cursor: "pointer" }}
                                onClick={() => openModal(appointment._id)}
                              >
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <h5 className="mb-0 fw-bold">
                                    {appointment.selectedSchedule?.day}
                                  </h5>
                                  <div className="mb-3 text-accepted">
                                    {appointment.status}
                                  </div>
                                </div>

                                <p className="mb-0">
                                  {appointment.selectedSchedule?.startTime} to{" "}
                                  {appointment.selectedSchedule?.endTime}
                                </p>
                                <p className="mb-0">
                                  {appointment.patientId.firstName}{" "}
                                  {appointment.patientId.middleName}{" "}
                                  {appointment.patientId.lastName} has requested
                                  a session with{" "}
                                  {appointment.selectedSchedule?.clinicianName}
                                </p>
                              </div>
                            ))}
                      </>
                    ) : (
                      <p>Fetching data.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Users</p>
                    <p className="mb-0">
                      View all users registered in the system.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="d-flex justify-content-center gap-3 border border-top-0 border-start-0 border-end-0 mb-3 pb-3">
                      <button
                        className={`text-button border ${
                          selectedUserType === "patients" ? "active" : ""
                        }`}
                        onClick={() => handleUserTypeChange("patients")}
                      >
                        Patients
                      </button>
                      <button
                        className={`text-button border ${
                          selectedUserType === "clinicians" ? "active" : ""
                        }`}
                        onClick={() => handleUserTypeChange("clinicians")}
                      >
                        Clinicians
                      </button>

                      {selectedUserType === "clinicians" && (
                        <button
                          onClick={closeAddClinician}
                          className="text-button border"
                        >
                          Add Clinician
                        </button>
                      )}
                    </div>

                    {selectedUserType === "patients" && patients ? (
                      patients.map((patient) => (
                        <div
                          key={patient._id}
                          className="mb-3 border border-top-0 border-start-0 border-end-0"
                        >
                          <p className="mb-0 fw-bold">
                            <span className="me-2">
                              <FontAwesomeIcon icon={faUser} />
                            </span>
                            {patient.firstName} {patient.middleName}{" "}
                            {patient.lastName}
                          </p>
                          <p className="mb-0">{patient.email}</p>
                          <p className="mb-0">{patient.address}</p>
                          <p className="mb-3">{patient.mobile}</p>

                          <div className="d-flex gap-3">
                            <div
                              className="mb-3 fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleModal(patient, "patientslp")}
                            >
                              Edit
                            </div>
                            <div
                              className="mb-3 fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                            >
                              Delete
                            </div>
                            <div
                              className="mb-3 fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                              onClick={() => togglePatientStatus(patient)}
                              disabled={isProcessing}
                            >
                              {patient.active ? "Deactivate" : "Activate"}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : selectedUserType === "clinicians" && clinicians ? (
                      <>
                        {clinicians.map((clinician) => (
                          <div
                            key={clinician._id}
                            className="mb-3 border border-top-0 border-start-0 border-end-0"
                          >
                            <p className="mb-0 fw-bold">
                              <span className="me-2">
                                <FontAwesomeIcon icon={faUserDoctor} />
                              </span>
                              {clinician.firstName} {clinician.middleName}{" "}
                              {clinician.lastName}
                            </p>
                            <p className="mb-0">{clinician.specialization}</p>
                            <p className="mb-0">{clinician.email}</p>
                            <p className="mb-0">{clinician.address}</p>
                            <p className="mb-3">{clinician.mobile}</p>

                            <div className="d-flex gap-3">
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleModal(clinician, "clinician")
                                }
                              >
                                Edit
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                              >
                                Delete
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleClinicianStatus(clinician)}
                                disabled={isProcessing}
                              >
                                {clinician.active ? "Deactivate" : "Activate"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        Loading users.
                      </h5>
                    )}
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Notifications</p>
                    <p className="mb-0">
                      Account and system related activities will be shown here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {notifications.length > 0 ? (
                      notifications
                        .filter(
                          (notif) =>
                            notif.show_to.includes(adminData?._id) ||
                            notif.show_to.includes("admin")
                        )
                        .map((notification) => (
                          <div
                            key={notification._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <p className="mb-0 fw-bold">{notification.body}</p>
                            {notification.reason && (
                              <p className="mb-0">
                                {`Reason: ${notification.reason}`}
                              </p>
                            )}
                            <p className="mb-0">
                              {formatDate(notification.date)}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p className="fw-bold text-center mb-0">
                        No notifications available
                      </p>
                    )}
                    {/* <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <p className="mb-0 fw-bold">Date and Time</p>
                      <p className="mb-3">System activity.</p>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
