import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";
import ViewProgress from "../../components/Modals/ViewProgress";
import ViewRecord from "../../components/Modals/ViewRecord";

import exportPatientData from "../../utils/exportData";

const VIEW_MODES = {
  NONE: "NONE",
  RECORDS: "RECORDS",
  PROGRESS: "PROGRESS",
};

export default function ManageSchedule() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const userRole = authState.role;

  const appURL = import.meta.env.VITE_APP_URL;

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [adminData, setAdminData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState(VIEW_MODES.NONE);
  const [soapRecords, setSoapRecords] = useState([]);

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  // WebSocket Notification
  const socket = useRef(null);
  useEffect(() => {
    // Fetch Admin
    fetchAdminData();

    // Fetch Patients
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.admin.getAllPatients}`,
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

    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchPatients();
      }

      if (message.type === "fetch-action") {
        fetchPatients();
        fetchSoapRecords();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile.includes(searchTerm)
  );

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${appURL}/${route.admin.fetch}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();
      setAdminData(data.admin);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${appURL}/${route.admin.getPatientById}${patientId}`,
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

  const fetchSoapRecords = async (patientId) => {
    try {
      const response = await fetch(
        `${appURL}/${route.soap.getPatientSoap}${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      if (!data.error) {
        setSoapRecords(Array.isArray(data) ? data : []);
      } else {
        failNotify(toastMessage.fail.fetch);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const handleClinicianClick = (patient) => {
    setSelectedPatient(patient);
    setSoapRecords(fetchSoapRecords(patient._id));
    setViewMode(VIEW_MODES.NONE);
    fetchPatientDetails(patient._id);
  };

  const handleViewRecords = () => {
    if (selectedPatient) {
      fetchSoapRecords(selectedPatient._id);
      setViewMode(VIEW_MODES.RECORDS);
    }
  };

  const handleExport = () => {
    if (!selectedPatient) {
      return;
    }
    fetchSoapRecords(selectedPatient._id);
    exportPatientData(selectedPatient, soapRecords);
  };

  return (
    <>
      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          <Sidebar />

          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
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
                  <div className="col d-flex align-items-center gap-3 bg-white border rounded-4 p-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input
                      type="text "
                      placeholder="Search for patient"
                      className="search-input rounded-3 w-100"
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
                          <h5 className="mb-0 fw-bold">{`${patient.firstName} ${patient.middleName} ${patient.lastName}`}</h5>
                          <p className="mb-0 fw-bold">{patient.email}</p>
                          <p className="mb-3">{patient.mobile}</p>
                        </div>
                      ))
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        No patients to show.
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
                            <>
                              <button
                                onClick={() => setViewMode(VIEW_MODES.PROGRESS)}
                                className="text-button border w-100"
                              >
                                View Progress
                              </button>
                              <button
                                onClick={handleViewRecords}
                                className="text-button border w-100"
                              >
                                View SOAP Records
                              </button>
                              <button
                                className="text-button border w-100"
                                onClick={handleExport}
                              >
                                Export Data
                              </button>
                            </>
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
                    style={{ maxHeight: "75vh" }}
                  >
                    {viewMode === VIEW_MODES.RECORDS ? (
                      <div>
                        <h5 className="fw-bold text-center">SOAP Records</h5>
                        {soapRecords.length > 0 ? (
                          soapRecords.map((record) => (
                            <ViewRecord
                              key={record._id}
                              header={`${new Date(
                                record.date
                              ).toLocaleDateString()} - Dr. ${
                                record.clinician.firstName
                              } ${record.clinician.lastName}`}
                              details={record}
                              role={userRole}
                            />
                          ))
                        ) : (
                          <h5 className="mb-0 fw-bold text-center">
                            No SOAP records available.
                          </h5>
                        )}
                      </div>
                    ) : viewMode === VIEW_MODES.PROGRESS ? (
                      <>
                        <h5 className="fw-bold text-center">
                          Progress Records
                        </h5>
                        <ViewProgress
                          header="Exercise - Progress"
                          details="Sample progress details"
                          role={userRole}
                        />
                      </>
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
