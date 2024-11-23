import { useState, useEffect } from "react";

import "./modal.css";

export default function ConfirmVideoCall({ close, confirm }) {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setVideoDevices(videoInputDevices);
      setAudioDevices(audioInputDevices);
      if (videoInputDevices.length > 0)
        setSelectedVideoDevice(videoInputDevices[0].deviceId);
      if (audioInputDevices.length > 0)
        setSelectedAudioDevice(audioInputDevices[0].deviceId);
    });
  }, []);

  const handleConfirm = (e) => {
    e.preventDefault();
    confirm(selectedVideoDevice, selectedAudioDevice);
  };

  const handleClose = (e) => {
    e.preventDefault();
    close();
  };

  return (
    <>
      <div
        className="modal-background sticky-top z-1"
        style={{ minHeight: "100%", maxHeight: "100vh" }}
      >
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Ready to join the call?</h3>
            <p>
              Before joining the call please make sure to be in a well-lit
              environment. Make sure that your microphone is audible and clear.
            </p>
            <p className="mb-0">
              To start sharing your video and join press{" "}
              <span className="fw-bold">confirm</span>. To go back, press{" "}
              <span className="fw-bold">cancel</span>.
            </p>
          </div>

          <div className="d-flex flex-column align-items-center mt-3 gap-3">
            <div className="d-flex flex-column text-center">
              <p htmlFor="videoSelect" className="mb-0">Select Camera:</p>
              <select id="videoSelect" value={selectedVideoDevice} onChange={(e) => setSelectedVideoDevice(e.target.value)}>
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
                ))}
              </select>
            </div>
            <div className="d-flex flex-column text-center">
              <p htmlFor="audioSelect" className="mb-0">Select Microphone:</p>
              <select id="audioSelect" value={selectedAudioDevice} onChange={(e) => setSelectedAudioDevice(e.target.value)}>
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${device.deviceId}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <div className="d-flex justify-content-center mt-3 gap-3">
              <button
                type="submit"
                className="text-button border"
                onClick={handleConfirm}
              >
                <p className="fw-bold my-0 status">CONFIRM</p>
              </button>
              <button className="text-button border" onClick={handleClose}>
                <p className="fw-bold my-0 status">CANCEL</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
