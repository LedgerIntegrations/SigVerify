import styled from 'styled-components';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1010;
`;

const AlertBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 90%;
    max-width: 400px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    z-index: 1030;
`;

const Message = styled.p`
    margin-bottom: 20px;
    text-align: start;
    padding: 0px 20px;
`;

const Button = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 0 10px;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: #0056b3;
    }

    &:first-child {
        background: #6c757d;

        &:hover {
            background: #5a6268;
        }
    }
`;

// Using the styled components in a functional component
const CustomAlert = ({ customAlertMessage, onContinue, onNavigate, loggedIn }) => {
    return (
        <Overlay>
            <AlertBox>
                <Message>{customAlertMessage}</Message>
                <Button onClick={onContinue}>Continue Anyway</Button>
                <Button onClick={onNavigate}>{loggedIn ? 'Go to Profile' : 'Register'}</Button>
            </AlertBox>
        </Overlay>
    );
};

export default CustomAlert;
