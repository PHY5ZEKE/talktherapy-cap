// const URL = "https://talktherapy.site/src/machinelearning/audio_model/";
const URL = "http://localhost:5173/src/machinelearning/audio_model/";
import Chart from 'chart.js/auto';

let recognizer = null;
let isListening = false;
let chart = null;

export async function createModel() {
    if (recognizer) return recognizer;  

    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    recognizer = await window.speechCommands.create(
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

    for (let i = 0; i < 3; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    const ctx = document.getElementById('outputChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1st', '2nd', '3rd'],
            datasets: [{
                label: 'Recognized Sounds',
                data: [0, 0, 0],
                backgroundColor: ['#ff5733', '#33ff57', '#3357ff'],
                borderColor: ['#ff5733', '#33ff57', '#3357ff'],
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

    window.recognizer = recognizer;
    window.classLabels = classLabels;
    window.chart = chart;
    window.labelContainer = labelContainer;
}


export const startVoiceRecognitionHandler = (onComplete) => {
    timedRecognition(
        window.recognizer,
        window.classLabels,
        window.chart,
        window.labelContainer,
        onComplete 
    );
};


async function timedRecognition(recognizer, classLabels, chart, labelContainer, onComplete) {
    const recognitionDuration = 3000;  
    const threshold = 0.80;
    const startTime = Date.now();
    let bestScores = [];

    if (!recognizer) {
        console.error("Recognizer not ready.");
        onComplete(false);
        return;
    }

    if (!classLabels || !Array.isArray(classLabels)) {
        console.error("classLabels is not defined or invalid");
        if (recognizer?.isListening()) {
            recognizer.stopListening();
          }
        onComplete(false);
        return;
      }

    recognizer.listen(result => {
        const scores = result.scores;

        const scoreClassPairs = classLabels.map((label, index) => ({
            score: scores[index],
            label: label
        })).filter(pair => pair.label !== "Background Noise");

        scoreClassPairs.sort((a, b) => b.score - a.score);
        const top3Scores = scoreClassPairs.slice(0, 3);

        for (let i = 0; i < 3; i++) {
            labelContainer.childNodes[i].innerHTML = `${top3Scores[i].label}: ${top3Scores[i].score.toFixed(2)}`;
        }
        chart.data.labels = top3Scores.map(item => item.label);
        chart.data.datasets[0].data = top3Scores.map(item => item.score);
        chart.update();
        bestScores = top3Scores;
        if (top3Scores[0].score >= threshold || Date.now() - startTime >= recognitionDuration) {
            if (recognizer.isListening()) {
                recognizer.stopListening();
              }
            outputTopResults(bestScores);
            const success = bestScores.length > 0 && bestScores[0].score >= 0.5;
            onComplete(success);
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });

    setTimeout(() => {
        if (recognizer.isListening()) {
            recognizer.stopListening();
          }
        outputTopResults(bestScores);
        const success = bestScores.length > 0 && bestScores[0].score >= 0.5;
        onComplete(success);
    }, recognitionDuration);
}



function outputTopResults(topScores) {
    if (topScores.length === 0) return;

    const outputDiv = document.getElementById("output");
    const commentDiv = document.getElementById("comment");
    const scoreOutputDiv = document.getElementById("score-output");
  
    if (!outputDiv || !commentDiv || !scoreOutputDiv) {
      console.warn("DOM elements not available yet.");
      return;
    }

    let resultHTML = "<strong>Recognized Sounds:</strong><br>";
    resultHTML += `1st: ${topScores[0].label} - ${topScores[0].score.toFixed(2)}<br>`;
    if (topScores[1]) resultHTML += `2nd: ${topScores[1].label} - ${topScores[1].score.toFixed(2)}<br>`;
    if (topScores[2]) resultHTML += `3rd: ${topScores[2].label} - ${topScores[2].score.toFixed(2)}<br>`;

    outputDiv.innerHTML = resultHTML;

    let comment = "Did you say the right sound? If yes, good job! ";

    switch (topScores[0].label) {
        case "/iː/ - EE":
            comment += "If you're trying to say EE, it could sound like EH. Focus on clarity!";
            break;
        case "/uː/ - OO":
            comment += "If you're trying to say OO, try rounding your lips more.";
            break;
        case "/æ/ - AH":
            comment += "If you're trying to say AH, it might sound like EH or OH. Keep practicing!";
            break;
        case "/ɛ/ - EH":
            comment += "If you're trying to say EH, it might sound like EE. Focus on emphasizing the EH sound.";
            break;
        case "/ʃ/ - SH":
            comment += "If you're trying to say SH, ensure it doesn't sound like TH. Focus on the sharp SH sound.";
            break;
        case "/θ/ - TH":
            comment += "If you're trying to say TH, make sure it doesn't sound like SH. Focus on the soft TH sound.";
            break;
        case "dʒ":
            comment += "If you're trying to say dʒ, make sure the J sound is clear and voiced.";
            break;
    }

    if (
        (topScores[0].label === "/ʃ/ - SH" && topScores[1]?.label === "/θ/ - TH") ||
        (topScores[0].label === "/θ/ - TH" && topScores[1]?.label === "/ʃ/ - SH")
    ) {
        comment += " <br> It sounds like you're confusing SH and TH. Focus on differentiating the sharpness of SH from the softness of TH.";
    }

    if (
        topScores[0].label === "/iː/ - EE" &&
        topScores[1]?.label === "/ɛ/ - EH" &&
        topScores[1].score >= 0.10
    ) {
        comment += " <br> It sounds like you might be confusing EE with EH.";
    }

    if (
        topScores[0].label === "/æ/ - AH" &&
        topScores[1]?.label === "/ɛ/ - EH" &&
        topScores[1].score >= 0.10
    ) {
        comment += " <br> It sounds like you might be confusing AH with EH.";
    }

    commentDiv.innerHTML = comment;

    assignScore(topScores);

    const finalScore = assignScore(topScores);
    if (window.saveSpeechResultsToDatabase) {
        window.saveSpeechResultsToDatabase(topScores, finalScore);
    }
}


function assignScore(topScores) {
    const scoreOutputDiv = document.getElementById("score-output");

    if (topScores.length === 0) {
        scoreOutputDiv.innerHTML = "No score available.";
        return;
    }

    let score = 0;
    const topPrediction = topScores[0];
    const topScoreValue = topPrediction.score;

    score = Math.floor(topScoreValue * 100);

    if (
        (topPrediction.label === "/ʃ/ - SH" && topScores[1]?.label === "/θ/ - TH") ||
        (topPrediction.label === "/θ/ - TH" && topScores[1]?.label === "/ʃ/ - SH") &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "/iː/ - EE" &&
        topScores[1]?.label === "/ɛ/ - EH" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10;
    } else if (
        topPrediction.label === "/æ/ - AH" &&
        topScores[1]?.label === "/ɛ/ - EH" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10;
    }

    score = Math.max(0, Math.min(100, score));
    scoreOutputDiv.innerHTML = `<div><strong>Score:</strong> ${score}</div>`;
    return score;
}




