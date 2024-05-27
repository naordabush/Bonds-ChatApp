import React from "react";
import styled from "styled-components";

export default function IncomingCallWindow({
  isOpen,
  onAccept,
  onReject,
  remoteVideoRef,
}) {
  if (!isOpen) return null;

  return (
    <Container>
      <div className="video-container">
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <div className="buttons">
        <button onClick={onAccept}>Accept</button>
        <button onClick={onReject}>Reject</button>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .video-container {
    display: flex;
    gap: 1rem;
    video {
      width: 400px;
      height: 300px;
      background-color: black;
    }
  }
  .buttons {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    button {
      padding: 0.5rem 1rem;
      background-color: #4e0eff;
      color: white;
      border: none;
      border-radius: 0.3rem;
      cursor: pointer;
      font-size: 1rem;
      &:hover {
        background-color: #6f4dff;
      }
    }
    button:nth-child(2) {
      background-color: red;
      &:hover {
        background-color: darkred;
      }
    }
  }
`;
