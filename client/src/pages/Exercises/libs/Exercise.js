window.addEventListener('load', function() {
     // Check for necessary APIs
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

            console.log("Loaded texts:", texts);
            console.log("Loaded Homophones:", homophones);

            if (!localStorage.getItem('speech-current-text')) {
                localStorage.setItem('speech-current-text', Object.keys(texts)[0]); // Set to the first text ID as default
            }

			for (var id in texts) {
                addText(id, texts[id].name, texts[id].text);
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

            var phonemeContainer = document.getElementById("phoneme-output");
            var loadingElement = document.querySelector('#page-start #loading');
            if (loadingElement) loadingElement.remove();
            setPhrase(current_phrase_no);


            document.querySelector('#page-main #panel-counter #button-prev-phrase').addEventListener('click', function() {
                resetRecognitionStyles();
                setPhrase(current_phrase_no - 1);
                phonemeContainer.innerHTML = '';
                
            });
            
            document.querySelector('#page-main #panel-counter #button-next-phrase').addEventListener('click', function() {
                resetRecognitionStyles();
                setPhrase(current_phrase_no + 1);
                phonemeContainer.innerHTML = '';
            });

            document.querySelector('#page-option #speech-success-ring [value="yes"]').addEventListener('click', () => {
                $success.play();
            });

        });

        var DisplayPhoneme = document.getElementById('display_phoneme').addEventListener('click', function() {
            var phonemeElement = document.getElementById('phonphrase');
            phonemeElement.classList.toggle('hidden'); 
        });

        var $recognition = document.querySelector('#page-main #recognition');
        function resetRecognitionStyles() {
            if ($recognition) {
                $recognition.removeAttribute('correct'); 
                $recognition.style.color = ''; 
            }
        }

        var optionButton = document.querySelector('#page-main #button-option');
        if (optionButton) {
            console.log("Option button found");
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

        var startButton = document.querySelector('#page-start #button-start');
        if (startButton) {
            console.log("Start button found");
            startButton.addEventListener('click', function() {
                var pageStart = document.querySelector('#page-start');
                if (pageStart) {
                    pageStart.style.display = 'none'; 
                }
        
                var pageMain = document.querySelector('#page-main');
                if (pageMain) {
                    pageMain.style.display = 'block'; 
                }

                if (texts && Object.keys(texts).length > 0) {
                    var currentTextId = localStorage.getItem('speech-current-text');
                    console.log("Current text ID:", currentTextId); 

                    if (texts[currentTextId]) {
                        console.log("Current text:", texts[currentTextId]); 
                        var $e = document.querySelector('#page-text-selector #texts div[id="' + currentTextId + '"]');
                        if ($e) {
                            $e.click(); 
                        }
                    } else {
                        console.error("No text found for ID:", currentTextId); 
                    }
                } else {
                    console.error("Texts not loaded or empty."); 
                }
            });
        }

        function displayPhonemesForCurrentPhrase(phrase) {
            var words = phrase.split(' '); // Split the phrase into words
            var phonemeContainer = document.getElementById("phonphrase"); 
            phonemeContainer.innerHTML = '';
        
            words.forEach(word => {
                var cleanedWord = cleanWord(word);
                var phonemeSequence = window.pronouncing.phonesForWord(cleanedWord);
        
                var phonemeElement = document.createElement("div");
                if (phonemeSequence.length > 0) {
                    var phonemeArray = phonemeSequence[0].split(" ");
                    phonemeElement.innerText = cleanedWord + ": " + phonemeArray.join(", ");
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
            $div.innerHTML = name;
            $div.addEventListener('click', function() {
                if ($div.hasAttribute('current')) return;
    
                var textsChildren = document.querySelectorAll('#texts div');
                textsChildren.forEach(child => child.removeAttribute('current'));
                this.setAttribute('current', true);
                var textElement = document.querySelector('#text');
                if (textElement) textElement.innerHTML = text;
                localStorage.setItem('speech-current-text', this.id);
                console.log("Current text from localStorage:", localStorage.getItem('speech-current-text'));
                setPhrase(document.querySelector('.page[current]').id === 'page-text-selector' ? 0 : localStorage.getItem('speech-phrase'));
            });
    
            var $view = document.createElement('div');
            $view.setAttribute('id', 'view');
            $view.innerHTML = '&#10148;';
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
    
            var $remove = document.createElement('div');
            $remove.setAttribute('id', 'remove');
            $remove.innerHTML = '&#10006;';
            $remove.addEventListener('click', function(event) {
                event.stopImmediatePropagation();
    
                if (!confirm('Are you sure you want to remove "' + name + '"?')) return;
    
                if ($div.hasAttribute('current')) ($div.previousSibling || $div.nextSibling).click();
    
                var deleted = localStorage.getItem('speech-deleted-texts') || '';
                localStorage.setItem('speech-deleted-texts', deleted + ';' + id);
                $div.remove();
            });
            $div.appendChild($remove);
    
            var textsContainer = document.querySelector('#texts');
            if (textsContainer) textsContainer.appendChild($div);
        }



        function setPhrase(no) {
            clearTimeout(nextPhraseTimer);
            no = parseInt(no) || 0; 
            // Get the current text ID from localStorage
            var id = localStorage.getItem('speech-current-text');
            
            if (!id) {
                console.error("No current text ID found in localStorage");
                return;
            }

            console.log("Current text ID:", id);
            console.log("All texts:", texts); 
        
            var text = texts[id]; 
            if (!text) {
                console.error("Text not found for ID:", id); 
                return; 
            }
            console.log("Current text:", text); 
        
            if (no < 0) return setPhrase(0);
            if (no > text.phrases.length - 1) return setPhrase(text.phrases.length - 1);
        
            current_phrase_no = no; 
            console.log("Setting phrase number:", no, "for text ID:", id); 
        
            var prevButton = document.querySelector('#page-main #panel-counter #button-prev-phrase');
            if (prevButton) prevButton.style.visibility = no == 0 ? 'hidden' : 'visible';
            
            var nextButton = document.querySelector('#page-main #panel-counter #button-next-phrase');
            if (nextButton) nextButton.style.visibility = no == text.phrases.length - 1 ? 'hidden' : 'visible';
        
            var phraseNumber = document.querySelector('#page-main #phrase-number');
            if (phraseNumber) phraseNumber.innerHTML = no + 1 + '/' + text.phrases.length;
            
            var panelCounterCaption = document.querySelector('#caption');
            if (panelCounterCaption) panelCounterCaption.innerHTML = text.name;
        
            var phraseElement = document.querySelector('#page-main #phrase');
            if (phraseElement) {
                var currentPhrase = text.phrases[no];
                console.log("Current phrase:", text.phrases[no]); 
                phraseElement.innerHTML = text.phrases[no].split(' ').map((e) => e.indexOf('<') == -1 ? '<span>' + e + '</span>' : e).join(' ');
                phraseElement.querySelectorAll('*').forEach((e) => e.addEventListener('click', (event) => {
                    event.stopImmediatePropagation();
                    speakText(event.target.textContent);
                }));

                var phonemeContainer = document.getElementById("phonphrase");
                phonemeContainer.innerHTML = '';

                displayPhonemesForCurrentPhrase(currentPhrase);
            }
        
            var listenButton = document.querySelector('#page-main #button-listen');
            if (listenButton) listenButton.setAttribute('hidden', true);
            
            var recognitionElement = document.querySelector('#page-main #recognition');
            if (recognitionElement) {
                recognitionElement.innerHTML = '';
                recognitionElement.removeAttribute('confidence');
            }
            
            var compareElement = document.querySelector('#page-main #compare');
            if (compareElement) compareElement.innerHTML = '';
        
            if (document.querySelector('#page-main').hasAttribute('current')) {
                speakText(text.phrases[no]); 
            }
        
            localStorage.setItem('speech-phrase', no); 
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
            var recognition = new webkitSpeechRecognition();
            var chunks, userAudio;
    
            var mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.addEventListener('dataavailable', event => chunks.push(event.data));
    
            var time;
            var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator && navigator.userAgent || ''));
    
            var $panel_recognition = document.querySelector('#page-main #panel-recognition');
            var $recognition = document.querySelector('#page-main #recognition');
            var $compare = document.querySelector('#page-main #compare');
    
            function startRecord(event) {
                resetRecognitionStyles();
                event.stopImmediatePropagation();
    
                if (event.type !== 'touchstart' && event.type === 'mousedown' && event.which !== 1) return;
    
                var recordButton = document.querySelector('#page-main #button-record');
                if (recordButton && recordButton.hasAttribute('record')) return;            

                var phonemeContainer = document.getElementById("phoneme-output");
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
                
                recognitionTimeout = setTimeout(() => {
                    recognition.onspeechend();
                }, 5000);
                
            
                recognition.onspeechend = function () {
                    clearTimeout(recognitionTimeout);
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
                            var phonemeElement = document.createElement("div");
                            phonemeElement.innerText = cleanedWord + ": " + phonemeArray.join(", ");
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
                        $recognition.innerHTML = 'Sorry! We did not hear that, try again! ' + event.message;
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
    
            if ($panel_recognition) {
                $panel_recognition.addEventListener('click', function(event) {
                    var mode = this.getAttribute('mode');
                    this.setAttribute('mode', mode === 'recognition' && $compare.textContent.trim() ? 'compare' : 'recognition');
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



});