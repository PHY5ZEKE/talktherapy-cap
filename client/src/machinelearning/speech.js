const URL = "https://talktherapy.site/src/machinelearning/my_model/";
import * as tf from '@tensorflow/tfjs'; 
import Chart from 'chart.js/auto';

let recognizer = null;
let isListening = false;

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
    const chart = new Chart(ctx, {
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


export const startVoiceRecognitionHandler = () => {
    timedRecognition(window.recognizer, window.classLabels, window.chart, window.labelContainer);
};


async function timedRecognition(recognizer, classLabels, chart, labelContainer) {
    const recognitionDuration = 3000;  
    const threshold = 0.80;
    const startTime = Date.now();
    let bestScores = [];

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
            recognizer.stopListening();
            outputTopResults(bestScores);
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });

    setTimeout(() => {
        recognizer.stopListening();
        outputTopResults(bestScores);
    }, recognitionDuration);
}



function outputTopResults(topScores) {
    if (topScores.length === 0) return;


    const outputDiv = document.getElementById("output");
    const commentDiv = document.getElementById("comment");
    
    let resultHTML = "<strong>Recognized Sounds:</strong><br>";
    resultHTML += `1st: ${topScores[0].label} - ${topScores[0].score.toFixed(2)}<br>`;
    if (topScores[1]) resultHTML += `2nd: ${topScores[1].label} - ${topScores[1].score.toFixed(2)}<br>`;
    if (topScores[2]) resultHTML += `3rd: ${topScores[2].label} - ${topScores[2].score.toFixed(2)}<br>`;
    
    outputDiv.innerHTML = resultHTML;

    let comment = "Did you say the right sound? If yes, good job! ";

    if (topScores[0].label === "AH") {
        comment += "If you're trying to say AH, it might sound like OH. Keep trying!";
    } else if (topScores[0].label === "EE") {
        comment += "If you're trying to say EE, it could sound like AY. Focus on clarity!";
    } else if (topScores[0].label === "OH") {
        comment += "If you're trying to say OH, it might sound like AH. Keep practicing!";
    } else if (topScores[0].label === "EH") {
        comment += "If you're trying to say EH, it could sound like EE. Keep working on your pronunciation!";
    } else if (topScores[0].label === "KK") {
        comment += "If you're trying to say KK, focus on the hard K sound.";
    } else if (topScores[0].label === "LL") {
        comment += "If you're trying to say LL, make sure to emphasize the 'L' sound clearly.";
    } else if (topScores[0].label === "MM") {
        comment += "If you're trying to say MM, make sure your lips are closed while pronouncing it.";
    } else if (topScores[0].label === "OO") {
        comment += "If you're trying to say OO, try rounding your lips more.";
    } else if (topScores[0].label === "RR") {
        comment += "If you're trying to say RR, ensure that you're rolling the sound properly.";
    } else if (topScores[0].label === "TT") {
        comment += "If you're trying to say TT, make sure the T sound is clear and crisp.";
    }

    if (topScores[0].label === "EE" && topScores[1] && topScores[1].label === "EH" && topScores[1].score >= 0.10) {
        comment += " <br> It sounds like you might be confusing EE with EH.";
    }

    if (topScores[0].label === "AH" && topScores[1] && topScores[1].label === "OH" && topScores[1].score >= 0.10) {
        comment += " <br> It sounds like you might be confusing AH with OH.";
    }

    if (topScores[0].label === "BB" && topScores[1] && topScores[1].label === "MM" && topScores[1].score >= 0.10) {
        comment += " <br> It sounds like you might be confusing BB with MM.";
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
        topPrediction.label === "EE" &&
        topScores[1] && topScores[1].label === "EH" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "AH" &&
        topScores[1] && topScores[1].label === "OH" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10;
    } else if (
        topPrediction.label === "OH" &&
        topScores[1] && topScores[1].label === "OO" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "BB" &&
        topScores[1] && topScores[1].label === "MM" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "RR" &&
        topScores[1] && topScores[1].label === "TT" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "LL" &&
        topScores[1] && topScores[1].label === "RR" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    } else if (
        topPrediction.label === "OO" &&
        topScores[1] && topScores[1].label === "OH" &&
        topScores[1].score >= 0.10
    ) {
        score -= 10; 
    }

    score = Math.max(0, Math.min(100, score));
    scoreOutputDiv.innerHTML = `<div><strong>Score:</strong> ${score}</div>`;
    return score;
}




