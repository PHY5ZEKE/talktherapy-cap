import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";

// Icons
import Search from "../../assets/icons/Search";
import Sort from "../../assets/icons/Sort";

// Modal
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";

// React
import { useState, useEffect } from "react";

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/clinicianSLP/getAllPatients",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const data = await response.json();

        if (!data.error) {
          setPatients(data.patients);
        } else {
          console.error("Failed to fetch patients:", data.message);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile.includes(searchTerm)
  );

  useEffect(() => {
    const fetchClinicianData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(
          "http://localhost:8000/clinicianSLP/get-clinician",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clinician data");
        }

        const data = await response.json();
        setClinicianData(data.clinician);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClinicianData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(
          "http://localhost:8000/appointments/get-appointment-by-clinician",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Container>
      {/* MODAL */}
      {isConfirm && (
        <ConfirmReschedule
          onClick={closeModal}
          closeModal={closeModal}
          openResched={closeSchedule}
        />
      )}

      {isChoose && <ChooseSchedule closeModal={closeSchedule} />}

      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-flex"
        >
          {/* USER TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">
                {clinicianData?.firstName || "Clinician"}
              </p>
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
                <div className="search-bar d-flex align-content-center gap-2">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="scrollable-div d-flex flex-column">
                  {appointments
                    .filter((appointment) => appointment.status === "Accepted")
                    .map((appointment) => (
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
                          Scheduled appointment with{" "}
                          {appointment.patientId.firstName}{" "}
                          {appointment.patientId.lastName}
                        </p>
                        <div className="d-flex justify-content-between mt-3">
                          <p className="status-accepted status-text status-text-green">
                            ACCEPTED
                          </p>
                          <div>
                            <button className="button-group bg-white">
                              <p className="fw-bold my-0 status">JOIN</p>
                            </button>
                            <button
                              className="button-group bg-white"
                              onClick={() => console.log("Close modal")}
                            >
                              <p className="fw-bold my-0 status">CANCEL</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Col>

            {/* PATIENT LIST */}
            <Col lg className="height-responsive d-none d-lg-block">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Patients</h4>
                <Sort />
              </div>

              <div className="d-flex flex-column gap-3 justify-content-between my-3 py-3 px-3 card-content-bg-light">
                <div className="search-bar d-flex align-content-center gap-2">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search for Patient"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="scrollable-div-4 d-flex flex-column gap-3">
                  {filteredPatients.map((patient) => (
                    <div key={patient._id} className="card-content-bg-dark p-3">
                      <div className="d-flex flex-column g-1 mb-2">
                        <p className="fw-bold mb-0">{`${patient.firstName} ${patient.lastName}`}</p>
                        <p className="mb-0">{patient.email}</p>
                        <p className="mb-0">{patient.mobile}</p>
                      </div>
                    </div>
                  ))}
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
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="card-content-bg-dark p-3"
                  >
                    <div className="d-flex flex-column g-1 mb-2">
                      <p className="fw-bold mb-0">
                        {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mb-0">
                        {new Date(appointment.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="mb-0">
                        Session of Dr. {appointment.selectedClinician} with{" "}
                        {appointment.patientId.firstName}{" "}
                        {appointment.patientId.lastName} has started.
                      </p>
                    </div>

                    <div className="button-group bg-white">
                      <p className="fw-bold my-0 status">ON-GOING</p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
