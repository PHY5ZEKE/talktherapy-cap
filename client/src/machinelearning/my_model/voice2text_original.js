function runSpeechRecognition() {
    var output = document.getElementById("output");
    var action = document.getElementById("action");
    var labelContainer = document.getElementById("label-container");

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

    recognition.onresult = function (event) {
        var fullTranscript = '';
        for (var i = 0; i < event.results.length; i++) {
            var transcript = event.results[i][0].transcript;
            fullTranscript += transcript + ' ';
        }

        var finalText = fullTranscript.trim();
        output.innerHTML = "<b>Text:</b> " + finalText;

        // Call function to segment phonemes for the full transcribed text
        segmentPhonemes(finalText);
    };

    recognition.start();
}

function cleanWord(word) {
    return word.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
}

function segmentPhonemes(text) {
    if (typeof pronouncing === 'undefined') {
        console.error("Pronouncing.js library not loaded.");
        return;
    }
    
    var words = text.split(' '); 
    var phonemeContainer = document.getElementById("label-container");
    phonemeContainer.innerHTML = ''; 

    words.forEach(word => {
        var cleanedWord = cleanWord(word);
        var phones = pronouncing.phonesForWord(cleanedWord); 
        if (phones.length > 0) {
            var phonemeArray = phones[0].split(" "); 
            displayPhonemes(cleanedWord, phonemeArray);
        } else {
            var phonemeElement = document.createElement("div");
            phonemeElement.innerText = cleanedWord + ": No phonemes found";
            phonemeContainer.appendChild(phonemeElement);
        }
    });
}

function displayPhonemes(word, phonemeArray) {
    var phonemeContainer = document.getElementById("label-container");

    var phonemeElement = document.createElement("div");
    phonemeElement.innerText = word + ": " + phonemeArray.join(", ");
    phonemeContainer.appendChild(phonemeElement);
}