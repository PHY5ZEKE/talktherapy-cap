let initialized = false;

function initializeExercise(loadedProgress = null) {

    localStorage.removeItem('speech-current-text');
    localStorage.removeItem('patient-progress');

    if (initialized) {
        console.log("Exercise already initialized");
        return;
      }
    initialized = true;
   
    var progress = loadedProgress || {
        textId: null,
        textName: "",
        currentPhrase: 0,
        correctCount: 0,
        totalPhrases: 0,
        completed: false,
        completedPhrases: [],
    };


	 if (typeof speechSynthesis === 'undefined') {
        console.warn('speechSynthesis API is not available.');
    }

    if (typeof webkitSpeechRecognition === 'undefined') {
        console.warn('webkitSpeechRecognition API is not available.');
    }

    if (typeof speechSynthesis === 'undefined' || typeof webkitSpeechRecognition === 'undefined') {
        console.warn('Required APIs are not available.');
        return;
    }

    function setPage(page) {
        var audioElements = document.querySelectorAll('audio');
        audioElements.forEach($e => $e.pause());
        var pages = document.querySelectorAll('.page');
        pages.forEach($e => $e.removeAttribute('current'));
        var targetPage = document.querySelector('#page-' + page);
        if (targetPage) targetPage.setAttribute('current', true);
    }
	window.setPage = setPage;

    var texts, homophones;
    var current_phrase_no, nextPhraseTimer;
    var $success = new Audio('/src/pages/Exercises/libs/correct.mp3');

    Promise.all(['/src/pages/Exercises/libs/texts.txt', '/src/pages/Exercises/libs/homophones.txt'].map(f => fetch(f).then(res => res.text())))
        .then(function(res) {
            texts = parseTexts(res[0]);
            homophones = parseHomophones(res[1]);


            if (!localStorage.getItem('speech-current-text')) {
                localStorage.setItem('speech-current-text', Object.keys(texts)[0]); 
            }

			for (var id in texts) {
                addText(id, texts[id].name, texts[id].text);
            }

            if (loadedProgress) {
                console.log("Loaded progress found:", loadedProgress);
                progress = loadedProgress; 
                setPhrase(progress.currentPhrase); 
                console.log("Setting phrase to:", progress.currentPhrase);
            } else {
                const currentTextId = localStorage.getItem('speech-current-text');
                if (currentTextId && texts[currentTextId]) {
                    setPhrase(0); 
                }
            }

            var currentTextId = localStorage.getItem('speech-current-text');
                if (currentTextId && texts[currentTextId]) {
                    var currentText = texts[currentTextId];
                    var phraseElement = document.querySelector('#page-main #phrase');
                    if (phraseElement) {
                        phraseElement.innerHTML = currentText.phrases[0].split(' ').map((e) => `<span>${e}</span>`).join(' '); // Display the first phrase
                    }
                }

                document.querySelector('#page-main #phrase').addEventListener('click', (event) => {
                    speakText(event.target.textContent);
                });

            loadVoices(initOptions);
            if (speechSynthesis.onvoiceschanged !== undefined)
                speechSynthesis.onvoiceschanged = () => loadVoices(initOptions);

            
            var loadingElement = document.querySelector('#page-start #loading');
            if (loadingElement) loadingElement.remove();
            setPhrase(current_phrase_no);


            setupNavigationListeners();
            

            document.querySelector('#page-option #speech-success-ring [value="yes"]').addEventListener('click', () => {
                $success.play();
            });

        });

        function handlePrevPhrase() {
            resetRecognitionStyles();
            setPhrase(progress.currentPhrase - 1);
            phonemeContainer.innerHTML = '';
            saveProgress();
        }
        
        function handleNextPhrase() {
            resetRecognitionStyles();
            setPhrase(progress.currentPhrase + 1);
            phonemeContainer.innerHTML = '';
            saveProgress();
        }

        var phonemeContainer = document.getElementById("phoneme-output");
        function setupNavigationListeners() {
            const prevButton = document.querySelector('#page-main #panel-counter #button-prev-phrase');
            const nextButton = document.querySelector('#page-main #panel-counter #button-next-phrase');
        
            // Remove existing event listeners
            prevButton.removeEventListener('click', handlePrevPhrase);
            nextButton.removeEventListener('click', handleNextPhrase);
        
            // Add new event listeners
            prevButton.addEventListener('click', handlePrevPhrase);
            nextButton.addEventListener('click', handleNextPhrase);
        }


        var $recognition = document.querySelector('#page-main #recognition');
        function resetRecognitionStyles() {
            if ($recognition) {
                $recognition.removeAttribute('correct'); 
                $recognition.style.color = ''; 
            }
        }

        var optionButton = document.querySelector('#page-main #button-option');
        if (optionButton) {
            optionButton.addEventListener('click', function() {
                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }
        
                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'none'; 
                }
        
                var pageOption = document.querySelector('#page-option');
                if (pageOption) {
                    pageOption.style.display = 'block'; 
                }
            });
        }

        var selectButtonStart = document.querySelector('#page-start #button-text-selector');
        if (selectButtonStart) {
            selectButtonStart.addEventListener('click', function() {
                var closeButtonMain = document.querySelector('#page-text-selector #close-button');
                if (closeButtonMain) {
                    closeButtonMain.style.display = 'none';
                }
                    
                var phonemeContainer = document.getElementById("phoneme-output");
                    phonemeContainer.innerHTML = '';

                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }
        
                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'none'; 
                }
        
                var pageOption = document.querySelector('#page-text-selector');
                if (pageOption) {
                    pageOption.style.display = 'block'; 
                }
            });
        }

        var selectButtonMain = document.querySelector('#page-main #button-text-selector');
        if (selectButtonMain) {
            selectButtonMain.addEventListener('click', function() {
                var phonemeContainer = document.getElementById("phoneme-output");
                    phonemeContainer.innerHTML = '';
                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }
        
                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'none'; 
                }
        
                var pageOption = document.querySelector('#page-text-selector');
                if (pageOption) {
                    pageOption.style.display = 'block'; 
                }
            });
        }

        var helpButton = document.querySelector('#page-main #button-help');
        if (helpButton) {
            helpButton.addEventListener('click', function() {
                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }
        
                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'none'; 
                }
        
                var pageOption = document.querySelector('#page-help');
                if (pageOption) {
                    pageOption.style.display = 'block'; 
                }
            });
        }

        var closeButton = document.querySelector('#page-option #close-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                var pageOption = document.querySelector('#page-option');
                if (pageOption) {
                    pageOption.style.display = 'none'; 
                }

                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }

                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'block'; 
                }
            });
        }

        var closeButtonHelp = document.querySelector('#page-help #close-button');
        if (closeButtonHelp) {
            closeButtonHelp.addEventListener('click', function() {
                var pageOption = document.querySelector('#page-help');
                if (pageOption) {
                    pageOption.style.display = 'none'; 
                }

                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }

                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'block'; 
                }
            });
        }

        var closeButtonSelect = document.querySelector('#page-text-selector #close-button');
        if (closeButtonSelect) {
            closeButtonSelect.addEventListener('click', function() {
                var pageOption = document.querySelector('#page-text-selector');
                if (pageOption) {
                    pageOption.style.display = 'none'; 
                }

                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }

                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'block'; 
                }
            });
        }

        const phonemeToSymbol = {
            "AA": "ɑ", "AE": "æ", "AH": "ʌ", "AO": "ɔ", "AW": "aʊ",
            "AY": "aɪ", "B": "b", "CH": "tʃ", "D": "d", "DH": "ð",
            "EH": "ɛ", "ER": "ɝ", "EY": "eɪ", "F": "f", "G": "ɡ",
            "HH": "h", "IH": "ɪ", "IY": "i", "JH": "dʒ", "K": "k",
            "L": "l", "M": "m", "N": "n", "NG": "ŋ", "OW": "oʊ",
            "OY": "ɔɪ", "P": "p", "R": "ɹ", "S": "s", "SH": "ʃ",
            "T": "t", "TH": "θ", "UH": "ʊ", "UW": "u", "V": "v",
            "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
            "0": "", // No stress
            "1": "ˈ", // Primary stress
            "2": "ˌ"  // Secondary stress
        };


        function displayPhonemesForCurrentPhrase(phrase) {
            var words = phrase.split(' '); 
            var phonemeContainer = document.getElementById("phonphrase"); 
            phonemeContainer.innerHTML = '';
        
            words.forEach(word => {
                var cleanedWord = cleanWord(word);
                var phonemeSequence = window.pronouncing.phonesForWord(cleanedWord);
        
                var phonemeElement = document.createElement("div");
                if (phonemeSequence.length > 0) {
                    var phonemeArray = phonemeSequence[0].split(" ");
                    // Convert to symbols
                    var symbolArray = phonemeArray.map(phoneme => {
                        // Extract base phoneme and stress
                        let basePhoneme = phoneme.replace(/\d/, "");
                        let stress = phoneme.match(/\d/) || [""]; 
                        return (phonemeToSymbol[stress[0]] || "") + (phonemeToSymbol[basePhoneme] || phoneme);
                    });
                    phonemeElement.innerText = cleanedWord + ": " + symbolArray.join(" ");
                } else {
                    phonemeElement.innerText = cleanedWord + ": No phonemes found";
                }
                phonemeContainer.appendChild(phonemeElement);
            });
        
            function cleanWord(word) {
                return word.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
            }
        }


        function addText(id, name, text) {
            var $div = document.createElement('div');
            $div.setAttribute('id', id);
            $div.classList.add('text-item'); 
            $div.innerHTML = name;
            $div.addEventListener('click', function() {
                var closeButtonMain = document.querySelector('#page-text-selector #close-button');
                if (closeButtonMain) {
                    closeButtonMain.style.display = 'inline';
                }
                if ($div.hasAttribute('current')) return;
    
                var textsChildren = document.querySelectorAll('#texts div');
                textsChildren.forEach(child => child.removeAttribute('current'));
                this.setAttribute('current', true);

                var textElement = document.querySelector('#text');
                if (textElement) textElement.innerHTML = text;

                localStorage.setItem('speech-current-text', this.id);
                console.log("Current text from localStorage:", localStorage.getItem('speech-current-text'));

                loadProgressForTextId(this.id);
                setupNavigationListeners();
            });
    
            var $view = document.createElement('div');
            $view.setAttribute('id', 'view');
            $view.innerHTML = '&#10148;';
            $view.classList.add('view-icon');
            $view.addEventListener('click', function(event) {
                event.stopImmediatePropagation();
    
                if (!$div.hasAttribute('current')) $div.click();
    
                if (typeof setPage === 'function') setPage('text-view');
                var captionElement = document.querySelector('#page-text-view .caption');
                if (captionElement) captionElement.children[0].innerHTML = name;
                var contentElement = document.querySelector('#page-text-view .content');
                if (contentElement) contentElement.innerHTML = text;
            });
            $div.appendChild($view);
    
    
            var textsContainer = document.querySelector('#texts');
            if (textsContainer) textsContainer.appendChild($div);
        }

        document.getElementById('filter-input').addEventListener('input', filterTexts);
        function filterTexts() {
            var filterInput = document.getElementById('filter-input');
            var filterValue = filterInput.value.toLowerCase();
            var textsChildren = document.querySelectorAll('#texts div');
        
            textsChildren.forEach(child => {
                if (child.innerHTML.toLowerCase().includes(filterValue)) {
                    child.style.display = ''; 
                } else {
                    child.style.display = 'none'; 
                }
            });
        }

        async function loadProgressForTextId(textId) {
            try {
                console.log("Requesting progress for text ID:", textId);
        
                // Call the function exposed by WordStart to fetch progress
                if (typeof window.fetchProgressForTextId === 'function') {
                    const backendProgress = await window.fetchProgressForTextId(textId);
        
                    if (backendProgress) {
                        console.log("Using backend progress for text ID:", textId, backendProgress);
                        progress = backendProgress; 
                    } else {
                        console.log("No backend progress found, falling back to local storage.");
                        const savedProgress = JSON.parse(localStorage.getItem('patient-progress')) || {};
                        progress = savedProgress[textId] || {
                            textId: textId,
                            textName: texts[textId]?.name || "",
                            currentPhrase: 0,
                            correctCount: 0,
                            totalPhrases: texts[textId]?.phrases.length || 0,
                            completed: false,
                            completedPhrases: [],
                        };
                    }
                } else {
                    console.warn("fetchProgressForTextId is not defined. Falling back to local storage.");
                    const savedProgress = JSON.parse(localStorage.getItem('patient-progress')) || {};
                    progress = savedProgress[textId] || {
                        textId: textId,
                        textName: texts[textId]?.name || "",
                        currentPhrase: 0,
                        correctCount: 0,
                        totalPhrases: texts[textId]?.phrases.length || 0,
                        completed: false,
                        completedPhrases: [],
                    };
                }
        
                // Update UI or state with loaded progress
                setPhrase(progress.currentPhrase);
                setupNavigationListeners();
            } catch (error) {
                console.error("Error loading progress:", error);
        
                // Handle fallback case
                const savedProgress = JSON.parse(localStorage.getItem('patient-progress')) || {};
                progress = savedProgress[textId] || {
                    textId: textId,
                    textName: texts[textId]?.name || "",
                    currentPhrase: 0,
                    correctCount: 0,
                    totalPhrases: texts[textId]?.phrases.length || 0,
                    completed: false,
                    completedPhrases: [],
                };
        
                setPhrase(progress.currentPhrase);
                setupNavigationListeners();
            }
        }

        // Function to clean up the phrase
        function cleanUpPhrase(phrase) {
            return phrase
                .replace(/[^\w\s]|_/g, "") // Remove punctuation
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .trim() // Trim leading and trailing spaces
                .toLowerCase(); // Convert to lowercase
        }


        function setPhrase(no) {
            clearTimeout(nextPhraseTimer);
            no = parseInt(no) || 0; 
        
            const id = localStorage.getItem('speech-current-text');
            
            if (!id) {
                console.error("No current text ID found");
                return;
            }
        
            console.log("Current text ID:", id);
            const text = texts[id]; 
            if (!text) {
                console.error("Text not found for ID:", id); 
                return; 
            }
            console.log("Current text:", text); 

            if (no < 0) {
                no = 0;
            } else if (no >= text.phrases.length) {
                no = text.phrases.length - 1; // Prevent overflow
            }
        
            
            current_phrase_no = no; 
            console.log("Setting phrase number:", no, "for text ID:", id); 
        
            // Update UI elements for previous and next buttons
            const prevButton = document.querySelector('#page-main #panel-counter #button-prev-phrase');
            const nextButton = document.querySelector('#page-main #panel-counter #button-next-phrase');
            const phraseNumber = document.querySelector('#page-main #phrase-number');
            const panelCounterCaption = document.querySelector('#caption');
            const phraseElement = document.querySelector('#page-main #phrase');
        
            if (prevButton) prevButton.style.visibility = no === 0 ? 'hidden' : 'visible';
            if (nextButton) nextButton.style.visibility = no === text.phrases.length - 1 ? 'hidden' : 'visible';
            if (phraseNumber) phraseNumber.innerHTML = `${no + 1}/${text.phrases.length}`;
            if (panelCounterCaption) panelCounterCaption.innerHTML = text.name;
            
            if (phraseElement) {
                const currentPhrase = text.phrases[no];
                console.log("Current phrase:", currentPhrase); 
                console.log("Completed phrases:", progress.completedPhrases);
                phraseElement.innerHTML = currentPhrase.split(' ').map((e) => e.indexOf('<') === -1 ? `<span>${e}</span>` : e).join(' ');
        
                // Add click event listeners for each word
                phraseElement.querySelectorAll('*').forEach((e) => e.addEventListener('click', (event) => {
                    event.stopImmediatePropagation();
                    speakText(event.target.textContent);
                }));
        
                // Update phonemes for the current phrase
                const phonemeContainer = document.getElementById("phonphrase");
                phonemeContainer.innerHTML = '';
                displayPhonemesForCurrentPhrase(currentPhrase);

                // Check if the current phrase is in completedPhrases
                const cleanedCurrentPhrase = cleanUpPhrase(currentPhrase);
                const checkMark = document.querySelector('#panel-phrase #check');
                if (progress.completedPhrases.includes(cleanedCurrentPhrase)) {
                    checkMark.style.display = 'inline'; // Show the check mark
                } else {
                    checkMark.style.display = 'none'; // Hide the check mark
                }
            }

             if (document.querySelector('#page-main').hasAttribute('current')) {
                speakText(text.phrases[no]); 
            }
        
            // Update progress object
            if (progress.textId === id && progress.currentPhrase === no) {
                return; 
            }

            progress.currentPhrase = no;
            current_phrase_no = no;
            progress.textId = id;
            progress.totalPhrases = text.phrases.length;
  
            // Hide listen and recognition buttons
            const listenButton = document.querySelector('#page-main #button-listen');
            if (listenButton) listenButton.setAttribute('hidden', true);
            
            const recognitionElement = document.querySelector('#page-main #recognition');
            if (recognitionElement) {
                recognitionElement.innerHTML = '';
                recognitionElement.removeAttribute('confidence');
            }
        
            const compareElement = document.querySelector('#page-main #compare');
            if (compareElement) compareElement.innerHTML = '';
            
                  
        }

        function saveProgress() {
            const textId = localStorage.getItem('speech-current-text');
            const savedProgress = JSON.parse(localStorage.getItem('patient-progress')) || {};
        
            // Update the progress for the current text ID
            savedProgress[textId] = {
                textId: textId,
                textName: texts[textId]?.name || "", 
                currentPhrase: progress.currentPhrase,
                correctCount: progress.correctCount,
                totalPhrases: progress.totalPhrases,
                completed: progress.correctCount === progress.totalPhrases,
                completedPhrases: progress.completedPhrases 
            };
        
            // Save the updated progress to local storage
            localStorage.setItem('patient-progress', JSON.stringify(savedProgress));
            console.log("Progress saved for text ID:", textId);
        
            // Save progress to the backend
            if (window.saveProgressToBackend) {
                window.saveProgressToBackend(savedProgress[textId]); // Pass the specific progress for the current text ID
            }
        }


        function initOptions() {
            const options = document.querySelectorAll('#page-option .content > div');
            
            options.forEach(opt => {
                const optId = opt.id;
                const e = document.getElementById(optId);
                
                Array.from(e.children).forEach(child => {
                    child.addEventListener('click', (event) => {
                        setOption(optId, event.target.getAttribute('value'));
                    });
                });
        
                setOption(optId, localStorage.getItem(optId));
            });
        }
        
        function setOption(opt, value) {
            const e = document.getElementById(opt);
            const def = e.getAttribute('default');
            localStorage.setItem(opt, value || def);
        
            Array.from(e.children).forEach(child => {
                child.removeAttribute('current');
            });
        
            const curr = e.querySelector(`[value="${value}"]`) || e.querySelector(`[value="${def}"]`);
            if (curr) {
                curr.setAttribute('current', true);
            }
        }
        
        function getOption(opt) {
            const e = document.querySelector(`#${opt} [current]`);
            return e ? e.getAttribute('value') : document.getElementById(opt).getAttribute('default');
        }

        
        
        let voices = [];
        function speakText(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voices[getOption('speech-voice')];
            utterance.rate = getOption('speech-voice-speed') || 1;
            speechSynthesis.speak(utterance);
        }
        
        function loadVoices(cb) {
            voices = speechSynthesis.getVoices();
            const voicesContainer = document.getElementById('speech-voice');
        
            // If voices are already loaded, return
            if (voicesContainer.innerHTML.trim()) return;
        
            function speakExample() {
                setTimeout(() => speakText('Reading your phrase'), 200);
            }
        
            voices.forEach((voice, index) => {
                if (voice.lang.startsWith('en') && (voice.lang.includes('US') || voice.lang.includes('UK') || voice.lang.includes('GB'))) {
                    const div = document.createElement('div');
                    div.setAttribute('value', index);
                    div.setAttribute('title', voice.name);
                    div.textContent = voicesContainer.children.length + 1; 
                    div.addEventListener('click', speakExample);
                    voicesContainer.appendChild(div);
                    voicesContainer.appendChild(document.createTextNode(' '));
                }
            });
        
            if (!voicesContainer.children.length) return;
        
            const current = (document.querySelector(`#speech-voice [value="${localStorage.getItem('speech-voice')}"]`) || voicesContainer.children[0]).getAttribute('value');
            voicesContainer.setAttribute('default', current);
            voicesContainer.classList.add('col' + voicesContainer.children.length);
            setOption('speech-voice', current);
        
            const speedOptions = document.querySelectorAll('#speech-voice-speed > div');
            speedOptions.forEach(speedOption => {
                speedOption.onclick = speakExample;
            });
        
            cb();
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            var microphoneElement = document.querySelector('#page-start #microphone');
            if (microphoneElement) microphoneElement.remove();
    
            var webkitSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (typeof webkitSpeechRecognition === 'undefined') {
                console.warn('webkitSpeechRecognition is not supported in this browser.');
                return; 
            }
            // var recognition;
            //     if (typeof window.SpeechRecognition !== 'undefined') {
            //         recognition = new window.SpeechRecognition(); // Standard SpeechRecognition
            //     } else if (typeof window.webkitSpeechRecognition !== 'undefined') {
            //         recognition = new window.webkitSpeechRecognition(); // WebKit-based SpeechRecognition
            //     } else {
            //         $recognition.innerHTML('SpeechRecognition is not supported in this browser.');
            //         return; 
            //     }
            var recognition = new webkitSpeechRecognition(); 
            var chunks, userAudio;
    
            var mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.addEventListener('dataavailable', event => chunks.push(event.data));
    
            var time;
            var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator && navigator.userAgent || ''));
    
            var $panel_recognition = document.querySelector('#page-main #panel-recognition');
            var $recognition = document.querySelector('#page-main #recognition');
            var $compare = document.querySelector('#page-main #compare');

            function cleanup() {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }

                if (recognition) {
                    recognition.stop();
                }

                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
            window.addEventListener('beforeunload', cleanup);

    
            function startRecord(event) {
                resetRecognitionStyles();
                event.stopImmediatePropagation();

                window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
                var recognition = new window.SpeechRecognition(); 
    
                if (event.type !== 'touchstart' && event.type === 'mousedown' && event.which !== 1) return;
    
                var recordButton = document.querySelector('#page-main #button-record');
                if (recordButton && recordButton.hasAttribute('record')) return;            

                var phonemeContainer = document.getElementById("phoneme-output");
                var watElement = document.getElementById("Wat");
                phonemeContainer.innerHTML = '';

                time = new Date().getTime();
                if (recordButton) recordButton.setAttribute('record', true);
                if ($panel_recognition) $panel_recognition.setAttribute('mode', 'recognition');
                if ($compare) $compare.innerHTML = '';
                if ($recognition) $recognition.innerHTML = '';
                if ($recognition) $recognition.removeAttribute('confidence');
    
                chunks = [];
                userAudio = null;
    
                var dmp = new diff_match_patch();
                dmp.Diff_Timeout = parseFloat(100);
                dmp.Diff_EditCost = parseFloat(4);
    
                mediaRecorder.start();
    
                recognition.lang = isMobile ? 'en-US' : 'en-UK';
                recognition.interimResults = false;
                recognition.continuous = false;

                let recognitionTimeout;

                recognition.onstart = function () {
                    if ($panel_recognition) $panel_recognition.setAttribute('mode', 'recognition');
                    if ($recognition) {
                        $recognition.removeAttribute('confidence');
                        $recognition.innerHTML = 'listening...';
                    }
                };

                // recognition.onaudiostart = function () {
                //     console.log("Audio started");
                //     if (watElement) watElement.innerHTML = "Audio started"; // Update Wat element
                // };
            
                // recognition.onsoundstart = function () {
                //     console.log("Sound started");
                //     if (watElement) watElement.innerHTML = "Sound started"; // Update Wat element
                // };

                // recognition.onspeechstart = function () {
                //     console.log("Speech started");
                //     if (watElement) watElement.innerHTML = "Speech started"; // Update Wat element
                // };
            
                // recognition.onsoundend = function () {
                //     console.log("Sound ended");
                //     if (watElement) watElement.innerHTML = "Sound ended"; // Update Wat element
                // };
            
                // recognition.onaudioend = function () {
                //     console.log("Audio ended");
                //     if (watElement) watElement.innerHTML = "Audio ended"; // Update Wat element
                // };
                
                recognitionTimeout = setTimeout(() => {
                    recognition.onspeechend();
                }, 10000);
                
            
                recognition.onspeechend = function () {
                    if ($panel_recognition) $panel_recognition.setAttribute('mode', 'recognition');
                    if ($recognition) {
                        $recognition.removeAttribute('confidence');
                    }
                    recognition.stop();
                };
            
    
                recognition.onresult = function(event) {
                    clearTimeout(recognitionTimeout);
                    stopRecord(new MouseEvent('mouseup', { 'which': 1 }));
    
                    var res = event.results[0][0];
                    var phrase = document.querySelector('#page-main #phrase').textContent.trim();
                    var transcript = (res.transcript || '').replace(/\d+/g, num2text);
                    transcript = replaceHomophones(phrase, transcript);
                    
                    var fullTranscript = '';
                    for (var i = 0; i < event.results.length; i++) {
                        transcript = event.results[i][0].transcript;
                        fullTranscript += transcript + ' ';
                    }
                    var finalText = fullTranscript.trim();
                    var words = finalText.split(' ');
                    var phonemeContainer = document.getElementById("phoneme-output");
                    phonemeContainer.innerHTML = ''; 

                    words.forEach(word => {
                        var cleanedWord = cleanWord(word);
                        var phonemeSequence = window.pronouncing.phonesForWord(cleanedWord);
                
                        if (phonemeSequence.length > 0) {
                            var phonemeArray = phonemeSequence[0].split(" ");
                            // Convert phonemes to symbols
                            var symbolArray = phonemeArray.map(phoneme => {
                                let basePhoneme = phoneme.replace(/\d/, ""); // Extract base phoneme
                                let stress = phoneme.match(/\d/) || [""]; // Extract stress
                                return (phonemeToSymbol[stress[0]] || "") + (phonemeToSymbol[basePhoneme] || phoneme);
                            });
                
                            var phonemeElement = document.createElement("div");
                            phonemeElement.innerText = cleanedWord + ": " + symbolArray.join(" ");
                            phonemeContainer.appendChild(phonemeElement);
                        } else {
                            phonemeElement = document.createElement("div");
                            phonemeElement.innerText = cleanedWord + ": No phonemes found";
                            phonemeContainer.appendChild(phonemeElement);
                        }
                    });

                    function cleanWord(word) {
                        return word.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
                    }

    
                    if ($recognition) {
                        $recognition.innerHTML = transcript.split(' ').map((e) => '<span>' + e + '</span>').join(' ');
                        $recognition.querySelectorAll('*').forEach((e) => e.addEventListener('click', (event) => speakText(event.target.textContent)));
                        $recognition.setAttribute('confidence', (parseInt(res.confidence * 100) + '%'));
                    }
                    
    
                    var clear = (text) => text.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
                    phrase = clear(phrase);
                    transcript = clear(transcript);

                     // Check if the phrase is already completed
                     const isCompleted = progress.completedPhrases.includes(phrase);

                     // Increment correct count and mark as completed if the phrase matches
                    if (!isCompleted && phrase === transcript) {
                        progress.correctCount++;
                        progress.completedPhrases.push(phrase); // Add to completed phrases
                        console.log(`Phrase completed: ${phrase}`); // Log completion
                        saveProgress(); // Save progress if needed
                    }

    
                    if ($panel_recognition) {
                        $panel_recognition.setAttribute('mode', (transcript.length || 0) < phrase.length * 0.7 || phrase === transcript ? 'recognition' : 'compare');
                    }
    
                    var compare = '';
                    if (phrase !== transcript) {
                        var d = dmp.diff_main(phrase, transcript);
                        dmp.diff_cleanupEfficiency(d);
                        compare = dmp.diff_prettyHtml(d);
                    }
    
                    if ($compare) $compare.innerHTML = compare;
                    if ($recognition) $recognition.setAttribute('correct', phrase === transcript);
                    if (phrase === transcript && getOption('speech-success-ring') === 'yes') {
                        $success.play();
                    }
                };
    
                recognition.onerror = function(event) {
                    if ($panel_recognition) $panel_recognition.setAttribute('mode', 'recognition');
                    if ($recognition) {
                        $recognition.removeAttribute('confidence');
                        $recognition.innerHTML = 'Sorry! Voice unrecognized! ' + event.message;
                    }
                    recognition.stop();
                };
    
                recognition.start();
            }
            window.startRecord = startRecord;

            
    
            function stopRecord(event) {
                event.stopImmediatePropagation();
                if (event.type !== 'touchend' && event.type === 'mouseup' && event.which !== 1) return;
    
                if (new Date().getTime() - time < 300) return;
    
                if (mediaRecorder.state === 'recording') mediaRecorder.stop();
                var listenButton = document.querySelector('#page-main #button-listen');
                if (listenButton) listenButton.removeAttribute('hidden');
                var recordButton = document.querySelector('#page-main #button-record');
                if (recordButton) recordButton.removeAttribute('record');
    
                if (recognition) recognition.stop();
    
                setTimeout(function() {
                    var blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                    var url = URL.createObjectURL(blob);
                    userAudio = new Audio(url);
                }, 500);
            }
            window.stopRecord = stopRecord;
    
            var recordButton = document.querySelector('#page-main #button-record');
            if (recordButton) {
                recordButton.addEventListener('click', (event) => event.stopImmediatePropagation());
                recordButton.addEventListener(isMobile ? 'touchstart' : 'mousedown', startRecord);
                recordButton.addEventListener(isMobile ? 'touchend' : 'mouseup', stopRecord);
            }
    
            var listenButton = document.querySelector('#page-main #button-listen');
            if (listenButton) {
                listenButton.addEventListener('click', function(event) {
                    event.stopImmediatePropagation();
    
                    if (!userAudio || !userAudio.duration) return;
    
                    if (userAudio.paused) return userAudio.play();
    
                    userAudio.pause();
                    userAudio.currentTime = 0;
                });
            }
    
            
        }).catch((err) => alert(err.message));



        function parseTexts(data) {
            var texts = {};
            var deleted = (localStorage.getItem('speech-deleted-texts') || '').split(';');

            data += '===' + (localStorage.getItem('speech-user-texts') || '');
            data.split('===').forEach(function(text) {
                var e = { phrases: [] };

                var header_mode = true;
                text.split('\n').forEach(function (line, i) {
                    line = line.trim();

                    if (!line && i == 0) return;

                    if (!line) header_mode = false;

                    if (line && header_mode) 
                        e[line.substr(0, line.indexOf(':')).trim()] = line.substr(line.indexOf(':') + 1).trim();
                    else
                        e.phrases.push(line);
                });

                e.text = (e.audio ? '<audio controls="controls"><source src="' + e.audio + '"/></audio>' : '') + e.phrases.join('\n').trim();
                e.phrases = e.phrases.filter(e => !!e);

                if (e.id && e.phrases.length > 0 && e.name && deleted.indexOf(e.id) == -1)
                    texts[e.id] = e;
            });

            return texts;
        }

        function parseHomophones(data) {
            var res = {};
            data.split('\n').map(e => e.split(';')).forEach(e => e.forEach(w => res[w] = e));
            return res;
        }

        function replaceHomophones(phrase, transcript) {
            var phrase_words = phrase.split(' ').map((w) => w.toLowerCase().replace(/(^\W*)|(\W*$)/g, ''));
            return transcript.split(' ').map(function(word, i) {
                var w = word.toLowerCase();
                var ws = homophones[w];
                if (!ws) return word;
    
                var check = (w) => i > 1 && phrase_words[i - 1] == w || phrase_words[i] == w || i + 1 < phrase_words.length && phrase_words[i + 1] == w;
                for (var j = 0; j < ws.length; j++) {
                    if (check(ws[j])) return ws[j];
                }
    
                return word;
            }).join(' ');
        }

        var num = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
        var tens = 'twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
        function num2text(n) {
            if (n < 20) return num[n];
            var digit = n % 10;
            if (n < 100) return tens[~~(n / 10) - 2] + (digit ? ' ' + num[digit] : '');
            if (n < 1000) return num[~~(n / 100)] + ' hundred' + (n % 100 == 0 ? '' : ' ' + num2text(n % 100));
            return num2text(~~(n / 1000)) + ' thousand' + (n % 1000 != 0 ? ' ' + num2text(n % 1000) : '');
        }



}



window.addEventListener('load', function() {
    initializeExercise();
});

window.initializeExercise = initializeExercise;