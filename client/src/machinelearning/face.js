const URL = "http://localhost:5173/src/machinelearning/face_model/";
import * as tf from "@tensorflow/tfjs";
import Chart from "chart.js/auto";

let model, webcam, labelContainer, maxPredictions, chartInstance, classLabels;
let isRecording = false;
let recordedData = []; // Store probabilities over 10 seconds
let topPredictions = []; // Track top predictions

// Initialize the model
export async function createModel() {
  if (!tf.engine().backendNames().includes("webgl")) {
    alert("WebGL not supported or disabled. Enable it in Safari settings.");
    return;
  }
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model and metadata
  model = await window.tmImage.load(modelURL, metadataURL);
  const metadata = await fetch(metadataURL).then((res) => res.json());

  // Extract class labels from metadata
  classLabels = metadata.labels;
  maxPredictions = classLabels.length;

  // Setup webcam
  webcam = new window.tmImage.Webcam(200, 200);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

  // Create a chart instance to visualize the live predictions
  const ctx = document.getElementById("outputChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: classLabels,
      datasets: [
        {
          label: "Prediction Probability",
          data: Array(maxPredictions).fill(0),
          backgroundColor: "rgba(0, 123, 255, 0.6)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });
}

// Continuous loop for live predictions
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

// Run predictions on the webcam feed
async function predict() {
  const prediction = await model.predict(webcam.canvas);

  // Update live chart
  const predictionData = prediction.map((p) => p.probability);
  chartInstance.data.datasets[0].data = predictionData;
  chartInstance.update();

  // Record data during active recording
  if (isRecording) {
    recordedData.push(prediction.map((p) => p.probability));

    // Keep track of top predictions
    const currentTopPredictions = prediction
      .map((p, idx) => ({
        label: classLabels[idx],
        probability: p.probability,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2);

    topPredictions = currentTopPredictions;
  }
}

// Capture a photo and start recording predictions for 10 seconds
export function capturePhotoAndRecord(callback) {
  // Capture photo
  const capturedImage = webcam.canvas.toDataURL(); // Capture as base64
  document.getElementById("captured-image").src = capturedImage; // Display image

  // Clear previous data
  recordedData = [];
  topPredictions = [];
  isRecording = true;

  // Stop recording after 5 seconds and plot results
  setTimeout(() => {
    isRecording = false;
    displayTopScores();
    plotRecordedGraph();

    // Now call saveFaceResultsToDatabase and pass the necessary data
    if (callback) {
      callback(capturedImage, recordedData, topPredictions); // Pass data to the callback
    }
  }, 5000);
}

// Display top 2 scores from the recorded data
export function displayTopScores() {
  const topScoresElement = document.getElementById("top-scores");
  if (topPredictions.length === 0) {
    topScoresElement.innerHTML = "<p>No data recorded.</p>";
    return;
  }

  topScoresElement.innerHTML = topPredictions
    .map(
      (p, idx) =>
        `<p>Top Prediction ${idx + 1}: ${p.label} - ${(p.probability * 100).toFixed(2)}%</p>`
    )
    .join("");
}

// Plot the recorded data over 10 seconds
export function plotRecordedGraph() {
  const canvasElement = document.getElementById("scoreGraph");

  // Check if canvas exists in the DOM
  if (!canvasElement) {
    console.error("Canvas element with ID 'scoreGraph' not found.");
    return;
  }

  const ctx = canvasElement.getContext("2d");
  
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Destroy the previous chart instance, if any
    if (canvasElement.chart) {
      canvasElement.chart.destroy();
      canvasElement.chart = null; // Clean up the reference
    }
  
    // Destroy all Chart instances (if any) in the global Chart registry
    if (Chart.instances.length > 0) {
      Chart.instances.forEach((instance) => {
        instance.destroy();
      });
    }
  
  const labels = Array.from({ length: recordedData.length }, (_, index) => index + 1);

  const datasets = classLabels.map((label, idx) => ({
    label,
    data: recordedData.map((scores) => scores[idx]), // Map scores for this label
    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
    borderWidth: 1,
  }));

  // Destroy the previous chart instance, if any
  if (Chart.instances.length > 0) {
    Chart.instances.forEach((instance) => instance.destroy());
  }

  //const ctx = document.getElementById("scoreGraph").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels, // Time points
      datasets, // Data for each class label
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });
}

// Re-initialize the model
export async function init() {
  await createModel();
}
