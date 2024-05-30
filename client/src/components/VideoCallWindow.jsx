import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";
import Draggable from "react-draggable";

export default function VideoCallWindow({ isOpen, onClose }) {
  const [localStream, setLocalStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const animationIdRef = useRef();

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          videoRef.current.srcObject = stream;
          setupAudioVisualizer(stream);
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        setIsMicMuted(false);
        setIsCameraOff(false);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationIdRef.current);
    }
  }, [isOpen]);

  const setupAudioVisualizer = (stream) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const barWidth = canvas.width / bufferLength;
      const barSpacing = 2;
      const barHeightMultiplier = canvas.height / 255;

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * barHeightMultiplier;
        const x = i * (barWidth + barSpacing);
        const y = canvas.height - barHeight;

        // Smoothly interpolate hue across the spectrum
        const hue = (i / bufferLength) * 360;

        // Convert HSL to RGB color
        const rgbColor = `hsl(${hue}, 100%, 50%)`;

        canvasCtx.fillStyle = rgbColor;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    draw();

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  };

  const handleToggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const handleToggleCamera = () => {
    if (localStream) {
      if (isCameraOff) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((newStream) => {
            const videoTrack = newStream.getVideoTracks()[0];
            localStream.addTrack(videoTrack);
            setLocalStream(new MediaStream(localStream.getTracks()));
            videoRef.current.srcObject = new MediaStream(
              localStream.getTracks()
            );
            setIsCameraOff(false);
          })
          .catch((error) => {
            console.error("Error accessing media devices:", error);
          });
      } else {
        localStream.getVideoTracks().forEach((track) => track.stop());
        setLocalStream(new MediaStream(localStream.getAudioTracks()));
        videoRef.current.srcObject = new MediaStream(
          localStream.getAudioTracks()
        );
        setIsCameraOff(true);
      }
    }
  };

  const handleHangUp = () => {
    onClose();
  };

  const handleWindowClick = (e) => {
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
      <Draggable handle="#video-call-window" bounds="parent">
        <Window id="video-call-window" onClick={handleWindowClick}>
          <Title>Video Call</Title>
          <VideoContainer>
            <Video ref={videoRef} autoPlay playsInline />
            {isCameraOff && (
              <CameraOffOverlay>
                <MdVideocamOff size={48} />
                <CameraOffText>Camera feed is off</CameraOffText>
              </CameraOffOverlay>
            )}
          </VideoContainer>
          <CanvasContainer>
            <Canvas ref={canvasRef} width="600" height="100" />
          </CanvasContainer>
          <Controls>
            <IconButton onClick={handleToggleMic} isMuted={isMicMuted}>
              {isMicMuted ? <MdMicOff /> : <MdMic />}
            </IconButton>
            <IconButton onClick={handleToggleCamera} isCameraOff={isCameraOff}>
              {isCameraOff ? <MdVideocamOff /> : <MdVideocam />}
            </IconButton>
            <HangUpButton onClick={handleHangUp}>
              <MdCallEnd />
            </HangUpButton>
          </Controls>
        </Window>
      </Draggable>
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
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: move;
`;

const Title = styled.h2`
  color: #ffffff;
  text-align: center;
  margin-bottom: 10px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
`;

const Video = styled.video`
  width: 100%;
  border-radius: 8px;
  transform: scaleX(-1);
`;

const CameraOffOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  color: #ffffff;
`;

const CameraOffText = styled.p`
  margin-top: 10px;
  font-size: 18px;
`;

const CanvasContainer = styled.div`
  margin-top: 10px;
`;

const Canvas = styled.canvas`
  width: 100%;
  border-radius: 8px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
`;

const IconButton = styled.button`
  background-color: ${({ isMuted, isCameraOff }) => {
    if (isMuted || isCameraOff) return "#ffeb3b";
    return "#333";
  }};
  border: none;
  cursor: pointer;
  color: #ffffff;
  font-size: 24px;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ isMuted, isCameraOff }) => {
      if (isMuted || isCameraOff) return "#fdd835";
      return "#555";
    }};
  }

  &:focus {
    outline: none;
  }
`;

const HangUpButton = styled(IconButton)`
  background-color: #f00;

  &:hover {
    background-color: #d32f2f;
  }
`;
