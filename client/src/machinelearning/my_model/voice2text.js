export async function runSpeechRecognition(setScore) {
    var output = document.getElementById("output");
    var action = document.getElementById("action");
    var phonemeContainer = document.getElementById("phoneme-output"); 
    var scoreOutput = document.getElementById("score-output"); 

    // try {
    //     await import('/src/machinelearning/my_model/pronouncing.js');
    // } catch (error) {
    //     console.error("Error loading pronouncing.js:", error);
    //     return;
    // }
    
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser. Please use Chrome, Firefox, or Edge.");
        return;
    }
    var recognition = new SpeechRecognition();

    recognition.onstart = function () {
        action.innerHTML = "<small>listening...</small>";
    };

    recognition.onspeechend = function () {
        action.innerHTML = "<small>stopped listening</small>";
        recognition.stop();
    };

    recognition.onresult = async function (event) {
        var fullTranscript = '';
        for (var i = 0; i < event.results.length; i++) {
            var transcript = event.results[i][0].transcript;
            fullTranscript += transcript + ' ';
        }

        var finalText = fullTranscript.trim();
        output.innerHTML = "<b>Text:</b> " + finalText;

        // Call function to segment phonemes for the full transcribed text
        segmentPhonemes(finalText);

        // Assess pronunciation for the first word
        var words = finalText.split(' ');
        var firstWord = words.length > 0 ? cleanWord(words[0]) : '';
        var phonemeSequence = window.pronouncing.phonesForWord(firstWord);

        if (phonemeSequence.length > 0) {
            var phonemeArray = phonemeSequence[0].split(" ");
            //displayPhonemes(firstWord, phonemeArray);
            var phonemeContainer = document.getElementById("phoneme-output");
            var phonemeElement = document.createElement("div");
            phonemeElement.innerText = words + ": " + phonemeArray.join(", ");

            // Process the phoneme sequence with ML model for assessment
            const score = await assessPronunciation(finalText, phonemeArray);
            setScore(score);
            console.log("Updated score:", score);
        } else {
            phonemeContainer.innerText = "No phonemes found for the word: " + firstWord;
            setScore({ pronunciationScore: 0, fluencyScore: 0 });
            scoreOutput.innerText = "Unable to assess pronunciation due to lack of phoneme data.";
        }
    };

    recognition.start();
}

export function assessPronunciation(transcript, phonemeArray) {
    const words = transcript.split(' ');
    const firstWord = words.length > 0 ? cleanWord(words[0]) : '';
    const referencePhonemes = window.pronouncing.phonesForWord(firstWord);

    if (referencePhonemes.length === 0) {
        return { pronunciationScore: 0, fluencyScore: 0 }; // No reference phonemes found
    }

    let score = 0;
    referencePhonemes[0].split(" ").forEach((phoneme, i) => {
        if (phoneme === phonemeArray[i]) {
            score += 1;
        }
    });

    const fluencyScore = calculateFluency(); // You can define logic to calculate speech speed, pauses, etc.

    return {
        pronunciationScore: (score / referencePhonemes[0].split(" ").length) * 100, // Normalize score to 100
        fluencyScore: fluencyScore
    };
}

export function calculateFluency() {
    // Implement logic to assess speed, pauses, etc.
    return Math.random() * 100; // Dummy fluency score for now
}

export function displayScore(score) {
    var scoreOutput = document.getElementById("score-output"); // Ensure this element exists in your HTML
    scoreOutput.innerHTML = `Pronunciation: ${score.pronunciationScore.toFixed(2)}%, Fluency: ${score.fluencyScore.toFixed(2)}%`;
}

// Original phoneme segmentation and display functions remain unchanged
export function cleanWord(word) {
    return word.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
}

export function segmentPhonemes(text) {
    if (typeof window.pronouncing === 'undefined') {
        console.error("Pronouncing.js library not loaded.");
        return;
    }
  
    var words = text.split(' ');
    var phonemeContainer = document.getElementById("phoneme-output");
    phonemeContainer.innerHTML = ''; 

    words.forEach(word => {
        var cleanedWord = cleanWord(word);
        var phones = window.pronouncing.phonesForWord(cleanedWord); 
        if (phones.length > 0) {
            var phonemeArray = phones[0].split(" ");
            //displayPhonemes(cleanedWord, phonemeArray);
            var phonemeContainer = document.getElementById("phoneme-output");
            phonemeElement = document.createElement("div");
            phonemeElement.innerText = word + ": " + phonemeArray.join(", ");
            phonemeContainer.appendChild(phonemeElement);
        } else {
            var phonemeElement = document.createElement("div");
            phonemeElement.innerText = cleanedWord + ": No phonemes found";
            phonemeContainer.appendChild(phonemeElement);
        }
    });
}

// export function displayPhonemes(word, phonemeArray) {
//     var phonemeContainer = document.getElementById("phoneme-output");
//     var phonemeElement = document.createElement("div");
//     phonemeElement.innerText = word + ": " + phonemeArray.join(", ");
//     phonemeContainer.appendChild(phonemeElement);
// }
