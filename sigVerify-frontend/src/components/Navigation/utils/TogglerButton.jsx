import styled from 'styled-components';

const ToggleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: .5em;
  padding: .125em;
  background-image: linear-gradient(to bottom, #d0c4b8, #f5ece5);
  box-shadow: 0 1px 1px rgb(255 255 255 / .6);
`;

const ToggleCheckbox = styled.input.attrs({ type: 'checkbox' })`
  -webkit-appearance: none;
  appearance: none;
  position: absolute;
  z-index: 1;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border-radius: .375em;
  width: 3em;
  height: 1.5em;
  background-color: #e1dacd;
  box-shadow:
    inset 0 0 .0625em .125em rgb(255 255 255 / .2),
    inset 0 .0625em .125em rgb(0 0 0 / .4);
  transition: background-color .4s linear;

  ${ToggleCheckbox}:checked + & {
    background-color: teal;
  }
`;

const ToggleButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: .0625em;
  border-radius: .3125em;
  width: 1.375em;
  height: 1.375em;
  background-color: #e4ddcf;
  box-shadow:
    inset 0 -.0625em .0625em .125em rgb(0 0 0 / .1),
    inset 0 -.125em .0625em rgb(0 0 0 / .2),
    inset 0 .1875em .0625em rgb(255 255 255 / .3),
    0 .125em .125em rgb(0 0 0 / .5);
  transition: left .4s;

  ${ToggleCheckbox}:checked + ${ToggleContainer} > & {
    left: 1.5625em;
  }
`;

const ToggleButtonCirclesContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, min-content);
    gap: .125em;
    position: absolute;
    margin: 0 auto;
`;

const ToggleButtonCircle = styled.div`
  border-radius: 50%;
  width: .125em;
  height: .125em;
  background-image: radial-gradient(circle at 50% 0, #f6f0e9, #bebcb0);
`;

const TogglerButton = (title, description, value) => {
    return (
        <ToggleWrapper>
            <ToggleCheckbox />
            <ToggleContainer>
                <ToggleButton>
                    <ToggleButtonCirclesContainer>
                        {[...Array(12)].map((_, index) => (
                            <ToggleButtonCircle key={index} />
                        ))}
                    </ToggleButtonCirclesContainer>

                </ToggleButton>
            </ToggleContainer>
        </ToggleWrapper>

    )
}

export default TogglerButton;