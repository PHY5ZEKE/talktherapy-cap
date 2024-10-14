import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Rnd } from "react-rnd";
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

  // UUID
  function createUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
  }

  const currentUser = localStorage.getItem("userId");
  const uuid = currentUser;

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
      const domain = "server-production-2381.up.railway.app";
      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      serverConnection.current = new WebSocket(`wss://${domain}`);

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

    // Handle text messages
    if (signal.type === "message") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: signal.message, isSent: false }, // Mark it as received
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
    // console.log(
    //   "Sending ICE candidate:",
    //   JSON.stringify({
    //     ice: event.candidate,
    //     uuid: uuid,
    //     type: "ice-candidate",
    //   })
    // );
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

  // TODO: Change sender name
  function sendMessage(message) {
    if (!message || !serverConnection.current) return;
    serverConnection.current.send(
      JSON.stringify({ type: "message", message, roomID: roomid, uuid })
    );
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, sender: uuid, isSent: true }, // Mark as sent
    ]);
  }

  return (
    <>
      <div className="container-fluid mx-auto room-height">
        <div className="row text-center py-2 border border-start-0 border-[#B9B9B9] sticky-top">
          {/* TODO: Change names */}
          <p className="mb-0">
            Currently in session with: Dr. Juan Dela Cruz and Nicole E. Oraya
          </p>
        </div>
        <div className="my-3 room-videos">
          <Rnd
            default={{
              x: 0,
              y: 105,
              width: "45vw",
              height: "55vh",
            }}
            minWidth={"280px"}
            minHeight={"200px"}
            bounds=".room-videos"
            className={isHidden ? `drag bg-black-subtle` : `drag`}
          >
            <video
              muted
              ref={localVideoRef}
              className="mx-auto video-local bg-warning-subtle"
              autoPlay
            />
          </Rnd>

          <video
            className="bg-black video-remote mx-auto"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          ></video>
        </div>

        <div className="row bg-white border border-start-0 border-[#B9B9B9] fixed-bottom">
          <div className="d-flex align-items-center justify-content-center">
            <div className="p-2">
              <div className="row py-1">
                <div className="col">
                  <button
                    onClick={handleDisconnect}
                    type="submit"
                    className="button-group bg-white"
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
                        className="button-group bg-white"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <p className="fw-bold my-0 status">Actions</p>
                      </button>
                      <ul className="dropdown-menu">
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
                          <a role="button" className="dropdown-item" href="#">
                            Diagnostic Tool
                          </a>
                        </li>
                        <li>
                          <a role="button" className="dropdown-item" href="#">
                            End Session
                          </a>
                        </li>
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
                              <span className="fw-bold">{msg.sender}:</span>
                              {msg.message}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* INPUT CHAT */}
                      <div className="input-group position-sticky my-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type a message..."
                          onChange={(e) => setType(e.target.value)}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => sendMessage(type)}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {/* <button type="submit" className="button-group bg-white">
                  <p className="fw-bold my-0 status">Messages</p>
                </button> */}

                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
