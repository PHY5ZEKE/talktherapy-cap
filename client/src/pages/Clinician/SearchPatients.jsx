import { useState, useEffect } from "react";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";
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
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    setIsLoading(true);

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
    <>
      {showModal && (
        <Soap
          openModal={handleOpen}
          clinicianId={clinicianData?._id}
          patientId={selectedPatient?._id}
        />
      )}

      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          <Sidebar />

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
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">List of Patients</p>
                    <input
                      type="text"
                      placeholder="Search for patient"
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {filteredPatients && filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => handleClinicianClick(patient)}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                          style={{ cursor: "pointer" }}
                        >
                          <h5 className="mb-0 fw-bold">{`${patient.firstName} ${patient.lastName}`}</h5>
                          <p className="mb-0 fw-bold">{patient.email}</p>
                          <p className="mb-3">{patient.mobile}</p>
                        </div>
                      ))
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        You currently don't have any appointments.
                      </h5>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">View Patient</p>
                    <p className="mb-0">
                      Get a preview of the patient and other actions.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {isLoading ? (
                      <h5 className="mb-0 fw-bold text-center">
                        Loading data.
                      </h5>
                    ) : selectedPatient ? (
                      <div className="card">
                        <img
                          src={selectedPatient?.profilePicture}
                          className="card-img-top"
                          alt="Profile picture"
                          style={{
                            maxHeight: "320px",
                            minHeight: "320px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="card-body">
                          <h5 className="">
                            {selectedPatient?.firstName}{" "}
                            {selectedPatient?.middleName}{" "}
                            {selectedPatient?.lastName}
                          </h5>
                          <p className="mb-0">{selectedPatient?.diagnosis}</p>
                          <p className="mb-0">{selectedPatient?.mobile}</p>
                          <p className="mb-0">{selectedPatient?.email}</p>

                          <div className="d-flex flex-column gap-3">
                            <button
                              className="text-button border w-100"
                              onClick={handleOpen}
                            >
                              Add SOAP
                            </button>
                            <button className="text-button border w-100">
                              View Progress
                            </button>
                            <button className="text-button border w-100">
                              View Records
                            </button>
                            <button className="text-button border w-100">
                              Request Records
                            </button>
                            <button className="text-button border w-100">
                              Export Data
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        Select a patient to view their profile.
                      </h5>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">View Selected Option</p>
                    <p className="mb-0">
                      Account related information will appear here.
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
