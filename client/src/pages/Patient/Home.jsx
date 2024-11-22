import { useState, useRef, useEffect, useContext } from "react";

import { useNavigate } from "react-router-dom";
import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";
import formatDate from "../../utils/formatDate";

// UI Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

// CSS
import "../../styles/text.css";

export default function Home() {
  const appURL = import.meta.env.VITE_APP_URL;

  const { authState, setUserId } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const navigate = useNavigate();

  // WebSocket Notification
  const socket = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchPatientData();
    fetchContentData();
    
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
        fetchPatientData();
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

  // Fetch Appointments
  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes] = await Promise.all([
        fetch(`${appURL}/${route.patient.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${appURL}/${route.appointment.get}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      if (!patientRes.ok || !appointmentsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const patientData = await patientRes.json();
      const appointmentsData = await appointmentsRes.json();

      setPatientData(patientData.patient);
      setUserId(patientData.patient._id);
      setAppointments(appointmentsData);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

   // Fetch content data
   const fetchContentData = async () => {
    try {
      const response = await fetch(`${appURL}/api/contents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content data");
      }

      const data = await response.json();
      setContentData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Filter accepted appointments
  const acceptedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Accepted" ||
      appointment.status === "Pending" ||
      appointment.status === "Temporarily Rescheduled"
  );

  const joinMeeting = (id, details) => {
    navigate(`/room/${id}`, {
      state: {
        appointmentDetails: details,
      },
    });
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

  const bookmarkedExercises = contentData.filter((content) =>
    patientData?.bookmarkedContent.includes(content._id)
  );

  const handleCardClick = (id) => {
    navigate(`/content/exercises/${id}`);
  };

  return (
    <>
      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : patientData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
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
                    <p className="mb-0 fw-bold">Today is {getCurrentDate()} </p>
                    <p className="mb-0">Your Appointment</p>
                  </div>
                </div>

                <div className="row p-3">
                  {loading ? (
                    <div className="col bg-white border rounded-4 p-3 overflow-auto">
                      <h5 className="mb-0 fw-bold text-center">
                        Loading your appointments.
                      </h5>
                    </div>
                  ) : error ? (
                    <div className="col bg-white border rounded-4 p-3 overflow-auto">
                      <h5 className="mb-0 fw-bold text-center">{error}</h5>
                    </div>
                  ) : acceptedAppointments.length > 0 ? (
                    acceptedAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="col bg-white border rounded-4 p-3 overflow-auto"
                        style={{ maxHeight: "75vh" }}
                      >
                        <div className="mb-3 border border-top-0 border-start-0 border-end-0">
                          <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0 fw-bold">
                              {appointment.status === "Temporarily Rescheduled"
                                ? appointment.temporaryReschedule.day
                                : appointment.selectedSchedule.day}
                            </h5>
                            <div className="text-accepted">
                              {appointment.status.toUpperCase()}
                            </div>
                          </div>

                          <p className="mb-0 fw-bold">
                            {appointment.status === "Temporarily Rescheduled"
                              ? appointment.temporaryReschedule.startTime
                              : appointment.selectedSchedule.startTime}{" "}
                            -{" "}
                            {appointment.status === "Temporarily Rescheduled"
                              ? appointment.temporaryReschedule.endTime
                              : appointment.selectedSchedule.endTime}
                          </p>
                          <p className="mb-3">
                            Session of{" "}
                            {appointment.status === "Temporarily Rescheduled"
                              ? appointment.temporaryReschedule.clinicianName
                              : `${appointment.selectedClinician?.firstName} ${appointment.selectedClinician?.middleName} ${appointment.selectedClinician?.lastName}
                            with ${patientData?.firstName}`}.
                          </p>

                          {appointment.status === "Accepted" ? (
                            <div className="d-flex justify-content-between flex gap-3">
                              <div className="d-flex gap-3">
                                <div
                                  className="fw-bold text-button mb-3 border"
                                  onClick={() =>
                                    joinMeeting(appointment.roomId, appointment)
                                  }
                                >
                                  Join
                                </div>
                              </div>
                            </div>
                          ) : appointment.status ===
                            "Temporarily Rescheduled" ? (
                            <div className="d-flex justify-content-between flex-wrap gap-3">
                              <div className="mb-3 text-accepted">
                                {appointment.status}
                              </div>

                              <div className="d-flex gap-3">
                                <div
                                  className="mb-3 fw-bold text-button border"
                                  onClick={() =>
                                    joinMeeting(appointment.roomId, appointment)
                                  }
                                >
                                  Join
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-3 text-pending">PENDING</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col bg-white border rounded-4 p-3 overflow-auto">
                      <h5 className="mb-0 fw-bold text-center">
                        You currently don't have an accepted appointment. Check
                        the Scheduling Page to book an appointment.
                      </h5>
                    </div>
                  )}
                </div>
              </div>

             {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Favorite Exercises</p>
                    <p className="mb-0">
                      Your bookmarked exercises will appear here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3"
                    style={{
                      maxHeight: "75vh",  // Card's maximum height
                      overflowY: "auto",   // Enables vertical scrolling
                    }}
                  >
                    {bookmarkedExercises.length > 0 ? (
                      bookmarkedExercises.map((content) => (
                        <div
                          key={content._id}
                          className="bookmark-item border rounded-3 p-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleCardClick(content._id)}
                        >
                          <h5 className="mb-1 fw-bold">{content.name}</h5>
                          <p className="mb-0">{content.category}</p>
                        </div>
                      ))
                    ) : (
                      <p className="fw-bold text-center mb-0">
                        No bookmarked exercises available.
                      </p>
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
                      Account related notifications will appear here.
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
                        .filter((notif) =>
                          notif.show_to.includes(patientData?._id)
                        )
                        .map((notification) => (
                          <div
                            key={notification._id}
                            className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          >
                            <p className="mb-0 fw-bold">{notification.body}</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
