import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './libs/index.css';

// PageStart Component
export default function PageStart() {

  const [isRecording, setIsRecording] = useState(false);
  const handleRecord = () => {
    setIsRecording(prevState => !prevState);
  };

  useEffect(() => {
    const existingScript = document.querySelector('script[src="./src/pages/Exercises/libs/Exercise.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = './src/pages/Exercises/libs/Exercise.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="page">
    {/* Page Start */}
    <div id="page-start" className="page-center">
      <div className="content">
        <div id="power-by" className="title">Test Exercise</div>
        <a className="description">Speech Recognition Speech Exercise using webkitspeech</a>
        <div id="loading" className="loading">Loading...</div>
        <div id="microphone" className="microphone">Allow access to microphone...</div>
        <div id="button-start" className="button">Start</div>
      </div>
    </div>

    {/* Page Main */}
    <div id="page-main" className="page-center" style={{ display: 'none' }}>
      <div className="content">
        
        {/* Panel Counter */}
        <div id="panel-counter" className="panel-counter">
          <div id="button-prev-phrase" className="button-arrow">&#9668;</div>
          <input id="phrase-number-input" type="number" className="input-counter" />
          <div id="phrase-number" className="phrase-number"></div>
          <div id="button-next-phrase" className="button-arrow">&#9658;</div>
        </div>

        {/* Panel Phrase */}
        <div id="panel-phrase" className="panel-phrase">
          <div id="phrase" className="phrase-box"></div>
        </div>

        {/* Panel Recognition */}
        <div id="panel-recognition" className="panel-recognition">
          <div id="recognition" className="recognition-text" title="Google Speech Recognition result and its confidence">&nbsp;</div>
          <div id="compare" className="compare-text"></div>
          <div id="phoneme" className="phoneme-output"></div>
          <div id="phoneme-output" className="phoneme-output"></div>

          {/* Panel Record */}
          <div id="panel-record" className="panel-record">
            <div 
              id="button-listen" 
              className="button" 
              onClick={() => alert('Listen clicked')}>Listen</div>
            <div 
              id="button-record" 
              className={`button ${isRecording ? 'active' : ''}`} onClick={handleRecord}>Record</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

