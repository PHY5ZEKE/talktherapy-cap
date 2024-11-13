const URL = "https://talktherapy.site/src/machinelearning/my_model/";
import * as tf from '@tensorflow/tfjs'; 
import Chart from 'chart.js/auto';

// async function loadModel() {
//     try {
//       const checkpointURL = URL + "model.json";
//       const metadataURL = URL + "metadata.json";
  
//       const recognizer = await window.speechCommands.create(
//         "BROWSER_FFT", 
//         undefined, 
//         checkpointURL, 
//         metadataURL
//       );
  
//       await recognizer.ensureModelLoaded();
//       console.log("Model loaded from production URL");
//       return recognizer;
//     } catch (error) {
//       console.warn("Failed to load from production URL, switching to localhost:", error);
  
//       URL = "http://localhost:5173/src/machinelearning/my_model/";
//       try {
//         const checkpointURL = URL + "model.json";
//         const metadataURL = URL + "metadata.json";
  
//         const recognizer = await window.speechCommands.create(
//           "BROWSER_FFT", 
//           undefined, 
//           checkpointURL, 
//           metadataURL
//         );
  
//         await recognizer.ensureModelLoaded();
//         console.log("Model loaded from localhost URL");
//         return recognizer;
//       } catch (error) {
//         console.error("Failed to load model from both URLs:", error);
//         throw error;
//       }
//     }
//   }


export async function createModel() {
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const recognizer = await window.speechCommands.create(
        "BROWSER_FFT", 
        undefined, 
        checkpointURL, 
        metadataURL
    );

    await recognizer.ensureModelLoaded();

    return recognizer;
}

export async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels();
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = '';

    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    const ctx = document.getElementById('outputChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classLabels,
            datasets: [{
                label: 'Prediction Scores',
                data: new Array(classLabels.length).fill(0),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    recognizer.listen(result => {
        const scores = result.scores;
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
            chart.data.datasets[0].data[i] = scores[i];
        }
        chart.update();
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
}
