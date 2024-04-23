import styled from 'styled-components';

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    width: 50%;
    max-width: 500px;
`;

const CloseButton = styled.span`
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
`;

const ErrorMessage = styled.p`
    color: red;
    text-align: center;
`;

// eslint-disable-next-line react/prop-types
const ErrorModal = ({ message, onClose }) => {
    return (
        <ModalBackdrop>
            <ModalContainer>
                <CloseButton onClick={onClose}>X</CloseButton>
                <ErrorMessage>{message}</ErrorMessage>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default ErrorModal;