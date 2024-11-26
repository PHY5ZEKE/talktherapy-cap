const URL = "https://talktherapy.site/src/machinelearning/my_model/";
import * as tf from '@tensorflow/tfjs'; 
import Chart from 'chart.js/auto';

let model, webcam, labelContainer, maxPredictions;
let chart, chartData, chartOptions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }

    setupChart();
  }



  function setupChart() {
    const ctx = document.getElementById("predictionChart").getContext("2d");
    chartData = {
      labels: [], // class names
      datasets: [{
        label: 'Probability',
        data: [], // probabilities
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
    chartOptions = {
      indexAxis: 'y', // This makes the chart horizontal
      scales: {
        x: {
          beginAtZero: true,
          max: 1
        }
      }
    };
    chart = new Chart(ctx, {
      type: 'bar', // Horizontal bar chart
      data: chartData,
      options: chartOptions
    });
  }

  async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }

  async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    updateChart(prediction);
  }

  function updateChart(prediction) {
    chartData.labels = prediction.map(p => p.className);
    chartData.datasets[0].data = prediction.map(p => p.probability);
    chart.update();
  }