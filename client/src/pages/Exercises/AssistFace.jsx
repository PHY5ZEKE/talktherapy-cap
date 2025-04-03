import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./libs/faceml.css";
import * as faceapi from "face-api.js";

export default function AssistFace() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(true);
  const [latestDetails, setLatestDetails] = useState(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [showHoldPoseMessage, setShowHoldPoseMessage] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    // Stop webcam stream
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  
    navigate(-2);
    setTimeout(() => {
      window.location.reload(); 
    }, 100); 
  };  

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
    return "Lips Together";
  };

  const closeHelpModal = () => setShowHelpModal(false);

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;

    if (!video || !canvas) return;

    // Show "Hold your pose" message
    setShowHoldPoseMessage(true);

    // Hide the message after 5 seconds or after capturing
    setTimeout(() => {
      setShowHoldPoseMessage(false);
    }, 5000);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (detections.length) {
      const detection = detections[0];
      const { age, gender, expressions } = detection;
      const expression = getModifiedExpression(expressions);

      setLatestDetails({
        age: Math.round(age),
        gender,
        expression,
      });

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setHasCaptured(true);
    } else {
      console.log("No faces detected on capture.");
      setLatestDetails(null);
      setHasCaptured(false);
    }
  };

  return (
    <div className="assist-face">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="back-btn"
      >
        <i className="fas fa-arrow-left"></i>
      </button>
  
      {/* Title */}
      <h1 className="title">Assistive Facial Exercise Tool</h1>
  
      {/* Help Modal */}
      {showHelpModal && (
        <div className="help-modal">
          <div className="modal-content">
            <h2>How to Use</h2>
            <p>
              Keep your face within the webcam frame and ensure good lighting.
              A box will appear over your face along with detected expressions.
              Avoid glasses for better accuracy.
            </p>
            <button onClick={closeHelpModal}>Got it</button>
          </div>
        </div>
      )}
  
      {/* Webcam Feed with Overlay */}
      <div className="webcam-card">
        <div className="webcam-container">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="webcam-video"
          />
          <canvas ref={canvasRef} className="webcam-overlay" />
        </div>
      </div>
  
      {/* Capture Button */}
      <button onClick={captureFrame} className="capture-button">
        Capture
      </button>
  
      {/* Hold Pose Message */}
      {showHoldPoseMessage && (
        <p className="hold-pose-message">
          Hold your pose for a few seconds for better accuracy!
        </p>
      )}
  
      {/* Captured Frame */}
      <canvas
        ref={captureCanvasRef}
        className={`capture-canvas ${hasCaptured ? "visible" : ""}`}
      />
  
      {/* Captured Details */}
      {latestDetails && (
        <div className="capture-details">
          <h3>Detection Summary</h3>
          <p><strong>Age:</strong> {latestDetails.age}</p>
          <p><strong>Gender:</strong> {latestDetails.gender}</p>
          <p><strong>Expression:</strong> {latestDetails.expression}</p>
        </div>
      )}
    </div>
  );
}
