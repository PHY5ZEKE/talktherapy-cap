import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from './libs/speechml.module.css';  // Import CSS Module
import { init } from "../../machinelearning/speech.js";
import { startVoiceRecognitionHandler } from '../../machinelearning/speech.js';

export default function AssistSpeech() {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModel = async () => {
      await init();
    };
    initializeModel();
  }, []);

  return (
    <div
      id="offcanvasDiagnosticTool"
      aria-labelledby="offcanvasDiagnosticToolLabel"
      className={styles.container} // Apply scoped container styles
    >
      <div className="container-fluid min-vh-100 d-flex flex-column">
        {/* Header Section */}
        <div className="row justify-content-center py-4">
          <div className="col-12 text-center">
            <h5 className={styles.title} id="offcanvasDiagnosticToolLabel"> {/* Apply scoped title styles */}
              Assistive Diagnostic Tool
            </h5>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="row flex-grow-1 justify-content-center">
          <div className="col-12 col-md-10">
            <div className={`card shadow-lg rounded-lg mb-4 ${styles.card}`}> {/* Apply scoped card styles */}
              <div className={`card-body text-center ${styles.cardBody}`}> {/* Apply scoped card body styles */}
                <div className={styles.chartContainer}> {/* Apply scoped chart container styles */}
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
                  onClick={startVoiceRecognitionHandler}
                >
                  Start Voice Recognition
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
