import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { useParams, useNavigate, useLocation } from "react-router-dom";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import "../../styles/containers.css";
import "../../styles/diagnostic.css";

import { toast, Slide } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

import { route } from "../../utils/route";

import ConfirmVideoCall from "../../components/Modals/ConfirmVideoCall.jsx";
import SoapSidebar from "../../components/Modals/SoapSidebar.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const useMediaStream = (localVideoRef) => {
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState(null);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState(null);
  const localStream = useRef(null);

  const getMediaStream = useCallback(
    async (constraints = { video: { deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined }, audio: { deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined } }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (error) {
        localStream.current = new MediaStream();
        console.warn("Failed to get user media:", error);
      }
    },
    [localVideoRef, selectedVideoDeviceId, selectedAudioDeviceId]
  );

  const stopMediaStream = useCallback(() => {
    localStream.current?.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    localStream.current = null;
  }, [localVideoRef]);

  return {
    getMediaStream,
    stopMediaStream,
    localStream,
    setSelectedVideoDeviceId,
    setSelectedAudioDeviceId,
  };
};

const notify = (message) =>
  toast.success(message, {
    transition: Slide,
    autoClose: 2000,
  });

export default function Room() {
  const { authState } = useContext(AuthContext);
  const userRole = authState.userRole;
  const currentUser = authState.userId;


  const appURL = import.meta.env.VITE_APP_URL;
  const accessToken = authState.accessToken;

  const location = useLocation();
  const { appointmentDetails } = location.state || {};
  const patientId = appointmentDetails?.patientId._id;
  const clinicianId = appointmentDetails?.selectedClinician;
  const clinicianName = appointmentDetails?.selectedSchedule.clinicianName;

  const { roomid } = useParams();

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [type, setType] = useState("");

  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);

  const socket = useRef(null);
  const isSocketOpen = useRef(false);
  const hasJoinedRoom = useRef(false);
  const [isActive, setIsActive] = useState(false);

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
    localStream,
    setSelectedVideoDeviceId,
    setSelectedAudioDeviceId,
  } = useMediaStream(localVideoRef);


  useEffect(() => {
    if (
      (userRole === "patientslp" &&
        appointmentDetails?.patientId._id !== currentUser) ||
      (userRole === "clinician" &&
        appointmentDetails?.selectedClinician._id !== currentUser) ||
      roomid === "errorRoomId"
    ) {
      handleCloseConnection();
    }

    // Fuck u refresh
    const handleBeforeUnload = (event) => {
      socket.current.send(
        JSON.stringify({
          type: "leave-room",
          roomID: roomid,
          user: getUserName(),
        })
      );
      const message =
        "Refreshing the page? We will try to reconnect you again.";
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      if (socket.current) {
        handleCloseConnection();
        hasJoinedRoom.current = false;
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const initiateConnection = async (videoDeviceId, audioDeviceId) => {
    try {
      await pageReady(videoDeviceId, audioDeviceId);
      socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

      socket.current.onopen = () => {
        isSocketOpen.current = true;
        if (!hasJoinedRoom.current) {
          socket.current.send(
            JSON.stringify({
              type: "join-room",
              user: getUserName(),
              roomID: roomid,
            })
          );
          hasJoinedRoom.current = true;
          setIsActive(true);
          startConnection(true);
        }
      };

      socket.current.onmessage = (message) => {
        gotMessageFromServer(message);
      };

      socket.current.onerror = (error) => {
        console.log("WebSocket error:", error);
      };

      socket.current.onclose = () => {
        notify("You have left the teleconference room.");
        isSocketOpen.current = false;
        hasJoinedRoom.current = false;
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket server:", error);
      handleCloseConnection();
    }
  };

  const pageReady = async (videoDeviceId, audioDeviceId) => {
    setSelectedVideoDeviceId(videoDeviceId);
    setSelectedAudioDeviceId(audioDeviceId);
    await getMediaStream({
      video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
      audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
    });
  };

  const startConnection = (isCaller) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.warn("Cannot start connection. Check WebSocket connection.");
      return;
    }

    peerConnection.current = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.current.onicecandidate = gotIceCandidate;
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        const [remoteStream] = event.streams;
        const videoTrack = remoteStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.enabled) {
          remoteVideoRef.current.srcObject = remoteStream;
        } else {
          remoteVideoRef.current.srcObject = null;
        }
      }
    };

    localStream.current
      ?.getTracks()
      .forEach((track) =>
        peerConnection.current.addTrack(track, localStream.current)
      );

    if (isCaller) {
      peerConnection.current
        .createOffer()
        .then(createDescription)
        .catch(console.warn("Trying to establish peer connection."));
    }

    processQueues();
  };

  const gotMessageFromServer = (message) => {
    const signal = JSON.parse(message.data);

    if (signal.sdp) {
      peerConnection.current
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            peerConnection.current
              .createAnswer()
              .then(createDescription)
              .catch(
                console.warn(
                  "Trying to set remote description for peer connection."
                )
              );
          }
          // Process queued ICE candidates
          while (iceQueue.current.length > 0) {
            const iceCandidate = iceQueue.current.shift();
            peerConnection.current
              .addIceCandidate(new RTCIceCandidate(iceCandidate))
              .catch(
                console.warn("Trying to add ICE candidate to peer connection.")
              );
          }
        })
        .catch(
          console.warn("Trying to set remote description for peer connection.")
        );
    } else if (signal.ice) {
      if (peerConnection.current.remoteDescription) {
        peerConnection.current
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch(
            console.warn("Trying to add ICE candidate to peer connection.")
          );
      } else {
        iceQueue.current.push(signal.ice);
      }
    } else if (signal.type === "room-full") {
      handleCloseConnection();
    } else if (signal.type === "chat-message") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: signal.message, sender: signal.sender },
      ]);
    } else if (signal.type === "leave-room") {
      handleCloseConnection();
    } else if (signal.type === "stop-session") {
      notify("Left the teleconference room.");
      handleCloseConnection();
    } else if (signal.type === "camera-status") {
      if (remoteVideoRef.current) {
        if (signal.enabled) {
          remoteVideoRef.current.srcObject = peerConnection.current.getRemoteStreams()[0];
        }
      }
    } else if (signal.type === "mic-status") {
      if (remoteVideoRef.current) {
        const remoteStream = peerConnection.current.getRemoteStreams()[0];
        const audioTrack = remoteStream?.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = signal.enabled;
        }
      }
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
            peerConnection.current
              .createAnswer()
              .then(createDescription)
              .catch(
                console.warn("Trying to create answer for peer connection.")
              );
          }
          // Process queued ICE candidates
          while (iceQueue.current.length > 0) {
            const iceCandidate = iceQueue.current.shift();
            peerConnection.current
              .addIceCandidate(new RTCIceCandidate(iceCandidate))
              .catch(
                console.warn("Trying to add ICE candidate to peer connection.")
              );
          }
        })
        .catch(
          console.warn("Trying to set remote description for peer connection.")
        );
    }

    // Process ICE queue
    while (
      iceQueue.current.length > 0 &&
      peerConnection.current.remoteDescription
    ) {
      const iceCandidate = iceQueue.current.shift();
      peerConnection.current
        .addIceCandidate(new RTCIceCandidate(iceCandidate))
        .catch(console.warn("Trying to add ICE candidate to peer connection."));
    }
  }

  const gotIceCandidate = (event) => {
    if (event.candidate) {
      if (socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            ice: event.candidate,
            uuid: getUserName(),
            roomID: roomid,
            type: "ice-candidate",
          })
        );
      } else {
        console.warn("Cannot get ICE candidate.");
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
            roomID: roomid,
            type: description.type,
          })
        );
      } else {
        console.warn("Cannot create description for connection.");
      }
    });
  };

  const toggleMic = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicEnabled(audioTrack.enabled);
    }
  
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({
          type: "mic-status",
          enabled: audioTrack.enabled,
          roomID: roomid,
        })
      );
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraEnabled(videoTrack.enabled);
    }
  
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({
          type: "camera-status",
          enabled: videoTrack.enabled,
          roomID: roomid,
        })
      );
    }
  };

  const handleCloseConnection = () => {
    stopMediaStream();

    socket.current.send(
      JSON.stringify({
        type: "camera-status",
        enabled: !isCameraEnabled,
        roomID: roomid,
      })
    );

    socket.current.send(
      JSON.stringify({
        type: "leave-room",
        roomID: roomid,
        user: getUserName(),
      })
    );

    peerConnection.current.close();
    socket.current.close();

    navigate("/");
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
    }
  };

  const getUserName = () => {
    return userRole === "patientslp"
      ? `${appointmentDetails?.patientId.firstName} ${appointmentDetails?.patientId.lastName}`
      : `${appointmentDetails?.selectedClinician.firstName} ${appointmentDetails?.selectedClinician.lastName}`;
  };

  const webSocketNotification = async (message) => {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};

    if (parsed.notif === "addSOAP") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
      };
    }

    try {
      const response = await fetch(`${appURL}/${route.notification.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      const result = await response.json();

      // Notify WebSocket server
      const resultWithNotif = { ...result, type: "notification" };

      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Confirm Call
  const [confirmCall, setConfirmCall] = useState(true);
  const handleConfirmCall = () => {
    setConfirmCall((prevState) => !prevState);
  };

  const onConfirm = async (videoDeviceId, audioDeviceId) => {
    initiateConnection(videoDeviceId, audioDeviceId);
    handleConfirmCall();
  };

  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentFaceData, setAssessmentFaceData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

    // Function to fetch the patient's speech assessment
    const fetchPatientAssessment = async () => {
      try {
        const patientId = appointmentDetails?.patientId._id;  
        if (!patientId) {
          setError('Patient ID is missing');
          return;
        }
  
        setIsLoading(true);
        const response = await fetch(`${appURL}/${route.patient.getAssessment}/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          console.log("Failed to fetch patient assessment");
          setError('Failed to fetch assessment');
        } else {
          const data = await response.json();
          setAssessmentData(data);
        }
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (appointmentDetails) {
        fetchPatientAssessment();
      }
    }, [appointmentDetails, appURL, accessToken]);

    // Function to fetch the patient's face assessment
    const fetchPatientFaceAssessment = async () => {
      try {
        const patientId = appointmentDetails?.patientId._id;  
        if (!patientId) {
          setError('Patient ID is missing');
          return;
        }

        setIsLoading(true);
        const response = await fetch(`${appURL}/${route.patient.getFaceAssessment}/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.log("Failed to fetch patient face assessment");
          setError('Failed to fetch face assessment');
        } else {
          const data = await response.json();
          setAssessmentFaceData(data);
        }
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Call `fetchPatientFaceAssessment` when `appointmentDetails` change
    useEffect(() => {
      if (appointmentDetails) {
        fetchPatientFaceAssessment();
      }
    }, [appointmentDetails, appURL, accessToken]);

    const FaceAssessmentGraph = ({ recordedData }) => {
      if (!recordedData || recordedData.length === 0) {
        return <p>No recorded data available.</p>;
      }
    
      const labels = recordedData.map((_, index) => index);
    
      const uniqueLabels = [...new Set(recordedData.flatMap(timeStep => timeStep.map(entry => entry.label)))];
    
      const datasets = uniqueLabels.map((label, labelIndex) => ({
        label, 
        data: recordedData.map(timeStep => {
          const entry = timeStep.find(data => data.label === label);
          return entry ? entry.probability : 0; 
        }),
        borderColor: `hsl(${labelIndex * 60}, 70%, 50%)`, 
        backgroundColor: `hsl(${labelIndex * 60}, 70%, 50%, 0.3)`,
        borderWidth: 2,
      }));
    

      const data = {
        labels, 
        datasets, 
      };
    
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Face Assessment Recorded Data',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (In span of 10 seconds)', 
            },
          },
          y: {
            title: {
              display: true,
              text: 'Confidence Score',
            },
            min: 0,
            max: 1, 
          },
        },
      };
    
      return <Line data={data} options={options} />;
    };


  return (
    <>
      {confirmCall && (
        <ConfirmVideoCall
          close={() => {
            navigate("/");
          }}
          confirm={onConfirm}
          user={getUserName()}
          room={roomid}
        />
      )}

      <div className="container-fluid vh-100 vw-100 d-flex flex-column">
        {/* HEADER ROW */}
        <div className="row flex-shrink-1 bg-white text-center py-2 border border-start-0 border-[#B9B9B9]">
          <p className="mb-0">
            {`Currently in session with ${
              appointmentDetails?.selectedClinician.firstName
            } ${appointmentDetails?.selectedClinician.lastName} and ${
              appointmentDetails?.patientId?.firstName || ""
            } ${appointmentDetails?.patientId?.lastName || ""}`}
          </p>
        </div>

        {/* CAMERA ROW */}
        <div className="row row-cols-lg-2 row-cols-1 flex-grow-1 bg-white">
          <div className="col p-0">
            <video
              ref={localVideoRef}
              className="mx-auto video-local bg-black"
              muted
              autoPlay
            />
          </div>

          <div className="col p-0">
            <video
              className="bg-black video-local mx-auto"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </div>
        </div>

        {/* ACTION ROW */}
        <div className="row flex-shrink-1 gap-1 bg-white d-flex align-items-center justify-content-center flex-row p-2">
          {/* Microphone and Camera Buttons */}
          <div className="d-flex flex-row gap-2 w-auto">
            <button
              className="icon-button"
              onClick={toggleCamera}
              disabled={!isActive}
            >
              {isCameraEnabled ? (
                <FontAwesomeIcon size="lg" icon={faVideo} />
              ) : (
                <FontAwesomeIcon size="lg" icon={faVideoSlash} />
              )}
            </button>

            <button
              className="icon-button"
              onClick={toggleMic}
              disabled={!isActive}
            >
              {isMicEnabled ? (
                <FontAwesomeIcon size="lg" icon={faMicrophone} />
              ) : (
                <FontAwesomeIcon size="lg" icon={faMicrophoneSlash} />
              )}
            </button>
          </div>

          {/* Actions Button */}
          {userRole === "clinician" || userRole === "patientslp" ? (
            <>
              {/* ACTION BUTTONS */}
              <div className="w-auto">
                <button
                  className="fw-bold my-0 text-button border"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  disabled={!hasJoinedRoom.current}
                >
                  Actions
                </button>
                <ul className="dropdown-menu">
                  {/* Message Button (Available for both clinician and patientslp) */}
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

                  {/* Add Diagnostic and Diagnostic Tool (Available only for clinicians) */}
                  {userRole === "clinician" ? (
                    <>
                      <li>
                        <a
                          role="button"
                          className="dropdown-item"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#soapSidebar"
                          aria-controls="offcanvasWithBothOptions"
                        >
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
                    </>
                  ) : (
                    <>
                      {/* Diagnostic Tool Button for patientslp */}
                      <li>
                        <a
                          role="button"
                          className="dropdown-item"
                          data-bs-toggle="modal"
                          data-bs-target="#diagnosticToolModal"
                        >
                          Diagnostic Tools
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Modal for Diagnostic Tool of patient */}
                <div
                  className="modal fade"
                  id="diagnosticToolModal"
                  tabIndex="-1"
                  aria-labelledby="diagnosticToolModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content shadow-lg border-0 rounded-3">
                      <div className="modal-header border-bottom-0">
                        <h5 className="modal-title text-primary" id="diagnosticToolModalLabel">
                          Assistive Diagnostic Tool
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p className="text-muted mb-4">
                          Choose between Speech or Face diagnostic tools to start the assessment.
                        </p>

                        {/* Buttons for Speech and Face tools */}
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-outline-primary btn-lg px-4 py-2"
                            onClick={() => window.open('/content/warn/speech', '_blank')}
                          >
                            Speech Tool
                          </button>
                          <button
                            className="btn btn-outline-primary btn-lg px-4 py-2"
                            onClick={() => window.open('/content/warn/face', '_blank')}
                          >
                            Face Tool
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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

              {/* CANVAS FOR SOAP */}
              <SoapSidebar
                clinicianId={clinicianId}
                clinicianName={clinicianName}
                patientName={`${appointmentDetails?.patientId?.firstName} ${appointmentDetails?.patientId?.lastName}`}
                patientId={patientId}
                onWebSocket={webSocketNotification}
              />

              {/* CANVAS FOR DIAGNOSTIC TOOL */}
              <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="offcanvasDiagnosticTool"
                aria-labelledby="offcanvasDiagnosticToolLabel"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasDiagnosticToolLabel">
                    Assistive Diagnostic Tool
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>

                <div className="offcanvas-body">
                  {/* Speech Assessment Section */}
                  <div className="mb-4 p-3 bg-light rounded shadow">
                    <h5 className="text-primary">Speech Assessment</h5>
                    {isLoading ? (
                      <p>Loading speech assessment data...</p>
                    ) : error ? (
                      <p className="text-danger">
                        {error.includes("Failed to fetch")
                          ? "No speech assessment data found."
                          : error}
                      </p>
                    ) : assessmentData ? (
                      <div>
                        {/* Speech assessment results */}
                        <div className="mb-3">
                          <h6>Top 3 Results:</h6>
                          <ul className="list-group">
                            {assessmentData.top3Results.map((result, index) => (
                              <li key={index} className="list-group-item">
                                {result.label}: {result.score.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Overall Score:</strong> {assessmentData.score}
                        </div>
                        <div>
                          <strong>Assessment Date:</strong>{" "}
                          {new Date(assessmentData.date).toLocaleDateString()}
                        </div>
                        <button
                          className="btn btn-primary mt-3"
                          onClick={fetchPatientAssessment}
                        >
                          Refresh Speech Assessment Data
                        </button>
                      </div>
                    ) : (
                      <p>No speech assessment data found.</p>
                    )}
                  </div>

                  {/* Face Assessment Section */}
                  <div className="p-3 bg-light rounded shadow">
                    <h5 className="text-primary">Face Assessment</h5>
                    {isLoading ? (
                      <p>Loading face assessment data...</p>
                    ) : error ? (
                      <p className="text-danger">
                        {error.includes("Failed to fetch")
                          ? "No face assessment data found."
                          : error}
                      </p>
                    ) : assessmentFaceData ? (
                      <div>
                        {/* Face assessment results */}
                        <div className="mb-3">
                          <h6>Top 2 Results:</h6>
                          <ul className="list-group">
                            {assessmentFaceData.topPredictions.map((result, index) => (
                              <li key={index} className="list-group-item">
                                {result.label}: {(result.probability * 100).toFixed(2)}%
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-3">
                          <strong>Recorded Data:</strong>
                          {assessmentFaceData.recordedData.length > 0 ? (
                            <div className="chart-container-face">
                              <FaceAssessmentGraph recordedData={assessmentFaceData.recordedData}/>
                            </div>
                          ) : (
                            <p>No recorded data available.</p>
                          )}
                        </div>
                        <div>
                          <strong>Assessment Date:</strong>{" "}
                          {new Date(assessmentFaceData.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          className="btn btn-primary mt-3"
                          onClick={fetchPatientFaceAssessment}
                        >
                          Refresh Face Assessment Data
                        </button>
                      </div>
                    ) : (
                      <p>No face assessment data found.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* Leave Button */}
          <div className="w-auto">
            <button
              onClick={() => {
                handleCloseConnection();
              }}
              type="submit"
              className="fw-bold text-button-red border"
              disabled={!isActive}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
