import { useEffect, useRef, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import './libs/faceml.css';

import { init, capturePhotoAndRecord, plotRecordedGraph } from "../../machinelearning/face.js";

import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";

export default function AssistFace() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false); 
  const [timer, setTimer] = useState(5);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const canvasRef = useRef(null);

  const appURL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const initializeModel = async () => {
      await init(); 
    };
    initializeModel();
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

  function saveFaceResultsToDatabase( recordedData, topPredictions) {
    const appURL = import.meta.env.VITE_APP_URL;
    if (!accessToken) {
      console.error("Access token is missing");
      return;
    }
  
    
    const progress = {       
      recordedData,         
      topPredictions,       
    };
  
    console.log("Sending face results to backend:", progress);
  
    fetch(`${appURL}/${route.patient.saveFaceAssessment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify(progress),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save face results');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Face results saved successfully:', data);
      })
      .catch((error) => {
        console.error('Error saving face results:', error);
      });
  }

    useEffect(() => {
      window.saveFaceResultsToDatabase = saveFaceResultsToDatabase;

      return () => {
        delete window.saveFaceResultsToDatabase;
      };
    }, []);


  const handleCaptureAndRecord = () => {
    setIsTimerActive(true);
    setTimer(5);
    capturePhotoAndRecord((recordedData, topPredictions) => {
      setIsCaptured(true); 
      
      if (window.saveFaceResultsToDatabase) {
        window.saveFaceResultsToDatabase(recordedData, topPredictions);
      }
    });
  };

  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

 useEffect(() => {
  if (isTimerActive && timer > 0) {
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }
}, [isTimerActive, timer]);

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
    >
      <div className="container-fluid min-vh-100 d-flex flex-column">
        {/* Header Section */}
        <div className="row justify-content-center py-4">
          <div className="col-12 text-center">
            <h5 className="title" id="offcanvasDiagnosticToolLabel">
              Assistive Diagnostic Tool
            </h5>
            {/* Help Button */}
            <button
              className="btn btn-info btn-sm ml-2"
              data-bs-toggle="modal"
              data-bs-target="#helpModal"
            >
              Help
            </button>
          </div>
        </div>


        {/* Help Modal */}
          <div
            className="modal fade assistive-help"
            id="helpModal"
            tabIndex="-1"
            aria-labelledby="helpModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="helpModalLabel">Help</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Press <strong>Capture and Record</strong> and try to hold your pose for 5 seconds.
                  </p>
                  <p>
                    The <strong>Reload Page</strong> button is used to ensure the model resets properly when you want to capture another confidence graph.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Main Content Section */}
        <div className="row flex-grow-1 justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg rounded-lg mb-4 mx-auto">
              <div className="card-body text-center">
                <div id="webcam-container" className="d-flex justify-content-center align-items-center"></div>
                
                {/* Capture Button or Reload based on isCaptured */}
                {!isCaptured ? (
                  <button className="btn btn-primary mt-3" onClick={handleCaptureAndRecord}>
                    Capture and Record
                  </button>
                ) : (
                  <button className="btn btn-danger mt-3" onClick={() => window.location.reload()}>
                    Reload Page
                  </button>
                )}

                {/* Timer for Reload Button */}
                {isTimerActive && timer > 0 && (
                  <p className="mt-2">Loading model: {timer}s</p>
                )}
              </div>
            </div>
          </div>

          {/* Prediction Labels - Chart Display */}
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg rounded-lg mb-4 mx-auto">
              <div className="card-body">
                <canvas id="outputChart" className="w-100"></canvas>
                <div id="label-container" className="text-muted"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section to display captured photo and top scores */}
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg rounded-lg mb-4 mx-auto">
              <div className="card-body text-center">
                <h5>Captured Photo and Top Predictions:</h5>
                <img id="captured-image" className="img-fluid mb-3" alt="Captured Image" src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"/>
                <div id="top-scores" className="mb-3"></div>
                 {/* Placeholder text */}
                  {!isCaptured && (
                    <p className="text-muted">
                      Your captured image and score graph will show here after 5 seconds upon pressing the button.
                    </p>
                  )}
                {/* Score Graph */}
                  <canvas
                    id="scoreGraph"
                    ref={canvasRef}
                    className={isCaptured ? "w-100" : "d-none"}
                  ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
