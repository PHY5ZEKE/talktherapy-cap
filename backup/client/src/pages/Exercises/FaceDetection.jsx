import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showLandmarks, setShowLandmarks] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      // Load face-api models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models')
      ]);

      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error accessing webcam:', err));
    };

    const detectFaces = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.width, height: video.height };

        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          resizedDetections.forEach((detection) => {
            const { box, age, gender, expressions } = detection.detection;
            const expression = getModifiedExpression(expressions);

            // Draw custom box
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw age, gender, and expression
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(`${Math.round(age)} years`, box.x + 5, box.y + 20);
            ctx.fillText(gender, box.x + 5, box.y + 40);
            ctx.fillText(expression, box.x + 5, box.y + 60);

            // Draw landmarks if toggled
            if (showLandmarks) {
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            }
          });
        }, 100);
      }
    };

    const getModifiedExpression = (expressions) => {
      if (expressions.happy > 0.5) return 'Wide Smile';
      if (expressions.surprised > 0.5) return 'Rounded Lips';
      if (expressions.angry > 0.5) return 'Open Mouth';
      if (expressions.sad > 0.5) return 'Droopy Lips';
      return 'Lips Together';
    };

    loadModels().then(detectFaces);

    return () => {
      // Clean up intervals when component unmounts
      const tracks = videoRef.current?.srcObject?.getTracks();
      if (tracks) {
        tracks.forEach((track) => track.stop());
      }
    };
  }, [showLandmarks]);

  return (
    <div>
      <video
        ref={videoRef}
        id="video"
        width="720"
        height="560"
        autoPlay
        muted
      />
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
      <button
        onClick={() => setShowLandmarks((prev) => !prev)}
        style={{ marginTop: '10px' }}
      >
        {showLandmarks ? 'Hide Face Landmarks' : 'Show Face Landmarks'}
      </button>
    </div>
  );
};

export default FaceDetection;
