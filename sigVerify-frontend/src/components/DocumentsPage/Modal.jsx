// Modal.jsx
import React from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); // semi-transparent black
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  width: 80%;
  height: 70%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 100;
  overflow-y: auto;
`;

const Modal = ({ children, show, onClose }) => {
  if (!show) return null;

  return (
    <Backdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </Backdrop>
  );
};

export default Modal;
