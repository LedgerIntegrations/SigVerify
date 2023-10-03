
import React, { useState, useEffect } from 'react';

function TxtPreview({ file }) {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
            setContent(reader.result);
        };
    }, [file]);

    return (
        <div style={{ maxHeight: '100px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <pre>{content}</pre>
        </div>
    );
}

export default TxtPreview;