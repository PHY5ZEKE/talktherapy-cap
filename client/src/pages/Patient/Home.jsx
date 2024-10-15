import { useNavigate } from "react-router-dom";
import { route } from "../../utils/route";
import axios from "axios";
import { useState, useEffect } from "react";

// Modal
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";
import PatientViewAppointment from "../../components/Modals/PatientViewAppointment";

// UI Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/MenuDropdown";

// CSS
import "../../styles/text.css";

export default function Home() {
  const appURL = import.meta.env.VITE_APP_URL;

  // Handle Confirm Reschedule Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const closeModal = () => {
    setIsConfirm(!isConfirm);
  };

  // Handle Choose Schedule Modal
  const [isChoose, setIsChoose] = useState(false);
  const closeSchedule = () => {
    setIsChoose(!isChoose);
  };

  const [dateToday, setToday] = useState();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const [patientRes, appointmentsRes] = await Promise.all([
          fetch(`${appURL}/${route.patient.fetch}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${appURL}/${route.appointment.get}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!patientRes.ok || !appointmentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const patientData = await patientRes.json();
        const appointmentsData = await appointmentsRes.json();

        setPatientData(patientData.patient);
        localStorage.setItem("userId", patientData.patient._id);
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
      appointment.status === "Accepted" || appointment.status === "Pending"
  );

  const joinMeeting = (app, id) => {
    console.log("Joining meeting with ID:", id);
    navigate(`/room/${app}/${id}`);
  };

  // Handle Appointment Details Modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const openModal = async (appointmentId) => {
    try {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from local storage or another source
      const response = await axios.get(
        `${appURL}/${route.appointment.getById}/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched appointment details:", response.data); // Debugging statement
      setSelectedAppointment(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
    }
  };
  return (
    <>
      {/* RESCHEDULE PAGE 1 MODAL */}
      {isConfirm && (
        <ConfirmReschedule
          onClick={closeModal}
          closeModal={closeModal}
          openResched={closeSchedule}
        />
      )}

      {/* RESCHEDULE PAGE 2 MODAL */}
      {isChoose && <ChooseSchedule closeModal={closeSchedule} />}

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {isOpen && (
        <PatientViewAppointment
          closeModal={() => setIsOpen(false)}
          appointment={selectedAppointment}
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
                <p className="mb-0 mt-3">Hello,</p>
                <p className="fw-bold">{patientData?.firstName}</p>
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Today is </p>
                    <p className="mb-0">Your Appointments</p>
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
                        style={{ maxHeight: "75vh"}}
                        onClick={
                          appointment.status === "Pending"
                            ? () => openModal(appointment._id)
                            : null
                        }
                      >
                        <div className="mb-3 border border-top-0 border-start-0 border-end-0">
                          <h5 className="mb-0 fw-bold">
                            {appointment.selectedSchedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.selectedSchedule.startTime} -{" "}
                            {appointment.selectedSchedule.endTime}
                          </p>
                          <p className="mb-3">
                            Session of{" "}
                            {appointment.selectedSchedule.clinicianName} with{" "}
                            {patientData?.firstName}.
                          </p>

                          {appointment.status === "Accepted" ? (
                            <div className="d-flex justify-content-between flex-wrap gap-3">
                              <div className="mb-3 text-accepted">ACCEPTED</div>

                              <div className="d-flex gap-3">
                                <div
                                  className="mb-3 fw-bold text-button border"
                                  onClick={() =>
                                    joinMeeting(
                                      appointment._id,
                                      appointment.roomId
                                    )
                                  }
                                >
                                  Join
                                </div>
                                <div
                                  className="mb-3 fw-bold text-button border"
                                  onClick={closeModal}
                                >
                                  Cancel
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
                        You currently don't have any appointments.
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
