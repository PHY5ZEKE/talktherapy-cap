import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { route } from "../../utils/route";
import { AuthContext } from "../../utils/AuthContext";
import './libs/exercises.css';
import './libs/skibidi.css';

export default function WordStart() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [patientData, setPatientData] = useState(null);
  

  const [isRecording, setIsRecording] = useState(false);
  const [isPhonemeVisible, setIsPhonemeVisible] = useState(false);
  const [progress, setProgress] = useState(null);


  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const scriptInitialized = useRef(false);

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
        setPatientData(data.patient);
        setLoading(false);

      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }
}, [accessToken, appURL, authState?.userRole]);



  // Function to send progress to the backend
  function saveProgressToBackend(progress) {
    const appURL = import.meta.env.VITE_APP_URL;
    if (!accessToken) {
      console.error("Access token is missing");
      return;
    }

    console.log("Sending progress to backend:", progress);
    fetch(`${appURL}/${route.patient.saveProgress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify(progress),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save progress');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Progress saved successfully:', data);
      })
      .catch((error) => {
        console.error('Error saving progress:', error);
      });
  }
  useEffect(() => {
    window.saveProgressToBackend = saveProgressToBackend;

    return () => {
      delete window.saveProgressToBackend;
    };
  }, [accessToken]);



// Function to fetch the saved progress from the backend
    const fetchProgressFromBackend = async (textId) => {
      try {
        if (!textId) return;

        const response = await fetch(`${appURL}/${route.patient.loadProgress}?textId=${textId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProgress(data); 
          console.log("Loaded progress:", data);
        } else {
          console.log("No progress found in database, starting fresh.");
          setProgress(null); 
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };



    useEffect(() => {
      const fetchProgress = async () => {
        const textId = localStorage.getItem('speech-current-text');
        if (accessToken && textId) {
          await fetchProgressFromBackend(textId);
        }
      };
    
      fetchProgress();
    }, [accessToken]);
  

    // for LoadTextID
    useEffect(() => {
      window.fetchProgressForTextId = async (textId) => {
          try {
              if (!textId || !accessToken) {
                  console.warn("Text ID or access token is missing");
                  return null;
              }
  
              console.log("Fetching progress for textId:", textId);
  
              const response = await fetch(`${appURL}/${route.patient.loadProgress}?textId=${textId}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${accessToken}`,
                  },
              });
  
              if (response.ok) {
                  const data = await response.json();
                  console.log("Progress fetched successfully:", data);
                  return data; 
              } else {
                  console.log("No progress found for textId:", textId);
                  return null; 
              }
          } catch (error) {
              console.error("Error fetching progress:", error);
              return null; 
          }
      };
  
      return () => {
          delete window.fetchProgressForTextId;
      };
  }, [accessToken, appURL, route]);



  //load script
  useEffect(() => {
    const scriptId = "exercise-script";

    const initialize = () => {
      if (typeof window.initializeExercise === "function") {
        console.log("Initializing Exercise.js");
        window.initializeExercise(progress);
      } else {
        console.error("initializeExercise is not defined");
      }
    };

    const removeScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
        console.log("Exercise.js script removed");
      }
    };

    if (!scriptInitialized.current) {
      console.log("Adding Exercise.js");
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "./src/pages/Exercises/libs/Exercise.js";
      script.type = "module";
      script.async = true;

      script.onload = () => {
        console.log("Exercise.js loaded");
        initialize();
      };

      script.onerror = () => {
        console.error("Failed to load Exercise.js");
      };

      document.body.appendChild(script);
      scriptInitialized.current = true;
    } else {
      console.log("Exercise.js already exists");
      initialize(); 
    }

    return () => {
      removeScript();
      if (typeof window.resetExercise === "function") {
        console.log("Resetting Exercise state");
        window.resetExercise();
      }
    };
  }, [progress]);



  // Toggle recognition and compare mode
  const toggleRecognitionMode = () => {
    const $panel_recognition = document.querySelector('#panel-recognition');
    if ($panel_recognition) {
      const mode = $panel_recognition.getAttribute('mode');
      $panel_recognition.setAttribute('mode', mode === 'recognition' ? 'compare' : 'recognition');
    }
  };

  useEffect(() => {
    const $panel_recognition = document.querySelector('#panel-recognition');
    if ($panel_recognition) {
      $panel_recognition.addEventListener('click', toggleRecognitionMode);
    }



    // Cleanup event listener on component unmount
    return () => {
      if ($panel_recognition) {
        $panel_recognition.removeEventListener('click', toggleRecognitionMode);
      }
    };
  }, [progress]);

  const handleBack = () => {
    // Stop microphone activity
    if (window.recognizer?.isListening()) {
      window.recognizer.stopListening();
    }
  
    navigate(-1);
    setTimeout(() => {
      window.location.reload(); 
    }, 100); 
  };

    
  
  return (
  <div className="d-flex align-items-center justify-content-center vh-100">

        <button 
          onClick={handleBack}  
          className="btn btn-primary position-absolute top-0 start-0 m-3 d-flex align-items-center justify-content-center"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            fontSize: '20px',
            backgroundColor: '#007bff', 
            color: 'white', 
            borderColor: '#007bff',
          }}
        >
          <i className="fas fa-arrow-left"></i>
        </button>

    {/* Page Start */}
    <div id="page-start" className="text-center">
    <div className="mb-4">
      {patientData ? (
        <h2>
          Hello {patientData.firstName} {patientData.lastName}!
        </h2>
      ) : (
        <h2>No patient user logged in</h2>
      )}
    </div>

      <div className="content">
        <h1 id="power-by" className="mb-4">Speech Exercises!</h1>
        <p className="description mb-3">Practice your speaking with our voice recognition speech exercises</p>
        <div id="loading" className="loading mb-2">Loading...</div>
        <div id="microphone" className="microphone mb-4">Please allow access to microphone to start</div>
        <div id = "button-text-selector" className="btn btn-primary">Start</div>
      </div>
    </div>

    {/* Page Main */}
    <div id="page-main" className="page-center" style={{ display: 'none' }}>
      <div className="d-flex justify-content-center align-items-center">
        <div className="button-container mb-4 text-center">
          <div id="button-text-selector" className="btn btn-outline-primary me-2">More</div>
          <button id="button-help" className="btn btn-outline-primary me-2">Help</button>
          <button id="button-option" className="btn btn-outline-secondary">Option</button>
        </div>
      </div>

      <div className="content">
        {/* Panel Counter */}
        <div id="panel-counter" className="panel-counter d-flex align-items-center justify-content-center mb-4r">
            <div id="button-prev-phrase" className="btn btn-link text-decoration-none">PREV</div>
            <input id="phrase-number-input" type="number" className="input-counter input-exer visually-hidden"/>
            <div id="phrase-number" className="fs-4 mx-3"></div>
            <div id="button-next-phrase" className="btn btn-link text-decoration-none">NEXT</div>
        </div>
        <div id="caption" className="text-muted text-center mb-4"></div>

        {/* Panel Phrase */}
          <div id="panel-phrase" className="panel-phrase d-flex align-items-center justify-content-center mb-4">
            <div className="d-flex">
              <button
                id="display_phoneme"
                className="btn btn-primary me-2"
                onClick={() => setIsPhonemeVisible((prev) => !prev)} 
              >
                Show
              </button>
              <div id="phrase" className="phrase-box bg-white shadow-sm p-3 rounded"></div>
              <span id="check" className="checkmark" style={{ display: 'none' }}>✔️</span>
            </div>
            <div id="phonphrase" className={`phrase-box ${isPhonemeVisible ? '' : 'hidden'} shadow-sm p-3 rounded mt-3`}></div>
          </div>

        {/* Panel Recognition */}
        <div id="panel-recognition" className="panel-recognition d-flex flex-column align-items-center mb-4">
            <div id="recognition" className="recognition-text mb-2" title="Google Speech Recognition result and its confidence">&nbsp;</div>
            <div id="Wat" className="mb-2"></div>
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
                  <p><span style={{ fontWeight: 'bold', fontSize: '20px'}}>If there's a problem refresh the page!</span> </p>
                    <p>Hello! If this is your first time, allow your microphone access to the website.</p>
                    <p>
                      <span style={{ fontWeight: 'bold' }}>Hold </span> 
                      <span style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '0 4px', backgroundColor: '#ffe6e6' }}> Record</span> 
                      <span> and release when done speaking!</span>
                    </p>
                    <p>To identify: <br></br>
                      <span style={{ color: '#ff4d4d', textDecoration: 'line-through', backgroundColor: '#ffe6e6', padding: '0 4px' }}> red text</span> 
                      <span> is the part you did not say,</span>
                      <span style={{ textDecoration: 'underline', padding: '0 4px' }}> underlined</span> 
                      text is the one that was recognized,
                      <span style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '0 4px' }}> green text</span> 
                      are the correct sound to the word! <br></br><br></br><br></br>
                      <span>You can click the word to hear how it is pronounced! Click the white box to read the whole phrase</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Page Selector (Modal) */}
          <div id="page-text-selector" className="modal hidden">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="textSelectorModalLabel">Select Type of Exercise</h5>
                  <button id="close-button" type="button" className="btn-close" aria-label="Close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <div className="content d-flex">
                    <input type="text" id="filter-input" placeholder="Find an Exercise"></input><br></br>
                    <div id="texts" className="me-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  </div>
  );
}

