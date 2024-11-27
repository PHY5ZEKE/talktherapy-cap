import React, { useState, useEffect, useContext, Suspense } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate, useParams } from "react-router-dom"; 
import { route } from "../../utils/route";

import AHImage from "../../assets/imgs/AH.png";
import LipsTogetherImage from "../../assets/imgs/MM.png";
import RoundedLipsImage from "../../assets/imgs/OH.png";
import WideSmileImage from "../../assets/imgs/EE.png";

export default function ContentWarnFace() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [clinicianData, setClinicianData] = useState(null);
  const [patientData, setPatientData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  const face = [
    { label: "Mouth Open/Relax", imgSrc: AHImage },
    { label: "Lips Together", imgSrc: LipsTogetherImage },
    { label: "Rounded Lips", imgSrc: RoundedLipsImage },
    { label: "Wide Smile", imgSrc: WideSmileImage },
  ];

   // Fetch clinician data
   useEffect(() => {
    if (authState?.userRole === "clinician") {
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
            console.error("Failed to fetch clinician data");
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
    }
  }, [accessToken, appURL, authState?.userRole]); 

  // Fetch patient data
  useEffect(() => {
    if (authState?.userRole === "patientslp") {
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
            console.error("Failed to fetch patient data");
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
    }
  }, [accessToken, appURL, authState?.userRole]); 

  const handleOkClick = () => {
    setShowInstructions(true);
  };

  const handleImageClick = (imgSrc) => {
    setModalImage(imgSrc); // Set the image for the modal
  };

  const closeModal = () => {
    setModalImage(null); // Close the modal
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center">
        {/* Header Section */}
        {!showInstructions && (
          <div className="bg-white text-center border rounded-4 p-4 shadow-sm w-75">
            <h2 className="text-primary mb-3">
              Hello,{" "}
              {authState.userRole === "clinician"
                ? `${clinicianData?.firstName} ${clinicianData?.lastName}`
                : `${patientData?.firstName} ${patientData?.lastName}`}
            </h2>
            <p className="lead">
              This is an <strong className="text-primary">Assistive Diagnostic Tool for Facial Recognition</strong>. 
              Press "OK" to begin practicing facial expressions!
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary btn-lg mt-3"
                onClick={handleOkClick}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Facial Expression Instructions */}
        {showInstructions && (
          <div className="bg-white border rounded-4 p-4 shadow-sm w-75">
            <h4 className="text-secondary">Try these facial expressions:</h4>
            <ul className="list-group list-group-flush">
              {face.map((expression, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex align-items-center"
                >
                  <div className="d-flex align-items-center w-100">
                    <img
                      src={expression.imgSrc}
                      alt={expression.label}
                      className="img-thumbnail"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        marginRight: "20px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(expression.imgSrc)} // Make image clickable
                    />
                    <span className="fw-bold text-start flex-grow-1">
                      {expression.label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted">
              Try to replicate the facial expressions shown above and let the system analyze your accuracy and engagement!
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-success btn-lg mt-3"
                onClick={() => navigate("/assist/face")}
              >
                Start Facial Recognition
              </button>
            </div>
          </div>
        )}

        {/* Modal for Enlarged Image */}
        {modalImage && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            onClick={closeModal}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              style={{ maxWidth: "90%" }}
            >
              <div className="modal-content">
                <div className="modal-body text-center p-0">
                  <img
                    src={modalImage}
                    alt="Enlarged Expression"
                    className="img-fluid rounded"
                    style={{ width: "100%" }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-close position-absolute top-0 end-0 m-3"
                  aria-label="Close"
                  onClick={closeModal}
                ></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
