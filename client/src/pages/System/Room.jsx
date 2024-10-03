import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Rnd } from "react-rnd";

import "../../styles/containers.css";

// Icons
import Mic from "../../assets/buttons/Mic";
import Camera from "../../assets/buttons/Camera";

export default function Room() {
  // Get Room ID
  const { roomid } = useParams();

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

  const uuid = createUUID();

  const peerConnectionConfig = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    pageReady();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (serverConnection.current) {
        serverConnection.current.close();
      }
    };
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
    if (!peerConnection.current) start(false);

    const signal = JSON.parse(message.data);
    console.log("Received message from server:", message.data);

    // Ignore messages from ourself
    if (signal.uuid === uuid) return;

    if (signal.sdp) {
      peerConnection.current
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          // Only create answers in response to offers
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
      console.log("Received ICE candidate:", signal.ice);
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
    console.log(
      "Sending ICE candidate:",
      JSON.stringify({
        ice: event.candidate,
        uuid: uuid,
        type: "ice-candidate",
      })
    );
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

  return (
    <>
      <div className="container-fluid mx-auto room-height bg-dark-subtle">
        <div className="row text-center py-2 bg-warning-subtle sticky-top">
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
              ref={localVideoRef}
              className="mx-auto video-local"
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

        <div className="row bg-warning-subtle fixed-bottom">
          <div className="d-flex align-items-center justify-content-center">
            <div className="bg-body-tertiary">
              <div className="row py-1">
                <button type="submit" className="button-group bg-white">
                  <p className="fw-bold my-0 status">Disconnect</p>
                </button>
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

                <button type="submit" className="button-group bg-white">
                  <p className="fw-bold my-0 status">Messages</p>
                </button>

                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
