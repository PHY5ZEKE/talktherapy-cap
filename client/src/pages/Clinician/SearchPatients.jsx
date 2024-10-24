import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";
import Soap from "../../components/Modals/Soap";
import ViewProgress from "../../components/Modals/ViewProgress";
import ViewRecord from "../../components/Modals/ViewRecord";
import RequestAccess from "../../components/Modals/RequestAccess";

const VIEW_MODES = {
  NONE: "NONE",
  RECORDS: "RECORDS",
  PROGRESS: "PROGRESS",
};

export default function ManageSchedule() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  
  const appURL = import.meta.env.VITE_APP_URL;

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState(VIEW_MODES.NONE);

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  //  Request Access Modal
  const [isRequestAccess, setIsRequestAccess] = useState(false);
  const openRequestAccess = () => {
    setIsRequestAccess((prevState) => !prevState);
  };
  // Add SOAP Modal
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => {
    setShowModal((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchClinicianData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!data.error) {
          setPatients(data.patients);
        } else {
          failNotify(toastMessage.fail.fetch);
        }
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        failNotify(toastMessage.fail.error);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.clinician.getAssignedPatients}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!data.error) {
          setAssignedPatients(data.assignedPatients);
        } else {
          failNotify(toastMessage.fail.fetch);
        }
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        failNotify(toastMessage.fail.error);
      }
    };

    fetchAssignedPatients();
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
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setSelectedPatient(data.patient);
      } else {
        failNotify(toastMessage.fail.fetch);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClinicianClick = (patient) => {
    fetchPatientDetails(patient._id);
  };

  const isPatientAssigned = (patientId) => {
    return assignedPatients.some((patient) => patient._id === patientId);
  };

  return (
    <>
      {/* Add SOAP Modal */}
      {showModal && (
        <Soap
          openModal={handleOpen}
          clinicianId={clinicianData?._id}
          clinicianName={`${clinicianData?.firstName} ${clinicianData?.lastName}`}
          patientId={selectedPatient?._id}
        />
      )}

      {/* Request Access Modal */}
      {isRequestAccess && <RequestAccess openModal={openRequestAccess} />}

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
                      className="search-input rounded-3"
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
                          className="mb-3 border border-top-0 border-start-0 border-end-0"
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
                          <p className="mb-3">{selectedPatient?.email}</p>

                          <div className="d-flex flex-column gap-3">
                            {isPatientAssigned(selectedPatient._id) ? (
                              <>
                                <button
                                  className="text-button border w-100"
                                  onClick={handleOpen}
                                >
                                  Add SOAP
                                </button>
                                <button
                                  onClick={() =>
                                    setViewMode(VIEW_MODES.PROGRESS)
                                  }
                                  className="text-button border w-100"
                                >
                                  View Progress
                                </button>
                                <button
                                  onClick={() =>
                                    setViewMode(VIEW_MODES.RECORDS)
                                  }
                                  className="text-button border w-100"
                                >
                                  View Records
                                </button>
                                <button className="text-button border w-100">
                                  Export Data
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={openRequestAccess}
                                className="text-button border w-100"
                              >
                                Request Access
                              </button>
                            )}
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
                    {viewMode === VIEW_MODES.RECORDS ? (
                      <ViewRecord
                        header="Diagnosis - Clinician - Date"
                        details="Sample diagnosis details"
                      />
                    ) : viewMode === VIEW_MODES.PROGRESS ? (
                      <ViewProgress
                        header="Exercise - Progress"
                        details="Sample progress details"
                      />
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        Select an option to view related information.
                      </h5>
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
