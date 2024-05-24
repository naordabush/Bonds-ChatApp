import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { MdCallEnd, MdMic, MdMicOff } from "react-icons/md";

export default function VideoCallWindow({ isOpen, onClose }) {
  const [localStream, setLocalStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    } else {
      // Clean up resources when the window is closed
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }
  }, [isOpen]);

  const handleToggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled; // Toggle the enabled state of the audio track
      });
      setIsMicMuted(!isMicMuted); // Update the state
    }
  };

  const handleHangUp = () => {
    onClose();
  };

  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay when clicking inside the window
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest("#video-call-window")) {
        e.preventDefault();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Overlay isOpen={isOpen}>
      <Window id="video-call-window" onClick={handleWindowClick}>
        <h2>Video Call</h2>
        <Video ref={videoRef} autoPlay playsInline />
        <Controls>
          <IconButton onClick={handleToggleMic}>
            {isMicMuted ? <MdMicOff /> : <MdMic />}
          </IconButton>
          <HangUpButton onClick={handleHangUp}>
            <MdCallEnd />
          </HangUpButton>
        </Controls>
      </Window>
    </Overlay>
  );
}

const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const Window = styled.div`
  background-color: #0c2844;
  padding: 20px;
  border-radius: 8px;
`;

const Video = styled.video`
  width: 100%;
  border-radius: 8px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const IconButton = styled.button`
  margin-right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 24px;

  &:focus {
    outline: none;
  }
`;

const HangUpButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #f00;
  font-size: 24px;

  &:focus {
    outline: none;
  }
`;
