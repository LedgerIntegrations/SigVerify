// LoadingIcon.jsx
import styled, { keyframes } from 'styled-components';
import { SiSpinrilla } from 'react-icons/si';

// Define the keyframes for the spin animation
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled span to contain the loading icon
const LoadingIconContainer = styled.span`
    vertical-align: middle;
    margin-right: 5px;

    svg {
        display: inline;
        animation: ${spin} 1s linear infinite;
    }
`;

// LoadingIcon component
const LoadingIcon = () => {
    return (
        <LoadingIconContainer>
            <SiSpinrilla />
        </LoadingIconContainer>
    );
};

export default LoadingIcon;
