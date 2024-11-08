import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { useParams, useNavigate, useLocation } from "react-router-dom";

import "../../styles/containers.css";
import "../../styles/diagnostic.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

import { runSpeechRecognition } from "../../machinelearning/my_model/voice2text.js";
import { init } from "../../machinelearning/script.js";

const useMediaStream = (localVideoRef) => {
  const localStream = useRef(null);
  const getMediaStream = useCallback(
    async (constraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    },
    [localVideoRef]
  );

  const stopVideoStream = useCallback(() => {
    const videoTrack = localStream.current.getVideoTracks()[0];
    videoTrack.stop();

    localStream.current?.getVideoTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    localStream.current.removeTrack(videoTrack);
  }, [localVideoRef]);

  const stopAudioStream = useCallback(() => {
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    localStream.current?.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    localStream.current = null;
  }, [localVideoRef]);

  return {
    getMediaStream,
    stopMediaStream,
    stopVideoStream,
    stopAudioStream,
    localStream,
  };
};

export default function Room() {
  const { authState } = useContext(AuthContext);
  const role = authState.userRole;
  const currentUser = authState.userId;

  const location = useLocation();
  const { appointmentDetails } = location.state || {};
  const { roomid } = useParams();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [type, setType] = useState("");

  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [speechScore, setSpeechScore] = useState({
    pronunciationScore: 0,
    fluencyScore: 0,
  });

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);

  const socket = useRef(null);
  const isSocketOpen = useRef(false);
  const hasJoinedRoom = useRef(false);

  const sdpQueue = useRef([]);
  const iceQueue = useRef([]);

  const peerConnectionConfig = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  const {
    getMediaStream,
    stopMediaStream,
    stopVideoStream,
    stopAudioStream,
    localStream,
  } = useMediaStream(localVideoRef);

  useEffect(() => {
    const initializeModel = async () => {
      await init();
    };
    initializeModel();
  }, []);

  useEffect(() => {
    const initiateConnection = async () => {
      try {
        await pageReady();
        socket.current = new WebSocket(`ws://${import.meta.env.VITE_LOCALWS}`);

        socket.current.onopen = () => {
          isSocketOpen.current = true;
          console.log("Connection open");

          if (!hasJoinedRoom.current) {
            socket.current.send(
              JSON.stringify({
                type: "join-room",
                user: getUserName(),
                roomID: roomid,
              })
            );
            hasJoinedRoom.current = true;
            console.log("Joined the room");
            startConnection(true);
          }
        };

        socket.current.onmessage = gotMessageFromServer;

        socket.current.onerror = (error) =>
          console.error("WebSocket error:", error);

        socket.current.onclose = () => {
          console.warn("WebSocket connection closed");
          isSocketOpen.current = false;
          hasJoinedRoom.current = false;
        };
      } catch (error) {
        console.error("Error in pageReady:", error);
        handleCloseConnection();
      }
    };

    setUserRole(role);

    if (
      (role === "patientslp" &&
        appointmentDetails?.patientId._id !== currentUser) ||
      (role === "clinician" &&
        appointmentDetails?.selectedClinician !== currentUser) ||
      roomid === "errorRoomId"
    ) {
      handleCloseConnection();
    }
    initiateConnection();

    // Cleanup function when component unmounts
    return () => {
      if (socket.current) {
        handleCloseConnection();
      }
    };
  }, []);

  const pageReady = async () => {
    await getMediaStream({ video: true, audio: true });
  };

  const startConnection = (isCaller) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.warn(
        `WebSocket is not open (current state: ${socket.current.readyState}). Cannot initiate peer connection.`
      );
      return;
    }

    peerConnection.current = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.current.onicecandidate = gotIceCandidate;
    peerConnection.current.ontrack = gotRemoteStream;

    localStream.current
      ?.getTracks()
      .forEach((track) =>
        peerConnection.current.addTrack(track, localStream.current)
      );

    if (isCaller) {
      peerConnection.current
        .createOffer()
        .then(createDescription)
        .catch(console.error);
    }

    processQueues();
  };

  const gotMessageFromServer = (message) => {
    const signal = JSON.parse(message.data);

    if (signal.sdp) {
      sdpQueue.current.push(signal.sdp);
      processQueues();
    } else if (signal.ice) {
      iceQueue.current.push(signal.ice);
      processQueues();
    } else if (signal.type === "room-full") {
      handleCloseConnection();
    } else if (signal.type === "chat-message") {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) =>
            msg.message === signal.message && msg.sender === signal.sender
        );
        if (!messageExists) {
          return [
            ...prevMessages,
            { message: signal.message, sender: signal.sender },
          ];
        }
        return prevMessages;
      });
    } else if (signal.type === "leave-room") {
      console.log("Got leave-room from ws")
      handleCloseConnection();
    }
  };

  function processQueues() {
    while (
      sdpQueue.current.length > 0 &&
      peerConnection.current.signalingState === "stable"
    ) {
      const sdp = sdpQueue.current.shift();
      peerConnection.current
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          if (sdp.type === "offer") {
            peerConnection.current.createAnswer().then(createDescription);
          }
        });
    }

    // Process ICE queue
    while (
      iceQueue.current.length > 0 &&
      peerConnection.current.signalingState !== "closed"
    ) {
      const iceCandidate = iceQueue.current.shift();
      peerConnection.current.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }
  }

  const gotIceCandidate = (event) => {
    if (event.candidate) {
      if (socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            ice: event.candidate,
            uuid: getUserName(),
            type: "ice-candidate",
          })
        );
      } else {
        console.warn(
          `WebSocket is not open (current state: ${socket.current.readyState}). Cannot send ICE candidate.`
        );
      }
    }
  };

  const createDescription = (description) => {
    peerConnection.current.setLocalDescription(description).then(() => {
      if (socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            sdp: peerConnection.current.localDescription,
            uuid: getUserName(),
            type: description.type,
          })
        );
      } else {
        console.warn(
          `WebSocket is not open (current state: ${socket.current.readyState}). Cannot send SDP.`
        );
      }
    });
  };

  const gotRemoteStream = (event) => {
    if (remoteVideoRef.current)
      remoteVideoRef.current.srcObject = event.streams[0];
  };

  const toggleMic = () => {
    stopAudioStream();
    setIsMicEnabled(!isMicEnabled);
  };

  const toggleCamera = async () => {
    isCameraEnabled
      ? stopVideoStream()
      : await getMediaStream({ video: true, audio: true });
    setIsCameraEnabled(!isCameraEnabled);
  };

  const handleCloseConnection = () => {

    // stopMediaStream();

    socket.current.send(
      JSON.stringify({
        type: "leave-room",
        roomID: roomid,
        user: getUserName(),
      })
    );

    
    // peerConnection.current.close();
    // socket.current.close();

    // navigate("/");
  };

  const handleSendMessage = (data) => {
    if (data) {
      socket.current.send(
        JSON.stringify({
          type: "chat-message",
          message: data,
          roomID: roomid,
          sender: getUserName(),
        })
      );

      console.log("Sent a message:", data);
    }
  };

  const getUserName = () => {
    return userRole === "patientslp"
      ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
      : appointmentDetails?.selectedSchedule.clinicianName;
  };

  const startVoiceRecognitionHandler = () => {
    runSpeechRecognition(setSpeechScore);
  };

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
              ref={localVideoRef}
              className="mx-auto video-local bg-black"
              muted
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
              }}
              type="submit"
              className="text-button border"
            >
              <p className="fw-bold my-0 status">Disconnect</p>
            </button>

            {/* CAMERA AND MUTE */}
            <div className="d-flex align-items-center gap-2 mx-1">
              <div onClick={toggleCamera} style={{ cursor: "pointer" }}>
                {isCameraEnabled ? (
                  <FontAwesomeIcon size="lg" icon={faVideo} />
                ) : (
                  <FontAwesomeIcon size="lg" icon={faVideoSlash} />
                )}
              </div>

              <div onClick={toggleMic} style={{ cursor: "pointer" }}>
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
                    className="input-group my-3 p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(type);
                      setType("");
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      value={type}
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
