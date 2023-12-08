import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 00px;
  background-color: white;
  border-radius: 10px;
  box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
    7px 7px 20px 0px rgba(0, 0, 0, 0.1),
    0px 0px 0px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  overflow-y: hidden;

  p {
    margin-block: 10px;
    font-size: 12px;
  }
`;

const Slider = styled.input.attrs({
  type: 'range',
  min: '0',
  max: '100',
})`
  appearance: none; /* Disables default browser styles */
  width: 100%;
  margin: 0px;
  border-radius: 10px;
  cursor: pointer;

  /* Custom thumb styles */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    position: relative;
    left: -10px;
    bottom: 0px;
    background-color: #222;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5),
      7px 7px 20px 0px rgba(0, 0, 0, 0.1),
      4px 4px 5px 0px rgba(0, 0, 0, 0.1);
    height: 40px;
    width: 40px;
    margin-left: 10px;
    border-radius: 10px 10px 10px 10px;
    z-index: 5;
    cursor: pointer;
  }

  /* Custom track styles */
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 40px;
    background: transparent;
    border-radius: 3px;
  }

  /* Repeat for Mozilla and Microsoft browsers */
  /* ... */
`;


const SliderText = styled.span`
  position: absolute;
  top: 50%;
  left: 0;
  margin-inline: 20px;
  width: calc(100% - 40px);
  text-align: end;
  font-size: 12px;
  transform: translateY(-50%);
  pointer-events: none; /* Ensures the slider thumb can still be dragged over the text */
  z-index: 1; /* To ensure text is above the track but below the thumb */
`;

const ColoredOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  height: 40px; /* Match the track's height */
  background-color: white;
  transform: translateY(-50%);
  border-radius: 10px 10px 10px 10px;
  z-index: 2; /* Below the text */
`;


const NavigationSlider = ({ navigateTo, pageName }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const navigate = useNavigate();

  const handleSliderChange = (event) => {
    const value = event.target.value;
    setSliderValue(value);
    setTimeout(() => {
       if (value < 100) {
           setSliderValue(0);
       }
    }, 1000)

    if (value === '100') {
      navigate(navigateTo);
    }
  };

  let overlayWidth;
  if (sliderValue > 30) {
    overlayWidth = `${sliderValue}%`;
  } else if (sliderValue > 22) {
    overlayWidth = '75px';
  } else if (sliderValue > 11) {
    overlayWidth = '60px';
  } else {
    overlayWidth = '40px';
  }

  return (
    <SlideContainer>
      <SliderText>Slide to view { pageName } →</SliderText>
      <ColoredOverlay style={{ width: overlayWidth }} />
      <Slider
        value={sliderValue}
        onChange={handleSliderChange}
      />
    </SlideContainer>
  );
};

export default NavigationSlider;