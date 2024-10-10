import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";

// Icons
import Sort from "../../assets/icons/Sort";
import Search from "../../assets/icons/Search";
import React, { useState, useEffect } from "react";

import Soap from "../../components/Modals/Soap";

export default function ManageSchedule() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    const fetchClinicianData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
          },
        });

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
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.clinician.getAllPatients}`,
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

  const fetchPatientDetails = async (patientId) => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch(
        `${appURL}/${route.clinician.getPatientById}${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setSelectedPatient(data.patient);
      } else {
        console.error("Failed to fetch patient details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClinicianClick = (patient) => {
    fetchPatientDetails(patient._id);
  };

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* SOAP MODAL */}
        {showModal && <Soap openModal={handleOpen} />}

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-stretch"
        >
          {/* TOP BAR */}
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

          {/* TOAL ADMINS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-flex justify-content-center align-items-center">
                  <p className="m-0 fw-bold">Search Patients</p>
                </div>

                <div className="d-flex align-items-center gap-2 search-bar d-none d-lg-block">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search for patient"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Sort />
            </div>
          </Row>

          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto d-sm-block d-lg-none"
          >
            <div className="admin-left d-flex justify-content-center">
              <div className="d-flex align-items-center gap-2 search-bar">
                <Search />
                <input
                  type="text"
                  placeholder="Search for content"
                  className="search-input"
                />
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* PATIENT LIST */}
            <Col lg className="height-responsive">
              {/* CONTENT LIST */}
              <div className="scrollable-div-4 d-flex flex-column gap-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="card-content-bg-dark p-3"
                    onClick={() => handleClinicianClick(patient)}
                  >
                    <div className="d-flex flex-column g-1 mb-2">
                      <p className="fw-bold mb-0">{`${patient.firstName} ${patient.lastName}`}</p>
                      <p className="mb-0">{patient.email}</p>
                      <p className="mb-0">{patient.mobile}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* PREVIEW PATIENT */}

            <Col lg>
              {isLoading ? (
                <p>Loading...</p>
              ) : selectedPatient ? (
                <div className="card-container p-3 d-flex flex-column flex-row scrollable-div-5 notif-home">
                  <div className="w-100 mb-3">
                    <div className="profile-img">
                      <img
                        src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg"
                        alt="Profile"
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-column g-1 mb-2 mx-3">
                    <h3 className="fw-bold mb-0">
                      {selectedPatient.firstName} {selectedPatient.middleName}{" "}
                      {selectedPatient.lastName}
                    </h3>
                    <p className="mb-0">Patient</p>
                    <p className="mb-0">{selectedPatient.diagnosis}</p>
                    <p className="mb-0">{selectedPatient.mobile}</p>
                    <p className="mb-0">{selectedPatient.email}</p>

                    {/* Operations */}
                    <div className="d-flex flex-column gap-3">
                      <button className="action-btn" onClick={handleOpen}>
                        Add SOAP
                      </button>
                      <button className="action-btn">View Progress</button>
                      <button className="action-btn">View Records</button>
                      <button className="action-btn">Request Records</button>
                      <button className="action-btn">Export Data</button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Select an patient to view their profile</p>
              )}
            </Col>

            {/* PREVIEW FILES */}
            <Col lg>
              <div className="card-container d-flex gap-2 flex-wrap align-items-center flex-row scrollable-div-5 notif-home">
                {/* DIAGNOSIS COMPONENT */}
                <div className="card-content-bg-dark w-100 p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">Diagnosis</p>
                    <p className="mb-0">Patient Name: Nicole E. Oraya</p>
                    <p>Date: July 24, 2024</p>
                    <p className="mb-0">Diagnosis text here</p>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <button className="action-btn fw-bold">Edit</button>
                  </div>
                </div>

                {/* EXERCISE PROGRESS COMPONENT */}
                <div className="card-content-bg-dark w-100 p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">Exercise Name</p>
                    <p>Date: July 24, 2024</p>
                    <p className="mb-0">Performance text here</p>
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
