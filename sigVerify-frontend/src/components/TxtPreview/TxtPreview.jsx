import React, { useState, useEffect } from 'react';

function TxtPreview({ file }) {
    const [content, setContent] = useState('');
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
            setContent(reader.result);
        };
    }, [file]);

    useEffect(() => {
        const resizeListener = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', resizeListener);
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    let scale = .9;

    const containerStyle = {
        maxWidth: Math.min(width * scale, 500), // This ensures it won't go beyond 500px
        maxHeight: '400px',  // Set this to whatever height matches your PDF display
        overflowY: 'scroll',
        border: '1px solid #ccc',
        padding: '10px',
        marginTop: '10px',
        transform: `scale(${scale})`,
        transformOrigin: 'top'
    };

    return (
        <div style={containerStyle}>
            <p style={{fontSize: "10px"}}>{content}</p>
        </div>
    );
}

export default TxtPreview;
