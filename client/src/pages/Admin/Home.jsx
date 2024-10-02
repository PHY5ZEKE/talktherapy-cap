import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";
import axios from "axios";

// CSS
import "./home.css";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import AppointmentDetails from "../../components/Modals/AppointmentDetails";

// Icons
import Logout from "../../assets/buttons/Logout";
import HomeBtn from "../../assets/buttons/Home";
import Sort from "../../assets/icons/Sort";
import Search from "../../assets/icons/Search";

export default function Home() {
  const [patients, setPatients] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("patients");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle Appointment Details Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const closeModal = () => setIsConfirm(false);

  const openModal = async (appointmentId) => {
    try {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from local storage or another source
      const response = await axios.get(
        `http://localhost:8000/appointments/get-appointment-by-id/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched appointment details:", response.data); // Debugging statement
      setSelectedAppointment(response.data);
      setIsConfirm(true);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/appointments/get-all-appointments",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        console.log("Appointments fetched:", data);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(
          "http://localhost:8000/adminSLP/get-admin",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

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

    fetchAdminData();
  }, []);

  useEffect(() => {
    const fetchClinicians = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/adminSLP/getAllClinicians",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = await response.json();

        if (!data.error) {
          setClinicians(data.clinicians);
        } else {
          console.error("Failed to fetch admins:", data.message);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchClinicians();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/adminSLP/getAllPatients",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = await response.json();

        if (!data.error) {
          setPatients(data.patients);
        } else {
          console.error("Failed to fetch admins:", data.message);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchPatients();
  }, []);

  const handleUserTypeChange = (type) => {
    setSelectedUserType(type);
  };

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;
  const rejectedAppointments = appointments.filter(
    (appointment) => appointment.status === "Rejected"
  ).length;
  const acceptedAppointments = appointments.filter(
    (appointment) => appointment.status === "Accepted"
  ).length;

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* MODAL */}
        {isConfirm && (
          <AppointmentDetails
            openModal={closeModal}
            appointment={selectedAppointment}
          />
        )}

        {/* CONTENT */}
        <Col xs={{ order: 12 }} lg={{ order: 1 }}>
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex flex-row justify-content-lg-start justify-content-md-around justify-content-sm-around align-items-center"
          >
            <div className="top-size">
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">{adminData?.firstName || "Admin"}</p>
            </div>
            <div className="d-lg-none top-size">
              <Logout />
            </div>
            <div className="d-lg-none top-size">
              <HomeBtn />
            </div>
          </Row>

          <Row lg md>
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
                <div className="text-center">
                  <h2 className="fw-bold mb-0">{totalAppointments}</h2>
                  <h5>Total Appointments</h5>
                </div>

                {/* STATUS COUNTER */}
                <div className="text-center d-flex justify-content-center align-content-center gap-4">
                  <div className="status-pending status-size">
                    <h4 className="mb-0">{pendingAppointments}</h4>
                    <p className="mb-0">Pending</p>
                  </div>
                  <div className="status-cancelled status-size">
                    <h4 className="mb-0">{rejectedAppointments}</h4>
                    <p className="mb-0">Rejected</p>
                  </div>
                  <div className="status-accepted status-size">
                    <h4 className="mb-0">{acceptedAppointments}</h4>
                    <p className="mb-0">Accepted</p>
                  </div>
                </div>

                {/* APPOINTMENT COL */}
                <div className="scrollable-div-3 d-flex flex-column gap-3">
                  {/* PENDING COMPONENT */}
                  {appointments
                    .filter((appointment) => appointment.status === "Pending")
                    .map((appointment, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column g-1 mb-2 card-content-bg-dark p-3 status-pending-2"
                        onClick={() => openModal(appointment._id)}
                      >
                        <p className="fw-bold mb-0">
                          {appointment.selectedSchedule.day}
                        </p>
                        <p className="mb-0">
                          {appointment.selectedSchedule.startTime} to{" "}
                          {appointment.selectedSchedule.endTime}
                        </p>

                        <p className="mb-0">
                          {appointment.patientId.firstName}{" "}
                          {appointment.patientId.middleName}{" "}
                          {appointment.patientId.lastName} has requested a
                          session with{" "}
                          {appointment.selectedSchedule.clinicianName}
                        </p>
                        <div className="d-flex justify-content-between mt-3">
                          <p
                            className="status-pending status-text status-text-orange"
                            onClick={closeModal}
                          >
                            PENDING
                          </p>
                          <p className="fw-bold">
                            Clinician:{" "}
                            {appointment.selectedSchedule.clinicianName}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* ACCEPTED COMPONENT */}
                  {appointments
                    .filter((appointment) => appointment.status === "Accepted")
                    .map((appointment, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column g-1 mb-2 card-content-bg-dark p-3 status-accepted-2"
                        onClick={() => openModal(appointment._id)}
                      >
                        <p className="fw-bold mb-0">
                          {appointment.selectedSchedule.day}
                        </p>
                        <p className="mb-0">
                          {appointment.selectedSchedule.startTime} to{" "}
                          {appointment.selectedSchedule.endTime}
                        </p>
                        <p className="mb-0">
                          {appointment.patientId.firstName}{" "}
                          {appointment.patientId.middleName}{" "}
                          {appointment.patientId.lastName} is assigned to{" "}
                          {appointment.selectedSchedule.clinicianName}
                        </p>
                        <div className="d-flex justify-content-between mt-3">
                          <p className="status-accepted status-text status-text-green">
                            ACCEPTED
                          </p>
                          <p className="fw-bold">
                            {appointment.selectedSchedule.clinicianName}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* CANCELLED COMPONENT */}
                  {appointments
                    .filter((appointment) => appointment.status === "Rejected")
                    .map((appointment, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column g-1 mb-2 card-content-bg-dark p-3 status-cancelled-2"
                        onClick={() => openModal(appointment._id)}
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
                          {appointment.patientName} has started.
                        </p>
                        <div className="d-flex justify-content-between mt-3">
                          <p className="status-cancelled status-text status-text-red">
                            CANCELLED
                          </p>
                          <p className="fw-bold">
                            {appointment.selectedSchedule.clinicianName}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Col>

            {/* USER LIST */}
            <Col lg className="height-responsive">
              {/* DATE COMPONENT */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Users</h4>
                <Sort />
              </div>

              <div className="d-flex justify-content-center gap-3 my-3">
                <button
                  className={`action-btn ${
                    selectedUserType === "patients" ? "active" : ""
                  }`}
                  onClick={() => handleUserTypeChange("patients")}
                >
                  Patients
                </button>
                <button
                  className={`action-btn ${
                    selectedUserType === "clinicians" ? "active" : ""
                  }`}
                  onClick={() => handleUserTypeChange("clinicians")}
                >
                  Clinicians
                </button>
              </div>

              <div className="d-flex flex-column gap-3 justify-content-between my-3 py-3 px-3 card-content-bg-light">
                <div className="search-bar d-flex align-content-center gap-2">
                  <Search />
                  <input
                    type="text"
                    placeholder={`Search for ${selectedUserType}`}
                    className="search-input"
                  />
                </div>

                <div className="scrollable-div-4 d-flex flex-column gap-3">
                  {selectedUserType === "patients" && patients
                    ? patients.map((patient) => (
                        <div
                          key={patient._id}
                          className="card-content-bg-dark p-3"
                        >
                          <div className="d-flex flex-column g-1 mb-2">
                            <p className="fw-bold mb-0 text-overflow">
                              {patient.firstName} {patient.middleName}{" "}
                              {patient.lastName}
                            </p>
                            <p className="mb-0">{patient.address}</p>
                            <p className="mb-0">{patient.mobile}</p>
                            <p className="mb-0">{patient.email}</p>
                          </div>
                        </div>
                      ))
                    : selectedUserType === "clinicians" && clinicians
                    ? clinicians.map((clinician) => (
                        <div
                          key={clinician._id}
                          className="card-content-bg-dark p-3"
                        >
                          <div className="d-flex flex-column g-1 mb-2">
                            <p className="fw-bold mb-0">
                              {clinician.firstName} {clinician.middleName}{" "}
                              {clinician.lastName}
                            </p>
                            <p className="mb-0">{clinician.address}</p>
                            <p className="mb-0">{clinician.mobile}</p>
                            <p className="mb-0">{clinician.email}</p>
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            </Col>

            {/* NOTIFCATION */}
            <Col lg className="height-responsive">
              <div className="my-3 py-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 card-text">Notifications</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2 scrollable-div-5 notif-home">
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
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
