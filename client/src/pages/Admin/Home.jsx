import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../utils/AuthContext";
import axios from "axios";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import AppointmentDetails from "../../components/Modals/AppointmentDetails";
import MenuDropdown from "../../components/Layout/AdminMenu";
import EditProfile from "../../components/Modals/EditProfile";
import RegisterClinician from "../../components/Modals/RegisterClinician";
import ArchiveUser from "../../components/Modals/ArchiveUser";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faUser,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

// Utils
import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { emailEditInfo } from "../../utils/emailEditInfo";
import formatDate from "../../utils/formatDate";
import SocketFetch from "../../utils/SocketFetch";
import { emailAccountArchive } from "../../utils/emailAccountArchive";

const appURL = import.meta.env.VITE_APP_URL;

export default function Home() {
  const [patients, setPatients] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("patients");

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("All");

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
    fetchAdminData();
    fetchAppointments();
    fetchClinicians();
    fetchPatients();
    fetchNotifications();

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("ok ws");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchAppointments();
        fetchNotifications();
        console.log("Notifcation");
      }

      if (message.type === "fetch-action") {
        fetchClinicians();
        fetchPatients();
      }
    };

    socket.current.onclose = () => {
      console.log("dc ws");
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
        show_to: parsed.id,
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
    }
  };

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
    } catch (error) {
      setError(error.message);
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

  const renderAppointments = (status, textClass) => {
    if (
      appointments.filter((appointment) => appointment.status === status)
        .length > 0
    ) {
      return appointments
        .filter((appointment) => appointment.status === status)
        .map((appointment, index) => (
          <div
            key={index}
            className="mb-3 border border-top-0 border-start-0 border-end-0"
            style={{ cursor: "pointer" }}
            onClick={() => openModal(appointment._id)}
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <h5 className="mb-0 fw-bold">
                {appointment.status === "Temporarily Rescheduled"
                  ? appointment.temporaryReschedule?.day
                  : appointment.selectedSchedule?.day}
              </h5>
              <div className={`mb-0 ${textClass}`}>{appointment.status}</div>
            </div>
            <p className="mb-0">
              {appointment.status === "Temporarily Rescheduled"
                ? appointment.temporaryReschedule?.startTime
                : appointment.selectedSchedule?.startTime}{" "}
              to{" "}
              {appointment.status === "Temporarily Rescheduled"
                ? appointment.temporaryReschedule?.endTime
                : appointment.selectedSchedule?.endTime}
            </p>
            <p className="mb-3">
              {appointment.patientId.firstName}{" "}
              {appointment.patientId.middleName}{" "}
              {appointment.patientId.lastName} has a session with{" "}
              {appointment.status === "Temporarily Rescheduled"
                ? appointment.temporaryReschedule?.clinicianName
                : `${appointment.selectedClinician?.firstName} ${appointment.selectedClinician?.middleName} ${appointment.selectedClinician?.lastName}`}
            </p>
          </div>
        ));
    }
  };

  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const renderUsers = (users, icon, role) => {
    if (users.length > 0) {
      return users
        .filter((user) => user.status !== "archival" && user.active !== false)
        .map((user) => (
          <div
            key={user._id}
            className="mb-3 border border-top-0 border-start-0 border-end-0"
          >
            <p className="mb-0 fw-bold">
              <span className="me-2">
                <FontAwesomeIcon icon={icon} />
              </span>
              {user.firstName} {user.middleName} {user.lastName}
            </p>
            <p className="mb-0">{user.email}</p>
            <p className="mb-0">{user.diagnosis}</p>
            <p className="mb-0">{user.specialization}</p>
            <p className="mb-0">{user.address}</p>
            <p className="mb-3">{user.mobile}</p>
            <div className="d-flex gap-3">
              <div
                className="mb-3 fw-bold text-button border"
                style={{ cursor: "pointer" }}
                onClick={() => handleModal(user, role)}
              >
                Edit
              </div>
              <div
                className="mb-3 fw-bold text-button border"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleArchive(user);
                  setSelectedUserRole(role);
                  setSelectedUserId(user._id);
                }}
              >
                Archive
              </div>
            </div>
          </div>
        ));
    }
    return <p className="fw-bold text-center mb-0">No users available.</p>;
  };

  const sendEmail = (email) => {
    emailEditInfo(email, `${adminData?.firstName} ${adminData?.lastName}`);
  };

  // Archive/Soft Deletion Modal
  const [isArchive, setArchive] = useState(false);
  const handleArchive = (user) => {
    setUserDetails(user);
    setArchive(!isArchive);
  };

  const archiveFetch = () => {
    fetchClinicians();
    fetchPatients();
    emailAccountArchive(
      userDetails.email,
      selectedUserRole,
      accessToken,
      selectedUserId
    );
  };

  // Collapse
  const [firstCollapse, setFirstCollapse] = useState(false);
  const [secondCollapse, setSecondCollapse] = useState(false);
  const [thirdCollapse, setThirdCollapse] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterUsers = (users) => {
    if (!searchQuery) return users;
    return users.filter((user) =>
      `${user.firstName} ${user.middleName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
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

      {/* Archive User Modal */}
      {isArchive && (
        <>
          <ArchiveUser
            handleModal={handleArchive}
            userDetails={userDetails}
            onFetch={archiveFetch}
          />
        </>
      )}

      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
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

            <div className="row">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3"
                    onClick={() => setFirstCollapse(!firstCollapse)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="mb-0 fw-bold">
                      {firstCollapse ? (
                        <FontAwesomeIcon icon={faCaretUp} />
                      ) : (
                        <FontAwesomeIcon icon={faCaretDown} />
                      )}{" "}
                      Appointments
                    </p>
                    <p className="mb-0">See appointments</p>
                  </div>
                </div>

                {!firstCollapse && (
                  <div className="row p-3">
                    <div
                      className="col bg-white border rounded-4 p-3 overflow-auto"
                      style={{ maxHeight: "75vh" }}
                    >
                      <div className="text-center border border-top-0 border-start-0 border-end-0 pb-3 mb-3 d-flex flex-wrap justify-content-center align-content-center gap-4">
                        <div
                          className="status-pending status-size"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStatus("All")}
                        >
                          <h4 className="mb-0">{appointments.length}</h4>
                          <button className="mb-0 fw-bold text-accepted all-btn">
                            All
                          </button>
                        </div>

                        <div
                          className="status-pending status-size"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStatus("Pending")}
                        >
                          <h4 className="mb-0">{pendingAppointments}</h4>
                          <Tooltip id="pending-btn" />
                          <button
                            data-tooltip-id="pending-btn"
                            data-tooltip-content="Pending, Schedule Change Request, and Temporary Reschedule Request"
                            className="mb-0 fw-bold text-pending"
                          >
                            Pending
                          </button>
                        </div>
                        <div
                          className="status-cancelled status-size"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStatus("Rejected")}
                        >
                          <h4 className="mb-0">{rejectedAppointments}</h4>

                          <button className="mb-0 fw-bold text-cancelled">
                            Rejected
                          </button>
                        </div>
                        <div
                          className="status-accepted status-size"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStatus("Accepted")}
                        >
                          <h4 className="mb-0">
                            {
                              appointments.filter(
                                (appointment) =>
                                  appointment.status === "Accepted" ||
                                  appointment.status ===
                                    "Temporarily Rescheduled"
                              ).length
                            }
                          </h4>
                          <Tooltip id="accepted-btn" />

                          <button
                            data-tooltip-id="accepted-btn"
                            data-tooltip-content="Accepted and Temporarily Rescheduled"
                            className="mb-0 fw-bold text-accepted"
                          >
                            Accepted
                          </button>
                        </div>
                      </div>

                      {error ? (
                        <p>{error}</p>
                      ) : appointments.length > 0 ? (
                        <>
                          {selectedStatus === "All" && (
                            <>
                              {appointments.length > 0 ? (
                                <>
                                  {renderAppointments(
                                    "Pending",
                                    "text-pending"
                                  )}
                                  {renderAppointments(
                                    "Schedule Change Request",
                                    "text-pending"
                                  )}
                                  {renderAppointments(
                                    "Temporary Reschedule Request",
                                    "text-pending"
                                  )}
                                  {renderAppointments(
                                    "Accepted",
                                    "text-accepted"
                                  )}
                                  {renderAppointments(
                                    "Temporarily Rescheduled",
                                    "text-accepted"
                                  )}
                                  {renderAppointments(
                                    "Rejected",
                                    "text-cancelled"
                                  )}
                                  {renderAppointments(
                                    "Completed",
                                    "text-accepted"
                                  )}
                                </>
                              ) : (
                                <p className="fw-bold mb-0">
                                  No appointments to show.
                                </p>
                              )}
                            </>
                          )}
                          {selectedStatus === "Pending" && (
                            <>
                              {appointments.filter(
                                (appointment) =>
                                  appointment.status === "Pending" ||
                                  appointment.status ===
                                    "Schedule Change Request" ||
                                  appointments.status ===
                                    "Temporary Reschedule Request"
                              ).length > 0 ? (
                                <>
                                  {renderAppointments(
                                    "Pending",
                                    "text-pending"
                                  )}
                                  {renderAppointments(
                                    "Schedule Change Request",
                                    "text-pending"
                                  )}
                                  {renderAppointments(
                                    "Temporary Reschedule Request",
                                    "text-pending"
                                  )}
                                </>
                              ) : (
                                <p className="fw-bold text-center mb-0">
                                  No appointments to show.
                                </p>
                              )}
                            </>
                          )}

                          {selectedStatus === "Rejected" &&
                            (appointments.filter(
                              (appointment) => appointment.status === "Rejected"
                            ).length > 0 ? (
                              <>
                                {renderAppointments(
                                  "Rejected",
                                  "text-cancelled"
                                )}
                              </>
                            ) : (
                              <p className="fw-bold text-center mb-0">
                                No appointments to show.
                              </p>
                            ))}

                          {selectedStatus === "Accepted" &&
                            (appointments.filter(
                              (appointment) =>
                                appointment.status === "Accepted" ||
                                appointment.status === "Temporarily Rescheduled"
                            ).length > 0 ? (
                              <>
                                {renderAppointments(
                                  "Accepted",
                                  "text-accepted"
                                )}
                                {renderAppointments(
                                  "Temporarily Rescheduled",
                                  "text-accepted"
                                )}
                              </>
                            ) : (
                              <p className="fw-bold text-center mb-0">
                                No appointments to show.
                              </p>
                            ))}
                        </>
                      ) : (
                        <p className="fw-bold mb-0">
                          No appointments as of now.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3"
                    onClick={() => {
                      setSecondCollapse(!secondCollapse);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="mb-0 fw-bold">
                      {secondCollapse ? (
                        <FontAwesomeIcon icon={faCaretUp} />
                      ) : (
                        <FontAwesomeIcon icon={faCaretDown} />
                      )}{" "}
                      Users
                    </p>
                    <p className="mb-0">
                      View all users registered in the system.
                    </p>
                  </div>
                </div>

                {!secondCollapse && (
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

                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>

                      {selectedUserType === "patients" && patients ? (
                        renderUsers(filterUsers(patients), faUser, "patientslp")
                      ) : selectedUserType === "clinicians" && clinicians ? (
                        renderUsers(
                          filterUsers(clinicians),
                          faUserDoctor,
                          "clinician"
                        )
                      ) : (
                        <h5 className="mb-0 fw-bold text-center">
                          Loading users.
                        </h5>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3"
                    onClick={() => {
                      setThirdCollapse(!thirdCollapse);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="mb-0 fw-bold">
                      {thirdCollapse ? (
                        <FontAwesomeIcon icon={faCaretUp} />
                      ) : (
                        <FontAwesomeIcon icon={faCaretDown} />
                      )}{" "}
                      Notifications
                    </p>
                    <p className="mb-0">
                      Account and system related activities will be shown here.
                    </p>
                  </div>
                </div>

                {!thirdCollapse && (
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
                              <p className="mb-0 fw-bold">
                                {notification.body}
                              </p>
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
