import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { route } from "../../utils/route";

import "../../styles/containers.css";

// Icons
import Mic from "../../assets/buttons/Mic";
import Camera from "../../assets/buttons/Camera";

export default function Room() {
  // Error
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [messages, setMessages] = useState([]); // State for storing messages
  const [type, setType] = useState("");
  const [appointment, setAppointment] = useState([]);
  const appURL = import.meta.env.VITE_APP_URL;

  // Nav
  const navigate = useNavigate();

  // Get Room ID
  const { roomid } = useParams();

  // Get Appointment ID
  const { appid } = useParams();

  // Get video stream
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStream = useRef();

  // Connections
  const peerConnection = useRef();
  const serverConnection = useRef();

  const [isHidden, setHidden] = useState(true);

  const currentName = localStorage.getItem("userName");
  const uuid = currentName;

  const peerConnectionConfig = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    const currentUser = localStorage.getItem("userId");
    setUserRole(role);

    const fetchAppointment = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.appointment.getById}/${appid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointment(data)

        // Validate user roles after fetching appointment
        if (
          (role === "patientslp" && data.patientId._id !== currentUser) ||
          (role === "clinician" && data.selectedClinician !== currentUser) ||
          roomid === "errorRoomId"
        ) {
          navigate("/unauthorized");
        } else {
          pageReady();
          return () => {
            peerConnection.current?.close();
            serverConnection.current?.close();
          };
        }
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
        setError(error.message);
      }
    };

    // Fetch appointment data on component mount
    fetchAppointment();
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

      serverConnection.current = new WebSocket(`wss://${import.meta.env.VITE_WSS}`);

      serverConnection.current.onopen = () => {
        // Join the room by sending the room ID to the server
        serverConnection.current.send(
          JSON.stringify({ type: "join-room", roomID: roomid })
        );
        console.log("Connection open");

        start(true);
        console.log("Start WebRTC signaling");
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
      console.log("WebSocket connection is not open");
      return;
    }

    peerConnection.current = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.current.onicecandidate = gotIceCandidate;
    peerConnection.current.ontrack = gotRemoteStream;

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    if (isCaller) {
      peerConnection.current
        .createOffer()
        .then(createdDescription)
        .catch(errorHandler);
    }
  }

  function gotMessageFromServer(message) {
    const signal = JSON.parse(message.data);

    // Handle WebRTC messages (SDP, ICE candidates)
    if (signal.sdp) {
      peerConnection.current
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            peerConnection.current
              .createAnswer()
              .then(createdDescription)
              .catch(errorHandler);
          }
        })
        .catch(errorHandler);
    } else if (signal.ice) {
      peerConnection.current
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch(errorHandler);
    }

    // Handle Room Maximum Capacity
    if (signal.type === "room-full") {
      navigate("/unauthorized");
    }

    // Handle text messages
    if (signal.type === "message") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: signal.message, sender: signal.sender, isSent: false }, // Mark it as received
      ]);
    }
  }

  function gotIceCandidate(event) {
    if (event.candidate != null) {
      serverConnection.current.send(
        JSON.stringify({
          ice: event.candidate,
          uuid: uuid,
          type: "ice-candidate",
        })
      );
    }
  }

  function createdDescription(description) {
    console.log("got description");

    peerConnection.current
      .setLocalDescription(description)
      .then(() => {
        serverConnection.current.send(
          JSON.stringify({
            sdp: peerConnection.current.localDescription,
            uuid: uuid,
            type: description.type,
          })
        );
      })
      .catch(errorHandler);
  }

  function gotRemoteStream(event) {
    console.log("got remote stream");
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
    console.log(
      "Peer Connection State:",
      peerConnection.current.connectionState
    );
  }

  function errorHandler(error) {
    console.log(error);
  }

  function muteMic() {
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  function muteCam() {
    setHidden(!isHidden);
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  }

  function handleDisconnect() {
    localStream.current.getTracks().forEach((track) => track.stop());

    // Close peer and socket connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (serverConnection.current) {
      serverConnection.current.close();
      serverConnection.current = null;
    }

    navigate("/");
  }

  function sendMessage(message) {
    if (!message || !serverConnection.current) return;

    serverConnection.current.send(
      JSON.stringify({ type: "message", message, roomID: roomid, sender: uuid })
    );

    // Get JSON data from websocket broadcast

    setMessages((prevMessages) => [
      ...prevMessages,
      { message, sender: uuid, isSent: true }, // Mark as sent
    ]);
  }

  return (
    <>
      <div className="container-fluid d-flex flex-column justify-content-between vh-100">
        <div className="row text-center py-2 border border-start-0 border-[#B9B9B9]">
          <p className="mb-0">
            Currently in session with:{" "}  
              {appointment?.selectedSchedule?.clinicianName || "Clinician not available"} and{" "} 
              {appointment?.patientId?.firstName || ""}{" "}
              {appointment?.patientId?.middleName || ""}{" "}
              {appointment?.patientId?.lastName || ""}
          </p>
        </div>

        <div className="row-auto d-flex flex-wrap flex-md-row flex-column bg-warning h-100">
          <div className="col">
            <video
              muted
              ref={localVideoRef}
              className="mx-auto video-local bg-warning-subtle"
              autoPlay
            />
          </div>

          <div className="col">
            <video
              className="bg-black video-remote mx-auto"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </div>
        </div>

        <div className="row bg-white border border-start-0 border-[#B9B9B9]">
          <div className="d-flex align-items-center justify-content-center">
            <div className="p-2">
              <div className="row py-1">
                <div className="col">
                  <button
                    onClick={handleDisconnect}
                    type="submit"
                    className="text-button border"
                  >
                    <p className="fw-bold my-0 status">Disconnect</p>
                  </button>
                </div>

                <div
                  className="col"
                  onClick={muteCam}
                  style={{ cursor: "pointer" }}
                >
                  <Camera />
                </div>

                <div
                  className="col d-flex align-items-center justify-content-center"
                  onClick={muteMic}
                  style={{ cursor: "pointer" }}
                >
                  <Mic />
                </div>

                {userRole === "clinician" || userRole === "patientslp" ? (
                  <>
                    {/* ACTION BUTTONS */}
                    <div className="col">
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
                              <a
                                role="button"
                                className="dropdown-item"
                                href="#"
                              >
                                Add Diagnostic
                              </a>
                            </li>
                            <li>
                              <a
                                role="button"
                                className="dropdown-item"
                                href="#"
                              >
                                Diagnostic Tool
                              </a>
                            </li>
                            <li>
                              <a
                                role="button"
                                className="dropdown-item"
                                href="#"
                              >
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

                    {/* CANVAS */}
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
                  </>
                ) : null}

                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
