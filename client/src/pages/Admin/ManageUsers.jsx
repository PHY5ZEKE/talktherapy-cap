import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";
// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";

// Icons
import Sort from "../../assets/icons/Sort";
import Edit from "../../assets/icons/Edit";
import Delete from "../../assets/icons/Delete";

import EditProfile from "../../components/Modals/EditProfile";

export default function ManageUsers() {
  const [patients, setPatients] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null); // New state for selected patient
  const [isLoading, setIsLoading] = useState(false);

  const [userDetails, setUserDetails] = useState(null);
  const [editProfileAPI, setEditProfileAPI] = useState("");
  const [updateProfilePictureAPI, setUpdateProfilePictureAPI] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");

  const handleModal = (user) => {
    setIsOpen(!isOpen);
    setUserDetails(user);
    if(role === 'patient') {
      setEditProfileAPI("adminSLP/edit-patient");
    } else {
      setEditProfileAPI("adminSLP/edit-clinician");
    }
  };

  // Fetch admin data from the backend
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(
          "http://localhost:8000/adminSLP/get-admin",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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

  //Fetch all clinicians
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

  // Fetch Clinician Details
  const fetchClinicianDetails = async (clinicianId) => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch(
        `http://localhost:8000/adminSLP/getClinicianById/${clinicianId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();
      if (!data.error) {
        setSelectedClinician(data.clinician); // Set the selected clinician details
      } else {
        console.error("Failed to fetch clinician details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching clinician details:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Fetch Patient Details
  const fetchPatientDetails = async (patientId) => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch(
        `http://localhost:8000/adminSLP/getPatientById/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setSelectedPatient(data.patient); // Set the selected patient details
      } else {
        console.error("Failed to fetch patient details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  //Patients
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
          console.error("Failed to fetch patients:", data.message);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  // Handle clinician click: fetch clinician details and set it to state
  const handleClinicianClick = (clinician) => {
    setSelectedPatient(null); // Clear selected patient
    fetchClinicianDetails(clinician._id); // Fetch the selected clinician's details
  };

  // Handle patient click: fetch patient details and set it to state
  const handlePatientClick = (patient) => {
    setSelectedClinician(null); // Clear selected clinician
    fetchPatientDetails(patient._id); // Fetch the selected patient's details
  };

  // Function to toggle activation status
  const toggleClinicianStatus = async () => {
    if (!selectedClinician) return;

    setIsProcessing(true); // Start processing

    try {
      const url = selectedClinician.active
        ? "http://localhost:8000/clinicianSLP/remove-clinician"
        : "http://localhost:8000/clinicianSLP/activate-clinician";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ email: selectedClinician.email }), // Automatically pass the selected clinician's email
      });

      const data = await response.json();

      if (!data.error) {
        // Update the selectedclinician's status in the frontend
        setSelectedClinician({
          ...selectedClinician,
          active: !selectedClinician.active,
        });

        // Optionally, update the clinicians list to reflect the change
        setClinicians(
          clinicians.map((clinician) =>
            clinician._id === selectedClinician._id
              ? { ...clinician, active: !selectedClinician.active }
              : clinician
          )
        );
      } else {
        console.error("Failed to toggle clinician status:", data.message);
      }
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  const togglePatientStatus = async () => {
    if (!selectedPatient) return;

    setIsProcessing(true); // Start processing

    try {
      const url = selectedPatient.active
        ? "http://localhost:8000/patient-SLP/remove-slp-patient"
        : "http://localhost:8000/patient-SLP/activate-slp-patient";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ email: selectedPatient.email }), // Automatically pass the selected patient's email
      });

      const data = await response.json();

      if (!data.error) {
        // Update the selectedpatient's status in the frontend
        setSelectedPatient({
          ...selectedPatient,
          active: !selectedPatient.active,
        });

        // Optionally, update the patients list to reflect the change
        setPatients(
          patients.map((patient) =>
            patient._id === selectedPatient._id
              ? { ...patient, active: !selectedPatient.active }
              : patient
          )
        );
      } else {
        console.error("Failed to toggle patient status:", data.message);
      }
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={editProfileAPI}
            editPictureAPI={updateProfilePictureAPI}
            userDetails={userDetails}
            closeModal={handleModal}
            isOwner={false}
            whatRole={""}
          />
        )}

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
              <p className="m-0 fw-bold">{adminData?.firstName || "Admin"}</p>
            </div>
          </Row>

          {/* TOAL USERS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-none d-lg-block">
                  <p className="m-0">3</p>
                  <p className="m-0 fw-bold">Total Users</p>
                </div>
                <a href="/admin/register">
                  <button className="action-btn">Register Clinician</button>
                </a>
              </div>

              <Sort />
            </div>
          </Row>

          <Row lg md>
            {/* PATIENTS */}
            <Col lg className="height-responsive">
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Patients</h4>
              </div>

              {/* Ensure patients array is defined and not empty */}
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <div
                      key={patient._id}
                      onClick={() => handlePatientClick(patient)} // Handle patient selection
                      className="card-content-bg-dark p-3"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="container d-flex flex-column g-1 mb-2">
                        <div className="row">
                          <div className="col">
                            <p className="fw-bold mb-0 text-overflow">
                              {patient.firstName} {patient.middleName}
                              {patient.lastName}
                            </p>
                          </div>
                        </div>

                        {/* <p className="mb-0">{patient.address}</p> */}
                        <p className="mb-0">{patient.mobile}</p>
                        <p className="mb-0">{patient.email}</p>
                      </div>
                      <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                        <button
                          className="icon-btn"
                          onClick={() => {
                            handleModal(patient);
                            setRole("patient");
                          }}
                        >
                          <Edit />
                        </button>
                        <Delete />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No patients available.</p>
                )}
              </div>
            </Col>

            {/* CLINICIANS */}
            <Col lg className="height-responsive">
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Clinicians</h4>
              </div>

              {/* Ensure clinicians array is defined and not empty */}
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {clinicians && clinicians.length > 0 ? (
                  clinicians.map((clinician) => (
                    <div
                      key={clinician._id}
                      onClick={() => handleClinicianClick(clinician)} // Handle clinician selection
                      className="card-content-bg-dark p-3"
                      style={{ cursor: "pointer" }}
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
                      <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                        <button
                          className="icon-btn"
                          onClick={() => {
                            handleModal(clinician);
                            setRole("clinician");
                          }}
                        >
                          <Edit />
                        </button>
                        <Delete />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No clinicians available.</p>
                )}
              </div>
            </Col>

            {/* PROFILE PREVIEW */}
            <Col lg className="height-responsive">
              <div className="card-container d-flex flex-column gap-2 scrollable-div-6 notif-home">
                {/* Loading state */}
                {isLoading ? (
                  <p>Loading...</p>
                ) : selectedClinician ? (
                  <div className="p-3">
                    <div className="profile-img">
                      <img
                        src={
                          selectedClinician.profilePicture ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                      />
                    </div>
                    <div className="d-flex flex-column g-1 mb-2 mx-3">
                      <h3 className="fw-bold mb-0 text-overflow">
                        {selectedClinician.firstName}{" "}
                        {selectedClinician.middleName}{" "}
                        {selectedClinician.lastName}
                      </h3>
                      <p className="mb-0">
                        {selectedClinician.role || "Clinician"}
                      </p>
                      <p className="mb-0">{selectedClinician.address}</p>
                      <p className="mb-0">{selectedClinician.mobile}</p>
                      <p className="mb-0">{selectedClinician.email}</p>
                      {/* Dynamic Activate/Deactivate button */}
                      <button
                        className="action-btn btn-text-blue my-2"
                        onClick={toggleClinicianStatus}
                        disabled={isProcessing} // Disable button while processing
                      >
                        {selectedClinician.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>

                    {/* Schedule for clinician */}
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Example of rendering schedule data */}
                          {selectedClinician.schedule?.map(
                            (scheduleItem, index) => (
                              <tr key={index}>
                                <td>{scheduleItem.date}</td>
                                <td>{scheduleItem.time}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedPatient ? (
                  <div className="p-3">
                    <div className="profile-img">
                      <img
                        src={
                          selectedPatient.profilePicture ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                      />
                    </div>
                    <div className="d-flex flex-column g-1 mb-2 mx-3">
                      <h3 className="fw-bold mb-0 text-overflow">
                        {selectedPatient.firstName} {selectedPatient.middleName}{" "}
                        {selectedPatient.lastName}
                      </h3>

                      {/* <p className="mb-0">{selectedPatient.address}</p> */}
                      <p className="mb-0">{selectedPatient.mobile}</p>
                      <p className="mb-0">{selectedPatient.email}</p>

                      <button
                        className="action-btn btn-text-blue my-2"
                        onClick={togglePatientStatus}
                        disabled={isProcessing} // Disable button while processing
                      >
                        {selectedPatient.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between my-3 py-3 px-3 text-header">
                    <h4 className="fw-bold my-0 mx-0 card-text">
                      Select to view patient or clinician profile
                    </h4>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
