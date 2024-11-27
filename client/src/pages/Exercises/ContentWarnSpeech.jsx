import React, { useState, useEffect, useContext, Suspense } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate, useParams } from "react-router-dom"; 
import { route } from "../../utils/route";
import { toast } from "react-toastify";

import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

export default function ContentWarnSpeech() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [clinicianData, setClinicianData] = useState(null);
  const [patientData, setPatientData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showInstructions, setShowInstructions] = useState(false);
  
  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  const phonemes = [
    { sound: "/æ/", name: "AH" },
    { sound: "/ɛ/", name: "EH" },
    { sound: "/iː/", name: "EE" },
    { sound: "/uː/", name: "OO" },
    { sound: "/θ/", name: "TH" },
    { sound: "/ʃ/", name: "SH" },
    { sound: "/dʒ/", name: "J" },
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
    setShowInstructions(true); // Show the phoneme instructions
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
              This is an <strong className="text-primary">Assistive Diagnostic Tool for Speech Recognition</strong>. 
              Press "OK" to begin practicing phoneme sounds!
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

        {/* Phoneme Instructions */}
        {showInstructions && (
          <div className="bg-white border rounded-4 p-4 shadow-sm w-75">
            <h4 className="text-secondary">Try these phoneme sounds:</h4>
            <ul className="list-group list-group-flush">
              {phonemes.map((phoneme, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="fw-bold">{phoneme.sound}</span>
                  <span className="text-primary">{phoneme.name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted">
              These are the trained sounds that are recognizable for now! Try to utter the phoneme sounds above, and let the model recognize them and assign a score to your pronunciation accuracy!
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-success btn-lg mt-3"
                onClick={() => navigate("/assist/speech")}
              >
                Start Speech Recognition
              </button>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
