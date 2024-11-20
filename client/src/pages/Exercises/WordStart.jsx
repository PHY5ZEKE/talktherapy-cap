import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";
import './libs/exercises.css';

// PageStart Component
export default function WordStart() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPhraseNo, setCurrentPhraseNo] = useState(0); 
  const [error, setError] = useState(null);
  const [texts, setTexts] = useState([]);
  const appURL = import.meta.env.VITE_APP_URL;

  const handleRecord = () => {
    setIsRecording(prevState => !prevState);
  };

  // Fetch patient data
  useEffect(() => {
    if (authState?.userRole === "patientslp") {
      const fetchPatientData = async () => {
        try {
          const response = await fetch(`${appURL}/${route.patient.fetch}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch patient data");
            setLoading(false);
            return;
          }

          const data = await response.json();
          const lastCompletedPhrase = data.patient.lastCompletedPhrase || 1; // Default to 0 if not found
          setCurrentPhraseNo(lastCompletedPhrase);
          setLoading(false);

          // Call the global setPhrase function to display the correct phrase
          if (typeof window.setPhrase === 'function') {
            window.setPhrase(lastCompletedPhrase);
          }
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchPatientData();
    }
  }, [accessToken, appURL, authState?.userRole]);

  //load script
  useEffect(() => {
    const existingScript = document.querySelector('script[src="./src/pages/Exercises/libs/Exercise.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = './src/pages/Exercises/libs/Exercise.js';
      script.async = true;
      script.onload = () => {
        console.log('Exercise.js loaded');
        if (typeof window.initializeExercise === 'function') {
          window.initializeExercise();
        }
        // Assuming texts are loaded in the global scope after Exercise.js is initialized
        if (typeof window.texts !== 'undefined') {
          setTexts(window.texts); // Set the loaded texts
        }
      };
      document.body.appendChild(script);
    } else {
      if (typeof window.initializeExercise === 'function') {
        window.initializeExercise();
      }
      // Check if texts are already loaded
      if (typeof window.texts !== 'undefined') {
        setTexts(window.texts); // Set the loaded texts
      }
    }
  }, []);
  

  // Function to save progress to the server
  const saveProgress = async (phraseNo) => {
    console.log("Saving progress for phrase number:", phraseNo);
    try {
      const response = await fetch(`${appURL}/update-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPhraseNo: phraseNo }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      const result = await response.json();
      console.log(result.message); // Optionally handle success message
    } catch (error) {
      console.error(error.message);
      console.error("Error saving progress:", error.message);
    }
  };


  useEffect(() => {
    // Add event listeners for buttons
    const prevButton = document.querySelector('#page-main #panel-counter #button-prev-phrase');
    const nextButton = document.querySelector('#page-main #panel-counter #button-next-phrase');

    const handlePrevClick = () => {
      console.log("Previous button clicked");
      const newPhraseNo = currentPhraseNo - 1;
      if (newPhraseNo >= 0) {
        setCurrentPhraseNo(newPhraseNo);
        saveProgress(newPhraseNo); // Save progress
        if (typeof window.setPhrase === 'function') {
          window.setPhrase(newPhraseNo);
        }
      }
    };

    const handleNextClick = () => {
      console.log("Next button clicked");
      const newPhraseNo = currentPhraseNo + 1;
      const totalPhrases = texts.length; // Use the length of the loaded texts
      if (newPhraseNo < totalPhrases) {
        setCurrentPhraseNo(newPhraseNo);
        saveProgress(newPhraseNo); // Save progress
        if (typeof window.setPhrase === 'function') {
          window.setPhrase(newPhraseNo);
        }
      }
    };

    if (prevButton) {
      prevButton.addEventListener('click', handlePrevClick);
    }

    if (nextButton) {
      nextButton.addEventListener('click', handleNextClick);
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (prevButton) {
        prevButton.removeEventListener('click', handlePrevClick);
      }
      if (nextButton) {
        nextButton.removeEventListener('click', handleNextClick);
      }
    };
  }, [currentPhraseNo, texts]);

  
  return (
  <div className="d-flex align-items-center justify-content-center vh-100">
    {/* Page Start */}
    <div id="page-start" className="text-center">
      <div className="content">
        <h1 id="power-by" className="mb-4">Test Exercise</h1>
        <p className="description mb-3">Speech Recognition Speech Exercise</p>
        <div id="loading" className="loading mb-2">Loading...</div>
        <div id="microphone" className="microphone mb-4">Please allow access to microphone to start</div>
        <button id="button-start" className="btn btn-primary">Start</button>
      </div>
    </div>

    {/* Page Main */}
    <div id="page-main" className="page-center" style={{ display: 'none' }}>
      <div className="button-container mb-4">
        <button id="button-help" className="btn btn-outline-primary me-2">Help</button>
        <button id="button-option" className="btn btn-outline-secondary">Option</button>
      </div>

      <div className="content">
        {/* Panel Counter */}
        <div id="panel-counter" className="panel-counter d-flex align-items-center justify-content-center mb-4r">
          <div id="button-prev-phrase" className="btn btn-link text-decoration-none">PREV</div>
          <input id="phrase-number-input" type="number" className="input-counter input-exer visually-hidden" />
          <div id="phrase-number" className="fs-4 mx-3"></div>
          <div id="button-next-phrase" className="btn btn-link text-decoration-none">NEXT</div>
        </div>
        <div id="caption" className="text-muted text-center mb-4"></div>

        {/* Panel Phrase */}
          <div id="panel-phrase" className="panel-phrase d-flex align-items-center justify-content-center mb-4">
            <div className="d-flex">
              <button id="display_phoneme" className="btn btn-success me-3">Show</button>
              <div id="phrase" className="phrase-box bg-white shadow-sm p-3 rounded"></div>
            </div>
            <div id="phonphrase" className="phrase-box hidden shadow-sm p-3 rounded mt-3"></div>
          </div>

        {/* Panel Recognition */}
        <div id="panel-recognition" className="panel-recognition d-flex flex-column align-items-center mb-4">
            <div id="recognition" className="recognition-text mb-2" title="Google Speech Recognition result and its confidence">&nbsp;</div>
            <div id="compare" className="compare-text mb-2"></div>
            <div id="phoneme" className="phoneme-output mb-2"></div>
            <div id="phoneme-output" className="phoneme-output mb-4"></div>

          {/* Panel Record */}
          <div id="panel-record" className="d-flex justify-content-center w-100">
              <button id="button-listen" className="btn btn-info me-3">Listen</button>
              <button id="button-record" className={`btn btn-danger ${isRecording ? 'active' : ''}`} onClick={handleRecord}>Record</button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Option (Modal) */}
        <div id="page-option" className="modal hidden">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Option</h5>
                <button id="close-button" type="button" className="btn-close" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="content">
                  <div id="speech-success-ring" className="selectors mb-3" title="Success ring enable">
                    <div className="d-flex justify-content-around">
                      <div className="btn success-ring-btn" value="no">No</div>
                      <div className="btn success-ring-btn" value="yes">Yes</div>
                    </div>
                  </div>
                  <div id="speech-voice" className="selector mb-3" title="Voice"></div>
                  <div id="speech-voice-speed" className="selector mb-3" title="Voice speed" default="1"> 
                        <div className="btn btn-light speed-btn" value="0.7">0.7</div>
                        <div className="btn btn-light speed-btn" value="0.8">0.8</div>
                        <div className="btn btn-light speed-btn" value="0.9">0.9</div>
                        <div className="btn btn-light speed-btn" value="1">1</div>
                        <div className="btn btn-light speed-btn" value="1.1">1.1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


      {/* Panel Help (Modal) */}
        <div id="page-help" className="modal hidden">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Help</h5>
                <button id="close-button" type="button" className="btn-close" aria-label="Close"></button>
              </div>

              <div className="modal-body">
                <div className="content">
                  <div id="speech-success-ring" className="selectors mb-3" title="Success ring enable">
                    {/* Success ring selector content goes here */}
                  </div>
                  <div className="instruction-content">
                    <p>Hello! If this is your first time, allow your microphone access to the website.</p>
                    <p>
                      <span style={{ fontWeight: 'bold' }}>Hold </span> 
                      <span style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '0 4px', backgroundColor: '#ffe6e6' }}> Record </span> 
                      <span> and release when done speaking!</span>
                    </p>
                    <p>To identify <br></br><br></br>
                      <span style={{ color: '#ff4d4d', textDecoration: 'line-through', backgroundColor: '#ffe6e6', padding: '0 4px' }}> red text </span> 
                      is the part you did not say,
                      <span style={{ textDecoration: 'underline', padding: '0 4px' }}> underlined </span> 
                      text is the one that was recognized,
                      <span style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '0 4px' }}> green text </span> 
                      are the correct sound to the word! <br></br><br></br><br></br>
                      <span>You can click the word to hear how it is pronounced! Click the white box to read the whole phrase</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  </div>
  );
}

