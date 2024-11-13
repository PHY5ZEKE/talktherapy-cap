import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function ViewContent() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [contentData, setContentData] = useState([]); // Store content data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  // Fetch patient data
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
  }, [accessToken, appURL]);

  // Fetch content data
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch(`${appURL}/api/contents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch content data");
        }

        const data = await response.json();
        setContentData(data); 
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchContentData();
  }, [accessToken, appURL]);

  const handleCardClick = (id) => {
    navigate(`/content/exercises/${id}`); 
  };

  return (
    <>
      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
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
                  <p>Fetching data...</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Exercises</p>
                    <p className="mb-0">View exercises and follow along.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="d-flex flex-wrap gap-3 bg-white border rounded-4 p-3 overflow-auto"
                    style={{ minHeight: "85vh" }}
                  >
                    {contentData.map((content) => (
                      <div
                        key={content._id} 
                        className="card exercise-container border"
                        style={{ width: "18rem" }}
                        onClick={() => handleCardClick(content._id)} 
                      >
                        <img
                          src={content.image} 
                          className="card-img-top"
                          alt={content.name}
                          style={{ height: "16rem", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title fw-bold mb-0 text-truncate">
                            {content.name} 
                          </h5>
                          <p>{content.category}</p> 
                          <FontAwesomeIcon icon={faBookmark} />
                        </div>
                      </div>
                    ))}
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
