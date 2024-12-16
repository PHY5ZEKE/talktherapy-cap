import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './libs/speechml.module.css'; 

import { init, startVoiceRecognitionHandler } from "../../machinelearning/speech.js";

import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";

export default function AssistSpeech() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [patientData, setPatientData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [buttonText, setButtonText] = useState("Start Voice Recognition");

  const appURL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const initializeModel = async () => {
      await init();
    };
    initializeModel();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      // Cleanup global script when no longer needed
      document.body.removeChild(script);
    };
  }, []);

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
            setLoading(false);
            return;
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

  // Function to send speech results to the backend
  function saveSpeechResultsToDatabase(top3Results, finalScore) {
    const appURL = import.meta.env.VITE_APP_URL;
    if (!accessToken) {
      console.error("Access token is missing");
      return;
    }

    const progress = {
      top3Results, 
      score: finalScore, 
    };

    console.log("Sending speech results to backend:", progress);
    fetch(`${appURL}/${route.patient.saveAssessment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify(progress),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save speech results');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Speech results saved successfully:', data);
      })
      .catch((error) => {
        console.error('Error saving speech results:', error);
      });
  }

  useEffect(() => {
    window.saveSpeechResultsToDatabase = saveSpeechResultsToDatabase;

    return () => {
      delete window.saveSpeechResultsToDatabase;
    };
  }, [accessToken]);

  // if (loading) {
  //   return (
  //     <div className="d-flex align-items-center justify-content-center vh-100">
  //       <div className="spinner-border text-primary" role="status">
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

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
    <div
      id="offcanvasDiagnosticTool"
      aria-labelledby="offcanvasDiagnosticToolLabel"
      className={styles.container} 
    >
      <div className="container-fluid min-vh-100 d-flex flex-column">
        {/* Header Section */}
        <div className="row justify-content-center py-4">
          <div className="col-12 text-center">
            <h5 className={styles.title} id="offcanvasDiagnosticToolLabel"> 
              Assistive Diagnostic Tool
            </h5>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="row flex-grow-1 justify-content-center">
          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}> 
              <div className={`card-body text-center ${styles.cardBody}`}> 
                <div className={styles.chartContainer}> 
                  <canvas id="outputChart" className="w-100"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body text-center ${styles.cardBody}`}>
                <button
                className="btn btn-primary btn-lg w-100 py-3"
                onClick={() =>
                  startVoiceRecognitionHandler(setButtonText)
                }
              >
                {buttonText}
              </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <div id="output" className="mb-3"></div>
                <span id="action" className="text-muted"></span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <div id="phoneme-container" className="mb-3">
                  <div id="comment" className="text-muted"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <h6 className="mb-3">Speech Assessment Scores:</h6>
                <div id="score-output" className="d-flex justify-content-between text-center"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Label Container */}
        <div id="label-container" className="visually-hidden"></div>
      </div>
    </div>
  );
}
