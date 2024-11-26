import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './libs/faceml.css';
import { init } from "../../machinelearning/face.js"; 

export default function AssistFace() {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModel = async () => {
      await init(); // Initializes the model and sets up the webcam
    };
    initializeModel();
  }, []);

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
      </div>
    </div>
  );
}
