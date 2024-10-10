import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";

// Icons
import Search from "../../assets/icons/Search";
import Sort from "../../assets/icons/Sort";

// Modal
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";

// React
import { useState, useEffect } from "react";

export default function Home() {
  // Handle Confirm Reschedule Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const appURL = import.meta.env.VITE_APP_URL;
  const closeModal = () => {
    setIsConfirm(!isConfirm);
  };

  // Handle Choose Schedule Modal
  const [isChoose, setIsChoose] = useState(false);
  const closeSchedule = () => {
    setIsChoose(!isChoose);
  };

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
    (appointment) => appointment.status === "Accepted"
  );

  const joinMeeting = (app, id) => {
    console.log("Joining meeting with ID:", id);
    navigate(`/room/${app}/${id}`);
  };

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-flex"
        >
          {/* MODAL */}
          {isConfirm && (
            <ConfirmReschedule
              onClick={closeModal}
              closeModal={closeModal}
              openResched={closeSchedule}
            />
          )}

          {isChoose && <ChooseSchedule closeModal={closeSchedule} />}

          {/* USER TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">{patientData?.firstName || "Admin"}</p>
            </div>
          </Row>

          <Row lg md>
            {/* APPOINTMENT LIST */}
            <Col lg className="height-responsive d-none d-lg-block">
              {/* DATE COMPONENT */}
              <div className="card-content-bg-light p-3 my-3 date-card">
                <div className="d-flex flex-row justify-content-between g-1 mb-2">
                  <div className="calendar-text">
                    <p className="fw-bold mb-0">July</p>
                    <p className="mb-0">Today is Friday, July 5, 2024</p>
                  </div>
                </div>
              </div>

              <div className="card-container d-flex flex-column gap-2">
                <h5>Your Appointment</h5>
                <div className="scrollable-div d-flex flex-column">
                  {loading ? (
                    <p>Loading appointments...</p>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    acceptedAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="d-flex flex-column g-1 mb-2 card-content-bg-dark p-3 status-accepted-2"
                      >
                        <p className="fw-bold mb-0">
                          {appointment.selectedSchedule.day}
                        </p>
                        <p className="mb-0">
                          {appointment.selectedSchedule.startTime} -{" "}
                          {appointment.selectedSchedule.endTime}
                        </p>
                        <p className="mb-0">
                          Session of{" "}
                          {appointment.selectedSchedule.clinicianName} with{" "}
                          {patientData?.firstName}.
                        </p>
                        <div className="d-flex justify-content-between mt-3">
                          <p className="status-accepted status-text status-text-green">
                            ACCEPTED
                          </p>
                          <div>
                            <button
                              className="button-group bg-white"
                              onClick={() =>
                                joinMeeting(appointment._id, appointment.roomId)
                              }
                            >
                              <p className="fw-bold my-0 status">JOIN</p>
                            </button>
                            <button
                              className="button-group bg-white"
                              onClick={closeModal}
                            >
                              <p className="fw-bold my-0 status">CANCEL</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Col>

            {/* VIDEO FAV LIST */}
            <Col lg className="height-responsive d-none d-lg-block">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">
                  Favorite Exercises
                </h4>
                <Sort />
              </div>

              <div className="d-flex flex-column gap-3 justify-content-between my-3 py-3 px-3 card-content-bg-light">
                <div className="search-bar d-flex align-content-center gap-2">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                  />
                </div>

                <div className="scrollable-div-4 d-flex flex-column gap-3">
                  {/* VIDEO CARD COMPONENT */}
                  <div className="card-content-bg-dark p-3 d-flex justify-content-between">
                    <div className="d-flex flex-column g-1 mb-2">
                      <p className="fw-bold mb-0">Video Title</p>
                      <p className="mb-0">Description</p>
                      <p className="mb-0">Category</p>
                    </div>

                    <div>
                      <img
                        className="img-col"
                        src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg"
                        alt="Profile"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* NOTIFICATION */}
            <Col lg className="height-responsive">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Notifications</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2 scrollable-div-2 notif-home">
                {/* NOTIFICATION COMPONENT */}
                <div className="card-content-bg-dark p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">July 5, 2024</p>
                    <p className="mb-0">7:31 PM</p>
                    <p className="mb-0">
                      Session of Dr. Reyes with Nicole Oraya has started.
                    </p>
                  </div>

                  <div className="button-group bg-white">
                    <p className="fw-bold my-0 status">ON-GOING</p>
                  </div>
                </div>

                {/* Add more notification components as needed */}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
