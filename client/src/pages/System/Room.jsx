import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import "../../styles/containers.css";
import "../../styles/diagnostic.css";

// UI Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

// Import the voice recognition functionalities
import { runSpeechRecognition } from "../../machinelearning/my_model/voice2text.js";
import { init } from "../../machinelearning/script.js";

export default function Room() {
  const location = useLocation();
  const { appointmentDetails } = location.state || {};

  const [userRole, setUserRole] = useState(null);
  const [messages, setMessages] = useState([]); // State for storing messages
  const [type, setType] = useState("");
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [speechScore, setSpeechScore] = useState({
    pronunciationScore: 0,
    fluencyScore: 0,
  });

  const currentUser = localStorage.getItem("userId");

  // Nav
  const navigate = useNavigate();

  // Get Room ID
  const { roomid } = useParams();

  // Get video stream
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStream = useRef();

  // Connections
  const peerConnection = useRef();
  const serverConnection = useRef();

  const peerConnectionConfig = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  // SDP and ICE Candidates Queue
  const sdpQueue = useRef([]);
  const iceQueue = useRef([]);

  useEffect(() => {
    const initializeModel = async () => {
      await init(); // Call the init function to set up the model and chart
    };

    initializeModel(); // Initialize the model on component mount

    // Optionally, you can return a cleanup function here if needed
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);``

    // Validate user roles after fetching appointment
    if (
      (role === "patientslp" &&
        appointmentDetails?.patientId._id !== currentUser) ||
      (role === "clinician" &&
        appointmentDetails?.selectedClinician !== currentUser) ||
      roomid === "errorRoomId"
    ) {
      handleCloseConnection();
      navigate("/unauthorized");
    } else {
      pageReady();
      return () => {
        handleCloseConnection();
      };
    }
  }, []);

  async function pageReady() {
    const constraints = {
      video: true,
      audio: true,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      serverConnection.current = new WebSocket(
        `wss://${import.meta.env.VITE_WSS}`
      );

      serverConnection.current.onopen = () => {
        serverConnection.current.send(
          JSON.stringify({
            type: "join-room",
            user:
              userRole === "patientslp"
                ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
                : appointmentDetails?.selectedSchedule.clinicianName,
            roomID: roomid,
          })
        );

        start(true);
        // TO DO: Notify for waiting
      };
      serverConnection.current.onmessage = gotMessageFromServer;
    } catch (error) {
      errorHandler(error);
    }
  }

  function start(isCaller) {
    // check server connection
    if (
      !serverConnection.current ||
      serverConnection.current.readyState !== WebSocket.OPEN
    ) {
      // TO DO: Notify connection error.
      return;
    }

    peerConnection.current = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.current.onicecandidate = gotIceCandidate;
    peerConnection.current.ontrack = gotRemoteStream;

    console.log("Okay na!");
    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    if (isCaller) {
      peerConnection.current
        .createOffer()
        .then(createdDescription)
        .catch(errorHandler);
    }

    processQueues();
  }

  function gotMessageFromServer(message) {
    const signal = JSON.parse(message.data);

    // Handle WebRTC messages (SDP, ICE candidates)
    if (signal.sdp) {
      sdpQueue.currrent.push(signal.sdp);
      processQueues();
    } else if (signal.ice) {
      iceQueue.current.push(signal.ice);
      processQueues();
    }

    // Handle Room Maximum Capacity
    if (signal.type === "room-full") {
      handleCloseConnection();
      navigate("/unauthorized");
      console.log("Room is full LN 187");
    }

    // Handle text messages
    if (signal.type === "message") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: signal.message, sender: signal.sender, isSent: false }, // Mark it as received
      ]);
    }

    if (signal.type === "leave-room") {
      // TO DO: Notify leave room.
      handleCloseConnection();
      navigate("/");
    }
  }

  function processQueues() {
    // Process SDP queue
    while (
      sdpQueue.current.length > 0 &&
      peerConnection.current.signalingState === "stable"
    ) {
      const sdp = sdpQueue.current.shift();
      peerConnection.current
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          if (sdp.type === "offer") {
            peerConnection.current
              .createAnswer()
              .then(createdDescription)
              .catch(errorHandler);
          }
        })
        .catch(errorHandler);
    }

    // Process ICE queue
    while (
      iceQueue.current.length > 0 &&
      peerConnection.current.signalingState !== "closed"
    ) {
      const iceCandidate = iceQueue.current.shift();
      peerConnection.current
        .addIceCandidate(new RTCIceCandidate(iceCandidate))
        .catch(errorHandler);
    }
  }

  function gotIceCandidate(event) {
    if (event.candidate != null) {
      serverConnection.current.send(
        JSON.stringify({
          ice: event.candidate,
          uuid:
            userRole === "patientslp"
              ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
              : appointmentDetails?.selectedSchedule.clinicianName,
          type: "ice-candidate",
        })
      );
    }
  }

  function createdDescription(description) {
    peerConnection.current
      .setLocalDescription(description)
      .then(() => {
        serverConnection.current.send(
          JSON.stringify({
            sdp: peerConnection.current.localDescription,
            uuid:
              userRole === "patientslp"
                ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
                : appointmentDetails?.selectedSchedule.clinicianName,
            type: description.type,
          })
        );
      })
      .catch(errorHandler);
  }

  function gotRemoteStream(event) {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  }

  function errorHandler(error) {
    console.log(error);
  }

  function muteMic() {
    const audioTrack = localStream.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicEnabled(audioTrack.enabled);
    }
  }

  const handleVideoStream = async () => {
    if (isCameraEnabled) {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
          localStream.current.removeTrack(track);
        });
        localVideoRef.current.srcObject = null;
        localStream.current = null;
      }
      setIsCameraEnabled(false);
    } else {
      try {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsCameraEnabled(true);
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    }
  };

  const handleCloseConnection = () => {
    // Stop all tracks in the local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
        localStream?.current.removeTrack(track);
      });
      localVideoRef.current.srcObject = null;
      localStream.current = null;
    }

    if (
      serverConnection.current &&
      serverConnection.current.readyState === WebSocket.OPEN
    ) {
      serverConnection.current.send(
        JSON.stringify({
          type: "leave-room",
          roomID: roomid,
        })
      );

      // Close the WebSocket connection
      serverConnection.current.close();
    }

    // Close the peer connection
    if (peerConnection.current) {
      peerConnection.current?.close();
      peerConnection.current.onicecandidate = null;
      peerConnection.current = null;
    }
  };

  function sendMessage(message) {
    if (!message || !serverConnection.current) return;

    serverConnection.current.send(
      JSON.stringify({
        type: "message",
        message,
        roomID: roomid,
        sender:
          userRole === "patientslp"
            ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
            : appointmentDetails?.selectedSchedule.clinicianName,
      })
    );
  }

  function startVoiceRecognitionHandler() {
    runSpeechRecognition(setSpeechScore);
  }

  return (
    <>
      <div className="container-fluid d-flex flex-column justify-content-between vh-100">
        <div className="row text-center py-2 border border-start-0 border-[#B9B9B9] stick-top">
          <p className="mb-0">
            Currently in session with:{" "}
            {appointmentDetails?.selectedSchedule?.clinicianName ||
              "Clinician not available"}{" "}
            and {appointmentDetails?.patientId?.firstName || ""}{" "}
            {appointmentDetails?.patientId?.lastName || ""}
          </p>
        </div>

        <div className="row justify-content-center-md mx-auto w-100 vh-100">
          <div className="col-sm">
            <video
              muted
              ref={localVideoRef}
              className="mx-auto video-local bg-black"
              autoPlay
            />
          </div>

          <div className="col-sm">
            <video
              className="bg-black video-remote mx-auto"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </div>
        </div>

        <div className="row bg-white border border-start-0 border-[#B9B9B9] sticky-bottom">
          <div className="d-flex align-items-center justify-content-center p-3">
            <button
              onClick={() => {
                handleCloseConnection();
                navigate("/");
              }}
              type="submit"
              className="text-button border"
            >
              <p className="fw-bold my-0 status">Disconnect</p>
            </button>

            {/* CAMERA AND MUTE */}
            <div className="d-flex align-items-center gap-2 mx-1">
              <div onClick={handleVideoStream} style={{ cursor: "pointer" }}>
                {isCameraEnabled ? (
                  <FontAwesomeIcon size="lg" icon={faVideo} />
                ) : (
                  <FontAwesomeIcon size="lg" icon={faVideoSlash} />
                )}
              </div>

              <div onClick={muteMic} style={{ cursor: "pointer" }}>
                {isMicEnabled ? (
                  <FontAwesomeIcon size="lg" icon={faMicrophone} />
                ) : (
                  <FontAwesomeIcon size="lg" icon={faMicrophoneSlash} />
                )}
              </div>
            </div>

            {userRole === "clinician" || userRole === "patientslp" ? (
              <>
                {/* ACTION BUTTONS */}
                <div className="">
                  <button
                    className="text-button border"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <p className="fw-bold my-0 status">Actions</p>
                  </button>
                  <ul className="dropdown-menu">
                    {userRole === "clinician" ? (
                      <>
                        <li>
                          <a
                            role="button"
                            className="dropdown-item"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasWithBothOptions"
                            aria-controls="offcanvasWithBothOptions"
                          >
                            Message
                          </a>
                        </li>
                        <li>
                          <a role="button" className="dropdown-item" href="#">
                            Add Diagnostic
                          </a>
                        </li>
                        <li>
                          <a
                            role="button"
                            className="dropdown-item"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasDiagnosticTool"
                            aria-controls="offcanvasDiagnosticTool"
                          >
                            Diagnostic Tool
                          </a>
                        </li>
                        <li>
                          <a role="button" className="dropdown-item" href="#">
                            End Session
                          </a>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <a
                            role="button"
                            className="dropdown-item"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasWithBothOptions"
                            aria-controls="offcanvasWithBothOptions"
                          >
                            Message
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* CANVAS FOR MESSAGES */}
                <div
                  className="offcanvas offcanvas-start"
                  data-bs-scroll="true"
                  tabIndex="-1"
                  id="offcanvasWithBothOptions"
                  aria-labelledby="offcanvasWithBothOptionsLabel"
                >
                  <div className="offcanvas-header">
                    <h5
                      className="offcanvas-title"
                      id="offcanvasWithBothOptionsLabel"
                    >
                      Messages
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="offcanvas-body d-flex flex-column justify-content-between overflow-y-auto">
                    {/* CHAT AREA */}
                    <div>
                      {messages.map((msg, index) => (
                        <p key={index}>
                          <span className="fw-bold">{msg.sender}</span>:{" "}
                          {msg.message}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* INPUT CHAT */}
                  <form
                    className="input-group my-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(type);
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      onChange={(e) => setType(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      Send
                    </button>
                  </form>
                </div>

                {/* CANVAS FOR DIAGNOSTIC TOOL */}
                <div
                  className="offcanvas offcanvas-end"
                  tabIndex="-1"
                  id="offcanvasDiagnosticTool"
                  aria-labelledby="offcanvasDiagnosticToolLabel"
                >
                  <div className="offcanvas-header">
                    <h5
                      className="offcanvas-title"
                      id="offcanvasDiagnosticToolLabel"
                    >
                      Assistive Diagnostic Tool
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="offcanvas-body">
                    {/* Diagnostic Tool Content */}
                    <div className="button-container">
                      <button
                        className="text-button border"
                        onClick={startVoiceRecognitionHandler}
                      >
                        Start Voice Recognition
                      </button>
                    </div>

                    <div className="chart-container">
                      <div id="chartContainer">
                        <canvas id="outputChart"></canvas>
                      </div>
                    </div>

                    <div className="controls-container">
                      <div className="cardbox">
                        <div id="output"></div>
                        <span id="action"></span>
                      </div>
                    </div>

                    <div id="phoneme-container">
                      <div id="phoneme-output"></div>
                    </div>

                    <div id="score-container">
                      <h6>Speech Assessment Scores:</h6>
                      <div id="score-output">
                        Pronunciation:{" "}
                        {speechScore.pronunciationScore.toFixed(2)}%, Fluency:{" "}
                        {speechScore.fluencyScore.toFixed(2)}%
                      </div>
                    </div>

                    <div id="label-container"></div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
