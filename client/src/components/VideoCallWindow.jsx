import React from "react";
import styled from "styled-components";
import { MdCallEnd } from "react-icons/md";

export default function VideoCallWindow({ isOpen, onClose }) {
  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <Window>
        <h2>Video Call</h2>
        <div>Video call interface content here...</div>
        <button onClick={onClose}>
          <MdCallEnd />
        </button>
      </Window>
    </Overlay>
  );
}

const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const Window = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
`;
