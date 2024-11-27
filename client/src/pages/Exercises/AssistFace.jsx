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

  function saveFaceResultsToDatabase(capturedImage, recordedData, topPredictions) {
    const appURL = import.meta.env.VITE_APP_URL;
    if (!accessToken) {
      console.error("Access token is missing");
      return;
    }
  
    // Construct the progress object to send
    const progress = {
      capturedImage,        // The captured image in base64 format
      recordedData,         // The recorded data (probabilities) over time
      topPredictions,       // The top predictions (array of top 2 predictions)
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
  // Assign the save function to window so it's accessible globally
    useEffect(() => {
      window.saveFaceResultsToDatabase = saveFaceResultsToDatabase;

      return () => {
        delete window.saveFaceResultsToDatabase;
      };
    }, []);


  const handleCaptureAndRecord = () => {
    // Capture the photo and start recording capturedImage, 
    capturePhotoAndRecord((capturedImage, recordedData, topPredictions) => {
      console.log("Data captured and recorded, ready to save to database.");
      
      // Now call saveFaceResultsToDatabase with the necessary data
      if (window.saveFaceResultsToDatabase) {
        window.saveFaceResultsToDatabase(capturedImage, recordedData, topPredictions);
      }
    });
  };

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
          </div>
        </div>

        {/* Main Content Section */}
        <div className="row flex-grow-1 justify-content-center">
          {/* Webcam and video display */}
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg rounded-lg mb-4 mx-auto">
              <div className="card-body text-center">
                <div
                  id="webcam-container"
                  className="d-flex justify-content-center align-items-center"
                >
                  {/* Webcam feed will be appended here by the face.js model */}
                </div>
                <button 
                  className="btn btn-primary mt-3" 
                  onClick={handleCaptureAndRecord} // Attach the updated handler
                >
                  Capture and Record
                </button>
                {/* Reload button */}
                <button 
                  className="btn btn-danger mt-3" 
                  onClick={() => window.location.reload()} // Trigger page reload
                >
                  Reload Page
                </button>
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
                <img id="captured-image" className="img-fluid mb-3" alt="Captured Image" />
                <div id="top-scores" className="mb-3"></div>
                <canvas id="scoreGraph" ref={canvasRef} className="w-100"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
