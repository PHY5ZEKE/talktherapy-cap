import React, { useEffect, useRef, useState } from "react";
import "./libs/faceml.css";
import * as faceapi from "face-api.js";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

export default function AssistFace() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [emotionData, setEmotionData] = useState({
    RoundedLips: 0,
    WideSmile: 0,
    OpenMouth: 0,
    DroopyLips: 0,
    Neutral: 0,
  });

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
          .withFaceExpressions();

        if (!detections.length) {
          console.log("No faces detected.");
          return;
        }

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const { expressions } = detection;
          updateEmotionData(expressions);
        });
      }, 100);

      return () => clearInterval(intervalId);
    };

    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("play", handlePlay);
    };
  });

  const updateEmotionData = (expressions) => {
    setEmotionData({
      RoundedLips: expressions.surprised || 0,
      WideSmile: expressions.happy || 0,
      OpenMouth: expressions.angry || 0,
      DroopyLips: expressions.sad || 0,
      Neutral: 1 - (expressions.surprised + expressions.happy + expressions.angry + expressions.sad),
    });
  };

  const chartData = {
    labels: ["Rounded Lips", "Wide Smile", "Open Mouth", "Droopy Lips", "Neutral"],
    datasets: [
      {
        label: "Emotions",
        data: Object.values(emotionData),
        backgroundColor: ["#4FC3F7", "#29B6F6", "#0288D1", "#0277BD", "#01579B"],
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="assist-face">
      <h1 className="title">Assistive Facial Exercise Tool</h1>
      <div className="webcam-card">
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
      </div>
      {loadingModels && <p className="loading">Loading face-api.js models...</p>}
      <div className="chart-container">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
}
