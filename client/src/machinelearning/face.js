const URL = "https://talktherapy.site/src/machinelearning/faces_model/";
import * as tf from "@tensorflow/tfjs";
import Chart from "chart.js/auto";

let model, webcam, labelContainer, maxPredictions, chartInstance, classLabels;
let isRecording = false;
let recordedData = []; 
let topPredictions = []; 

// Initialize the model
export async function createModel() {
  if (!tf.engine().backendNames().includes("webgl")) {
    alert("WebGL not supported or disabled. Enable it in Safari settings.");
    return;
  }
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await window.tmImage.load(modelURL, metadataURL);
  const metadata = await fetch(metadataURL).then((res) => res.json());

  classLabels = metadata.labels;
  maxPredictions = classLabels.length;

  // Setup webcam
  webcam = new window.tmImage.Webcam(200, 200);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

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

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  const predictionData = prediction.map((p) => p.probability);
  chartInstance.data.datasets[0].data = predictionData;
  chartInstance.update();


  if (isRecording) {
    recordedData.push(
      prediction.map((p, idx) => ({
        label: classLabels[idx], 
        probability: p.probability, 
      }))
    );

    
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
  const capturedImage = webcam.canvas.toDataURL(); 
  document.getElementById("captured-image").src = capturedImage; 


  recordedData = [];
  topPredictions = [];
  isRecording = true;


  setTimeout(() => {
    isRecording = false;
    displayTopScores();
    plotRecordedGraph();


    if (callback) {
      callback(recordedData, topPredictions); 
    }
  }, 5000);
}


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



export function plotRecordedGraph() {
  const canvasElement = document.getElementById("scoreGraph");

  if (!canvasElement) {
    console.error("Canvas element with ID 'scoreGraph' not found.");
    return;
  }
  const ctx = canvasElement.getContext("2d");
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (canvasElement.chart) {
      canvasElement.chart.destroy();
      canvasElement.chart = null; 
    }
  
    if (Chart.instances.length > 0) {
      Chart.instances.forEach((instance) => {
        instance.destroy();
      });
    }
  
  const labels = Array.from({ length: recordedData.length }, (_, index) => index + 1);

  const datasets = classLabels.map((label, idx) => ({
    label,
    data: recordedData.map((timeStep) => timeStep.find((data) => data.label === label)?.probability || 0),
    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
    borderWidth: 1,
  }));

  if (Chart.instances.length > 0) {
    Chart.instances.forEach((instance) => instance.destroy());
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels, 
      datasets, 
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

export async function init() {
  await createModel();
}
