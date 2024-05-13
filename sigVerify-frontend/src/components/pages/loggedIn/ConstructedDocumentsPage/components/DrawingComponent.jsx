import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Canvas = styled.canvas`
    border: 2px solid #333;
    background-color: #fff;
`;

const DrawingComponent = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Drawing logic here
    }, []);

    return (
        <div>
            <Canvas ref={canvasRef} width={800} height={600} />
        </div>
    );
};

export default DrawingComponent;
