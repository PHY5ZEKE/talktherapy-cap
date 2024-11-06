import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";
import Soap from "../../components/Modals/Soap";
import EditSoap from "../../components/Modals/EditSoap";
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
  const [editSoapRecord, setEditSoapRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState(VIEW_MODES.NONE);
  const [soapRecords, setSoapRecords] = useState([]);
  const [selectedSoapRecord, setSelectedSoapRecord] = useState(null);

  const [patientName, setPatientName] = useState("");

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  //  Request Access Modal
  const [isRequestAccess, setIsRequestAccess] = useState(false);
  const openRequestAccess = (name) => {
    setPatientName(name);
    setIsRequestAccess((prevState) => !prevState);
  };
  // Add SOAP Modal
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => {
    setShowModal((prevState) => !prevState);
  };

  // WebSocket Notification
  const socket = useRef(null);
  useEffect(() => {
    // Fetch Assigned Patients
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

    socket.current = new WebSocket(`ws://${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchAssignedPatients();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const webSocketNotification = async (message) => {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};

    if (parsed.notif === "appointmentRequestAccess") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    if (parsed.notif === "addSOAP") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    try {
      const response = await fetch(`${appURL}/${route.notification.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      const result = await response.json();

      // Notify WebSocket server
      const resultWithNotif = { ...result, type: "notification" };

      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  useEffect(() => {
    // Clinician Data
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
    // Fetch Patients
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
        setSoapRecords(data);
      } else {
        failNotify(toastMessage.fail.fetch);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const handleClinicianClick = (patient) => {
    setSelectedPatient(null);
    setSoapRecords([]);
    setViewMode(VIEW_MODES.NONE);
    fetchPatientDetails(patient._id);
  };

  const handleViewRecords = () => {
    if (selectedPatient) {
      fetchSoapRecords(selectedPatient._id);
      setViewMode(VIEW_MODES.RECORDS);
    }
  };

  const handleSoapRecordClick = (record) => {
    setSelectedSoapRecord(record);
  };

  const handleDeleteSoapRecord = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this SOAP record?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${appURL}/${route.soap.delete}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error("Failed to delete SOAP record");
      }

      // Remove the deleted record from the state
      setSoapRecords((prevRecords) =>
        prevRecords.filter((record) => record._id !== id)
      );

      toast.success("SOAP record deleted successfully", {
        transition: Slide,
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error deleting SOAP record:", error);
      failNotify("Failed to delete SOAP record");
    }
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
          onWebSocket={webSocketNotification}
        />
      )}

      {/* Request Access Modal */}

      {isRequestAccess && (
        <RequestAccess
          openModal={openRequestAccess}
          clinicianId={clinicianData?._id}
          patientId={selectedPatient?._id}
          accessToken={accessToken}
          clinicianName={`${clinicianData?.firstName} ${clinicianData?.lastName}`}
          patientName={`${patientName}`}
          onWebSocket={webSocketNotification}
        />
      )}

      {/*Edit Soap Modal */}
      {editSoapRecord && (
        <EditSoap
          openModal={() => setEditSoapRecord(null)}
          soapRecord={editSoapRecord}
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
                                  onClick={handleViewRecords}
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
                                onClick={() =>
                                  openRequestAccess(
                                    `${selectedPatient?.firstName} ${selectedPatient?.lastName}`
                                  )
                                }
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
                    style={{ maxHeight: "75vh" }}
                  >
                    {viewMode === VIEW_MODES.RECORDS ? (
                      <div>
                        <h5 className="mb-0 fw-bold">SOAP Records</h5>
                        {soapRecords.map((record) => (
                          <ViewRecord
                            key={record._id}
                            header={`Date: ${new Date(
                              record.date
                            ).toLocaleDateString()} - Clinician: ${
                              record.clinician.firstName
                            } ${record.clinician.lastName}`}
                            details={`Diagnosis: ${record.diagnosis}`}
                            onDelete={() => handleDeleteSoapRecord(record._id)}
                            onEdit={() => setEditSoapRecord(record)} // Add this line
                          />
                        ))}
                      </div>
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
