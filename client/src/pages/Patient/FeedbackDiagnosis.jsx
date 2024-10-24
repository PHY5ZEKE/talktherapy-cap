import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

import "react-datepicker/dist/react-datepicker.css";

export default function FeedbackDiagnosis() {
  const appURL = import.meta.env.VITE_APP_URL;

  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.patient.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const data = await response.json();
        setPatientData(data.patient);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  useEffect(() => {
    const fetchDiagnosisData = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.soap.getPatientSoap}${patientData._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch diagnosis data");
        }

        const data = await response.json();
        setDiagnosisData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (patientData) {
      fetchDiagnosisData();
    }
  }, [patientData]);

  const handleDateClick = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
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
                ) : patientData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>
              <MenuDropdown />
            </div>
            <div className="row h-100">
              <div className="col-sm-4 bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Feedback and Diagnosis</p>
                    <p className="mb-0">Your performance and diagnosis.</p>
                  </div>
                </div>
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {diagnosisData.map((diagnosis) => (
                      <div
                        key={diagnosis._id}
                        className="mb-3 border border-top-0 border-start-0 border-end-0 hover-div"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDateClick(diagnosis)}
                      >
                        <h5 className="mb-0 fw-bold">
                          Diagnosis on{" "}
                          {new Date(diagnosis.date).toLocaleDateString()}
                        </h5>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-sm-8 bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Search</p>
                    <p className="mb-0">.</p>
                  </div>
                </div>
                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {selectedDiagnosis ? (
                      <div className="mb-3">
                        <h4 className="mb-0 fw-bold">Diagnosis</h4>
                        <p className="mb-0">
                          Diagnosed by {selectedDiagnosis.clinician.firstName}{" "}
                          {selectedDiagnosis.clinician.middleName}{" "}
                          {selectedDiagnosis.clinician.lastName}
                        </p>
                        <p className="mb-3">
                          {new Date(
                            selectedDiagnosis.date
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-justify">
                          {selectedDiagnosis.diagnosis}
                        </p>
                      </div>
                    ) : (
                      <p>Select a date to see the diagnosis.</p>
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
