import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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
  const [patientProgress, setPatientProgress] = useState([]);
  const [filter, setFilter] = useState("all");

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
        throw new Error("Failed to fetch patient data", error);
      }
    };

    fetchPatientData();
  }, [appURL, accessToken]);

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
        throw new Error("Failed to fetch diagnosis data", error);
      }
    };

    if (patientData) {
      fetchDiagnosisData();
    }
  }, [patientData, appURL, accessToken]);

  useEffect(() => {
    const fetchPatientProgress = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.patient.showProgress}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch patient progress");
        }

        const data = await response.json();
        setPatientProgress(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(error.message);
        setPatientProgress([]);
        throw new Error("Failed to fetch patient progress", error);
      }
    };

    if (patientData) {
      fetchPatientProgress();
    }
  }, [patientData, appURL, accessToken]);

  const filteredProgress = patientProgress
    .filter((progress) => {
      if (filter === "completed") return progress.completed;
      if (filter === "in-progress") return !progress.completed;
      return true;
    })
    .sort((a, b) => {
      if (filter === "in-progress") {
        const aCompletion = a.correctCount / a.totalPhrases;
        const bCompletion = b.correctCount / b.totalPhrases;
        return bCompletion - aCompletion;
      }
      return 0;
    });

  const handleDateClick = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredDiagnosis = diagnosisData.filter(
    (diagnosis) =>
      diagnosis.clinician.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      diagnosis.clinician.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      diagnosis.clinician.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      diagnosis.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.recommendation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="d-flex align-items-center justify-content-center vh-100">
  //       <div className="alert alert-danger" role="alert">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
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

            <div className="row">
              <div className="col-sm bg-white">
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
                    {filteredDiagnosis && filteredDiagnosis.length > 0 ? (
                      filteredDiagnosis.map((diagnosis) => (
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
                      ))
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        No record found.
                      </h5>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col d-flex align-items-center gap-3 bg-white border rounded-4 p-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input
                      type="text"
                      placeholder="Search for your records"
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
                    {selectedDiagnosis ? (
                      <div>
                        <h4 className="mb-2 fw-bold">Diagnosis</h4>
                        <p className="mb-0">
                          In Charge: {selectedDiagnosis.clinician.firstName}{" "}
                          {selectedDiagnosis.clinician.middleName}{" "}
                          {selectedDiagnosis.clinician.lastName}
                        </p>
                        <div>
                          <strong>Recommendation:</strong>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedDiagnosis.recommendation,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p>Select a date to see the diagnosis.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Progress with Filter */}
            <div className="row p-3">
              <div className="col bg-white border rounded-4 p-3">
                <p className="mb-0 fw-bold">Patient Progress</p>

                {/* Filter Buttons */}
                <div className="mb-3">
                  <button
                    className={`btn text-button border me-2 ${
                      filter === "all" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn text-button border me-2 ${
                      filter === "completed" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </button>
                  <button
                    className={`btn text-button border ${
                      filter === "in-progress" ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setFilter("in-progress")}
                  >
                    In Progress
                  </button>
                </div>

                {/* Filtered Progress List */}
                {filteredProgress.length > 0 ? (
                  <div>
                    {filteredProgress.map((progress) => {
                      const completionPercentage =
                        (progress.correctCount / progress.totalPhrases) * 100;
                      return (
                        <div key={progress.textId} className="mb-2">
                          <span>{progress.textName}:</span>
                          <span className="ms-2">
                            {completionPercentage.toFixed(2)}%
                          </span>
                          <span className="ms-2">
                            {progress.completed ? "Completed" : "In Progress"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No progress data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
