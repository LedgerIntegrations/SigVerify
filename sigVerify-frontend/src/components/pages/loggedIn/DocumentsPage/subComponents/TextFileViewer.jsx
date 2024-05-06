import { useState, useEffect } from 'react';
import styled from 'styled-components';

const TextFileDisplay = styled.div`
    min-height: 33vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    margin-top: 26px;
    margin-inline: auto;
    background-color: white;
    border-radius: 5px;
    padding: 15px;

    p {
      text-align: start;
    }

    h3 {
      width: fit-content;
      margin-block: 10px;
    }

    @media (min-width: 620px) {
        margin-top: 0px;
        grid-column: 9/24;
        grid-row: 1;

        h3 {
          margin-top: 0px;
        }
    }
`;

const TextContent = styled.p`
    font-size: 13px;
`;

// eslint-disable-next-line react/prop-types
function TextFileViewer({ presignedUrl, filename }) {
    const [fileContent, setFileContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTextFile = async () => {
            try {
                const response = await fetch(presignedUrl);
                if (!response.ok) throw new Error('Failed to fetch the text file.');
                const text = await response.text();
                setFileContent(text);
            } catch (err) {
                console.error('Error fetching text file:', err);
                setError('Failed to load the text file.');
            }
        };

        fetchTextFile();
    }, [presignedUrl]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <TextFileDisplay>
            <h3>{filename}</h3>
            <TextContent>{fileContent}</TextContent>
        </TextFileDisplay>
    );
}

export default TextFileViewer;
