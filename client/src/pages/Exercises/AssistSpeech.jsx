import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './libs/speechml.module.css'; 

import { init, startVoiceRecognitionHandler } from "../../machinelearning/speech.js";

import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function AssistSpeech() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [patientData, setPatientData] = useState(null);

  const [hasRecognized, setHasRecognized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [buttonText, setButtonText] = useState("Start Voice Recognition");

  const appURL = import.meta.env.VITE_APP_URL;

  const handleBack = () => {
    if (window.recognizer?.isListening()) {
      window.recognizer.stopListening();
    }

    if (window.chart) {
      window.chart.destroy();
      window.chart = null; 
    }

    const tfScript = document.querySelector('script[src*="tfjs"]');
    if (tfScript) tfScript.remove();
  
    const speechCommandScript = document.querySelector('script[src*="speech-commands"]');
    if (speechCommandScript) speechCommandScript.remove();
  
    navigate(-2);
    setTimeout(() => {
      window.location.reload(); 
    }, 100); 
  };
  

  useEffect(() => {
    const loadAllScriptsAndInit = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
  
        // ✅ Ensure TensorFlow.js is fully loaded and initialized
        const waitForTF = () =>
          new Promise((resolve) => {
            const check = () => {
              if (window.tf && window.tf.engine) resolve();
              else setTimeout(check, 50);
            };
            check();
          });
  
        await waitForTF(); // Wait for tf to be ready
  
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js");
  
        // Wait until the DOM is ready to mount Chart
        const chartReady = () => !!document.getElementById("outputChart");
        while (!chartReady()) {
          await new Promise((res) => setTimeout(res, 100));
        }
  
        const { init } = await import("../../machinelearning/speech.js");
        await init();
      } catch (err) {
        console.error("Speech model load/init error:", err);
      }
    };
  
    loadAllScriptsAndInit();
  }, []);

  // useEffect(() => {
  //   const initializeSpeech = async () => {
  //     try {
  //       await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
  //       await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js");
  
  //       // Only now that tf and speechCommands are available, import speech.js
  //       const { init } = await import("../../machinelearning/speech.js");
  //       await init();
  //     } catch (err) {
  //       console.error("Speech model load error:", err);
  //     }
  //   };
  
  //   initializeSpeech();
  // }, []);


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
      <button
        onClick={handleBack}
        className="btn btn-primary position-absolute top-0 start-0 m-3 d-flex align-items-center justify-content-center"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          fontSize: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderColor: '#007bff',
          zIndex: 9999
        }}
      >
        <i className="fas fa-arrow-left"></i>
      </button>
  
      <div className="container-fluid min-vh-100 d-flex flex-column">
        {/* Header */}
        <div className="row justify-content-center py-4">
          <div className="col-12 text-center">
            <h5 className={styles.title} id="offcanvasDiagnosticToolLabel">
              Assistive Diagnostic Tool
            </h5>
          </div>
        </div>
  
        {/* Main */}
        <div className="row flex-grow-1 justify-content-center">
          {/* Chart */}
          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body text-center ${styles.cardBody}`}>
                <div className={styles.chartContainer}>
                  <canvas id="outputChart" className="w-100"></canvas>
                </div>
              </div>
            </div>
          </div>
  
          {/* Control Button */}
          <div className="col-12 col-md-6">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body text-center ${styles.cardBody}`}>
                <button
                  className="btn btn-primary btn-lg w-100 py-3"
                  onClick={() => {
                    setButtonText("Listening...");
                    startVoiceRecognitionHandler((status) => {
                      setButtonText(status ? "Start Voice Recognition" : "Try Again");
                      if (status) setHasRecognized(true);
                    });
                  }}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
  
          {/* After Recognition */}
          <div className={`col-12 col-md-10 ${hasRecognized ? 'fade-in' : 'invisible'}`}>
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <div id="output" className="mb-3"></div>
                <span id="action" className="text-muted"></span>
              </div>
            </div>
          </div>
  
          <div className={`col-12 col-md-10 ${hasRecognized ? 'fade-in' : 'invisible'}`}>
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <div id="phoneme-container" className="mb-3">
                  <div id="comment" className="text-muted"></div>
                </div>
              </div>
            </div>
          </div>
  
          <div className={`col-12 col-md-10 ${hasRecognized ? 'fade-in' : 'invisible'}`}>
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}>
              <div className={`card-body ${styles.cardBody}`}>
                <h6 className="mb-3 text-primary fw-bold">Speech Assessment Scores</h6>
                <div id="score-output" className="d-flex justify-content-between text-center"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Hidden Labels */}
        <div id="label-container" className="visually-hidden"></div>
      </div>
    </div>
  );
}
