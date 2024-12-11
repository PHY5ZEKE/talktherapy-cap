import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import formatDate from "../../utils/formatDate";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

// Modal
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";
import AppointmentDetailsClinician from "../../components/Modals/AppointmentDetailsClinician";

// React
import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

const appURL = import.meta.env.VITE_APP_URL;

export default function Home() {
  const { authState, setUserId } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [appointments, setAppointments] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();

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

  // Handle Confirm Reschedule Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const closeConfirmModal = () => {
    setIsConfirm(false);
  };

  // Handle Choose Schedule Modal
  const [isChoose, setIsChoose] = useState(false);
  const openChooseScheduleModal = () => {
    setIsChoose(true);
  };
  const closeChooseScheduleModal = () => {
    setIsChoose(false);
  };

  // Handle Appointment Details Modal
  const [isViewAppointment, setIsViewAppointment] = useState(false);
  const closeViewAppointmentModal = () => {
    setIsViewAppointment(false);
    setSelectedAppointment(null);
  };

  // Modal Information
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
      setIsViewAppointment(true);
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const joinMeeting = (id, details) => {
    navigate(`/room/${id}`, {
      state: {
        appointmentDetails: details,
      },
    });
  };

  // WebSocket Notification
  const socket = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchClinicianData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clinician data");
        }

        const data = await response.json();
        setClinicianData(data.clinician);
        setUserId(data.clinician._id);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClinicianData();

    // Fetch Clinician Data
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.appointment.getByClinician}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        failNotify(toastMessage.fail.error);
      }
    };

    fetchAppointments();

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

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("ok ws");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchAppointments();
        fetchNotifications();
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

    if (parsed.notif === "appointmentRequestStatus") {
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
      const resultWithNotif = { ...result, type: "notification" };

      // Notify WebSocket server
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Collapsible Icons
  const [firstCollapse, setFirstCollapse] = useState(false);
  const [secondCollapse, setSecondCollapse] = useState(false);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="d-flex align-items-center justify-content-center vh-100">
  //       <div className="alert alert-danger" role="alert">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* CONFIRM RESCHEDULE MODAL */}
      {isConfirm && (
        <ConfirmReschedule
          onClick={closeConfirmModal}
          closeModal={closeConfirmModal}
          openResched={openChooseScheduleModal}
        />
      )}

      {/* CHOOSE NEW SCHEDULE MODAL */}
      {isChoose && <ChooseSchedule closeModal={closeChooseScheduleModal} />}

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {isViewAppointment && (
        <AppointmentDetailsClinician
          openModal={closeViewAppointmentModal}
          appointment={selectedAppointment}
          onWebSocket={webSocketNotification}
        />
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
                ) : clinicianData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {clinicianData?.firstName} {clinicianData?.lastName}
                    </p>
                    <button
                      role="button"
                      className="dropdown-item"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasWithBothOptions"
                      aria-controls="offcanvasWithBothOptions"
                    ></button>
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
                    onClick={() => {
                      setFirstCollapse(!firstCollapse);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="mb-0 fw-bold">
                      <span>
                        {!firstCollapse ? (
                          <FontAwesomeIcon icon={faCaretUp} />
                        ) : (
                          <FontAwesomeIcon icon={faCaretDown} />
                        )}{" "}
                      </span>
                      Today is {getCurrentDate()}
                    </p>
                    <p className="mb-0">Your Appointments</p>
                  </div>
                </div>

                {!firstCollapse && (
                  <div className="row p-3">
                    <div
                      className="col bg-white border rounded-4 p-3 overflow-auto"
                      style={{ maxHeight: "75vh" }}
                    >
                      {appointments.length === 0 && (
                        <h5 className="text-center fw-bold mb-0">
                          No appointments for today.
                        </h5>
                      )}

                      {appointments
                        .filter(
                          (appointment) => appointment.status === "Accepted"
                        )
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <div className="d-flex gap-3 align-items-center">
                              <h5 className="mb-0 fw-bold">
                                {appointment.selectedSchedule.day}
                              </h5>
                              <div className="mb-0 text-accepted">
                                {appointment.status}
                              </div>
                            </div>

                            <p className="mb-0 fw-bold">
                              {appointment.selectedSchedule.startTime} -{" "}
                              {appointment.selectedSchedule.endTime}
                            </p>
                            <p className="mb-0">
                              Scheduled appointment with{" "}
                              {appointment.patientId.firstName}{" "}
                              {appointment.patientId.lastName}
                            </p>
                            <a
                              href="#"
                              className="text-primary "
                              onClick={(e) => {
                                e.preventDefault();
                                openModal(appointment._id);
                              }}
                            >
                              <p>View Appointment Details</p>
                            </a>

                            <button
                              className="mb-3 text-button border"
                              onClick={() =>
                                joinMeeting(appointment.roomId, appointment)
                              }
                            >
                              Join
                            </button>
                          </div>
                        ))}
                      {appointments
                        .filter(
                          (appointment) => appointment.status === "Completed"
                        )
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <h5 className="mb-0 fw-bold">
                                {appointment.selectedSchedule?.day}
                              </h5>
                              <div className="my-3 text-accepted">
                                {appointment.status}
                              </div>
                            </div>

                            <p className="mb-0 fw-bold">
                              {appointment.selectedSchedule?.startTime} -{" "}
                              {appointment.selectedSchedule?.endTime}
                            </p>
                            <p className="mb-3">
                              Scheduled appointment with{" "}
                              {appointment.patientId.firstName}{" "}
                              {appointment.patientId.lastName}
                            </p>
                            <a
                              href="#"
                              className="text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openModal(appointment._id);
                              }}
                            >
                              View Appointment Details
                            </a>
                          </div>
                        ))}
                      {appointments
                        .filter(
                          (appointment) =>
                            appointment.status === "Temporarily Rescheduled"
                        )
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <h5 className="mb-0 fw-bold">
                                {appointment.temporaryReschedule?.day}
                              </h5>
                              <div className="my-3 text-accepted">
                                {appointment.status}
                              </div>
                            </div>
                            <p className="mb-0 fw-bold">
                              {appointment.temporaryReschedule.startTime} -{" "}
                              {appointment.temporaryReschedule.endTime}
                            </p>
                            <p className="mb-3">
                              Scheduled appointment with{" "}
                              {appointment.patientId.firstName}{" "}
                              {appointment.patientId.lastName}
                            </p>
                            <a
                              href="#"
                              className="text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openModal(appointment._id);
                              }}
                            >
                              View Appointment Details
                            </a>

                            <div className="mt-2">
                              <button
                                className="mb-3 text-button border"
                                onClick={() =>
                                  joinMeeting(appointment.roomId, appointment)
                                }
                              >
                                Join
                              </button>
                            </div>
                          </div>
                        ))}
                      {appointments
                        .filter(
                          (appointment) =>
                            appointment.status ===
                            "Temporary Reschedule Request"
                        )
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <h5 className="mb-0 fw-bold">
                                {appointment.temporaryReschedule?.day}
                              </h5>
                              <div className="my-3 text-pending">
                                {appointment.status}
                              </div>
                            </div>

                            <p className="mb-0 fw-bold">
                              {appointment.temporaryReschedule.startTime} -{" "}
                              {appointment.temporaryReschedule.endTime}
                            </p>
                            <p className="mb-3">
                              {appointment.patientId.firstName}{" "}
                              {appointment.patientId.lastName} requested a
                              Temporary Schedule Change. This is subject for
                              approval.
                            </p>
                            <a
                              href="#"
                              className="text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openModal(appointment._id);
                              }}
                            >
                              View Appointment Details
                            </a>
                          </div>
                        ))}
                      {appointments
                        .filter(
                          (appointment) =>
                            appointment.status === "Schedule Change Request"
                        )
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <h5 className="mb-0 fw-bold">
                                {appointment.newSchedule?.day}
                              </h5>
                              <div className="my-3 text-pending">
                                {appointment.status}
                              </div>
                            </div>
                            <p className="mb-0 fw-bold">
                              {appointment.newSchedule.startTime} -{" "}
                              {appointment.newSchedule.endTime}
                            </p>
                            <p className="mb-3">
                              {appointment.patientId.firstName}{" "}
                              {appointment.patientId.lastName} requested a
                              Schedule Change. This is subject for approval.
                            </p>
                            <a
                              href="#"
                              className="text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openModal(appointment._id);
                              }}
                            >
                              View Appointment Details
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSecondCollapse(!secondCollapse);
                    }}
                  >
                    <p className="mb-0 fw-bold">
                      <span>
                        {!secondCollapse ? (
                          <FontAwesomeIcon icon={faCaretUp} />
                        ) : (
                          <FontAwesomeIcon icon={faCaretDown} />
                        )}{" "}
                      </span>
                      Notifications
                    </p>
                    <p className="mb-0">
                      Account related notifications will appear here.
                    </p>
                  </div>
                </div>

                {!secondCollapse && (
                  <div className="row p-3">
                    <div
                      className="col bg-white border rounded-4 p-3 overflow-auto"
                      style={{ maxHeight: "75vh" }}
                    >
                      {notifications.length > 0 ? (
                        notifications
                          .filter((notif) =>
                            notif.show_to.includes(clinicianData?._id)
                          )
                          .map((notification) => (
                            <div
                              key={notification._id}
                              className="mb-3 border border border-top-0 border-start-0 border-end-0"
                            >
                              <p className="mb-0 fw-bold">
                                {notification.body}
                              </p>

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
