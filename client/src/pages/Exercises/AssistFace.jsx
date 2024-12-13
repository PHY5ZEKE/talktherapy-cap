import React, { useEffect, useRef, useState } from "react";
import "./libs/faceml.css";
import * as faceapi from "face-api.js";
import useLoadTensorFlow from '../../pages/Exercises/libs/useLoadTensorFlow.js';

export default function AssistFace() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(true);
  useLoadTensorFlow(false); 

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPath = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
          faceapi.nets.ageGenderNet.loadFromUri(modelPath),
        ]);
        startVideo();
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setLoadingModels(false);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    };

    loadModels();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
  
    if (!video || !canvas) return;
  
    const handlePlay = () => {
      // Ensure canvas matches video size
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
  
      const intervalId = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();
  
        if (!detections.length) {
          console.log("No faces detected.");
          return;
        }
  
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
  
        resizedDetections.forEach((detection) => {
          // Draw bounding box and details
          const { age, gender, expressions } = detection;
          const { x, y, width, height } = detection.detection.box;
  
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
  
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(`${Math.round(age)} yrs`, x + 5, y - 10);
          ctx.fillText(gender, x + 5, y + 20);
  
          const expression = getModifiedExpression(expressions);
          ctx.fillText(expression, x + 5, y + 40);
        });
      }, 100);
  
      return () => clearInterval(intervalId);
    };
  
    video.addEventListener("play", handlePlay);
  
    return () => {
      video.removeEventListener("play", handlePlay);
    };
  });

  const getModifiedExpression = (expressions) => {
    if (expressions.happy > 0.5) return "Wide Smile";
    if (expressions.surprised > 0.5) return "Rounded Lips";
    if (expressions.angry > 0.5) return "Open Mouth";
    if (expressions.sad > 0.5) return "Droopy Lips";
    return "Neutral";
  };

  const closeHelpModal = () => setShowHelpModal(false);

  return (
    <div className="assist-face">
      <h1 className="title">Assistive Facial Exercise Tool</h1>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="help-modal">
          <div className="modal-content">
            <h2>How to Use</h2>
            <p>
              Keep your face within the entire canvas frame and ensure good lighting for the model to recognize your face. 
              If detected, a box will appear over your face along with the appropriate facial expression detection. 
              Note: Wearing glasses may affect the model's accuracy.
            </p>
            <button onClick={closeHelpModal}>Got it</button>
          </div>
        </div>
      )}

      <div className="webcam-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="webcam-video"
        ></video>
        <canvas ref={canvasRef} className="webcam-overlay" />
      </div>
      {loadingModels && <p>Loading face-api.js models...</p>}
    </div>
  );
}
