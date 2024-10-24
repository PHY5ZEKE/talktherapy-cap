import { useNavigate } from "react-router-dom";
import { route } from "../../utils/route";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

// UI Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

// CSS
import "../../styles/text.css";

export default function Home() {
  const appURL = import.meta.env.VITE_APP_URL;

  const { authState, setUserState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
        setUserState(patientData.patient._id);
        setAppointments(appointmentsData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

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

  // Handle Appointment Details Modal

  console.log(appointments);
  return (
    <>
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
                          <h5 className="mb-0 fw-bold">
                            {appointment.status === "Temporarily Rescheduled"
                              ? appointment.temporaryReschedule.day
                              : appointment.selectedSchedule.day}
                          </h5>
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
                              : appointment.selectedSchedule.clinicianName}{" "}
                            with {patientData?.firstName}.
                          </p>

                          {appointment.status === "Accepted" ? (
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
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh", minHeight: "60vh" }}
                  >
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-pending">PENDING</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-accepted">ACCEPTED</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-cancelled">CANCELLED</div>
                    </div>
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
                    style={{ maxHeight: "75vh", minHeight: "60vh" }}
                  >
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-pending">PENDING</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-accepted">ACCEPTED</div>
                    </div>

                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">Tuesday</h5>
                      <p className="mb-0 fw-bold">05:00 PM - 06:00 PM</p>
                      <p className="mb-3">
                        Session of Rico Noapl Nieto with Ako.
                      </p>
                      <div className="mb-3 text-cancelled">CANCELLED</div>
                    </div>
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
