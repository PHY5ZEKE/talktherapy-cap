import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import './libs/speechml.css';

import { init } from "../../machinelearning/speech.js";
import { startVoiceRecognitionHandler } from '../../machinelearning/speech.js';


export default function AssistFace() {
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
  >
          <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100">

  <div className="header text-center mb-4 w-100">
    <h5 className="title" id="offcanvasDiagnosticToolLabel">
      Assistive Diagnostic Tool
    </h5>
  </div>


  <div className="row w-100 justify-content-center mb-4">
    <div className="col-12 col-md-8">
      <div className="card shadow-lg rounded-lg">
        <div className="card-body text-center">
          <div id="chartContainer">
            <canvas id="outputChart" className="w-100"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div className="row w-100 justify-content-center mb-4">
    <div className="col-12 col-md-6">
      <div className="card shadow-lg rounded-lg">
        <div className="card-body text-center">
          <button
            className="btn btn-primary btn-lg w-100 py-3"
            onClick={startVoiceRecognitionHandler}
          >
            Start Voice Recognition
          </button>
        </div>
      </div>
    </div>
  </div>


  <div className="row w-100 justify-content-center mb-4">
    <div className="col-12 col-md-8">
      <div className="card shadow-lg rounded-lg">
        <div className="card-body">
          <div id="output" className="mb-3"></div>
          <span id="action" className="text-muted"></span>
        </div>
      </div>
    </div>
  </div>

  <div className="row w-100 justify-content-center mb-4">
    <div className="col-12 col-md-8">
      <div className="card shadow-lg rounded-lg">
        <div className="card-body">
          <div id="phoneme-container" className="mb-3">
            <div id="comment" className="text-muted"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="row w-100 justify-content-center mb-4">
    <div className="col-12 col-md-8">
      <div className="card shadow-lg rounded-lg">
        <div className="card-body">
          <h6 className="mb-3">Speech Assessment Scores:</h6>
          <div id="score-output" className="d-flex justify-content-between text-center">
          </div>
        </div>
      </div>
    </div>
  </div>


  <div id="label-container" className="visually-hidden"></div>
</div>
  </div>
  );
}
