import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/containers.css";
import "../../styles/diagnostic.css";

import { runSpeechRecognition } from "../../machinelearning/my_model/voice2text.js";
import { init } from "../../machinelearning/script.js";


export default function ML() {
  const navigate = useNavigate();
  const [type, setType] = useState("");

  const [speechScore, setSpeechScore] = useState({
    pronunciationScore: 0,
    fluencyScore: 0,
  });

  useEffect(() => {
    const initializeModel = async () => {
      await init();
    };
    initializeModel();
  }, []);

  const startVoiceRecognitionHandler = () => {
    runSpeechRecognition(setSpeechScore);
  };

  return (
<>
  <div
    className="centered-diagnostic-tool"
    id="offcanvasDiagnosticTool"
    aria-labelledby="offcanvasDiagnosticToolLabel"
  >
    <div className="header">
      <h5 className="title" id="offcanvasDiagnosticToolLabel">
        Assistive Diagnostic Tool
      </h5>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
      ></button>
    </div>

    <div className="body">
      <div className="button-container">
        <button className="text-button border" onClick={startVoiceRecognitionHandler}>
          Start Voice Recognition
        </button>
      </div>

      <div className="chart-container">
        <div id="chartContainer">
          <canvas id="outputChart"></canvas>
        </div>
      </div>

      <div className="controls-container">
        <div className="cardbox">
          <div id="output"></div>
          <span id="action"></span>
        </div>
      </div>

      <div id="phoneme-container">
        <div id="phoneme-output"></div>
      </div>

      <div id="score-container">
        <h6>Speech Assessment Scores:</h6>
        <div id="score-output">
          Pronunciation: {speechScore.pronunciationScore.toFixed(2)}%, Fluency: {speechScore.fluencyScore.toFixed(2)}%
        </div>
      </div>

      {/* <div id="label-container"></div> */}
    </div>
  </div>
</>
  );
}
