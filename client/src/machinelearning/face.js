const URL = "https://talktherapy.site/src/machinelearning/face_model/";
import * as tf from '@tensorflow/tfjs';
import Chart from 'chart.js/auto';

let model, webcam, labelContainer, maxPredictions, chartInstance, classLabels;

export async function createModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model and metadata
  model = await window.tmImage.load(modelURL, metadataURL);
  const metadata = await fetch(metadataURL).then(res => res.json());

  // Extract class labels from metadata
  classLabels = metadata.labels; 
  maxPredictions = classLabels.length;

  // Setup webcam
  const flip = true;
  webcam = new window.tmImage.Webcam(200, 200, flip); 
  await webcam.setup(); 
  await webcam.play();  
  window.requestAnimationFrame(loop);

  // Append webcam canvas to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  // Initialize labelContainer for chart rendering
  labelContainer = document.getElementById("label-container");

  // Create a chart instance to visualize the predictions
  const ctx = document.getElementById("outputChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: classLabels, 
      datasets: [{
        label: 'Prediction Probability',
        data: Array(maxPredictions).fill(0), 
        backgroundColor: 'rgba(0, 123, 255, 0.6)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1
        }
      }
    }
  });
}

async function loop() {
  webcam.update(); 
  await predict(); 
  window.requestAnimationFrame(loop); 
}

// Run the webcam image through the image model
async function predict() {
  const prediction = await model.predict(webcam.canvas);

  const predictionData = prediction.map(p => p.probability);


  chartInstance.data.datasets[0].data = predictionData;
  chartInstance.update(); 
}

export async function init() {
  await createModel();
}
