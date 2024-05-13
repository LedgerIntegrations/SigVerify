import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import PDFViewer from './PDFViewer'; // Import the new component
import { DraggableField } from './DraggableField';

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-height: 80vh;

    .dropzone {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 20px;
        margin-top: 30px;
        border: 2px dashed ${(props) => (props.$isDragActive ? 'rgb(32, 109, 252);' : 'rgb(102, 148, 233);')};
        height: 140px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-align: center;
        width: 95%;
        border-radius: 20px;
        padding-inline: 40px;
        font-size: 13px;
        background-color: rgb(227, 234, 245);

        svg {
            height: 50px;
            width: 50px;
            color: rgb(102, 148, 233);
        }
    }
`;

const Sidebar = styled.div`
    width: 100%;
    max-width: 600px;
    padding: 10px;
    display: flex;
    flex-direction: column; // Makes it easier to control vertical layout
    align-items: center; // Centers the pages horizontally
    justify-content: center;

    > div {
        display: flex;
        width: 100%; // Ensure the container takes full width of Sidebar

        > div {
            flex: 1; // Each child div will equally share the width
            min-width: 0; // Helps prevent overflow
            display: flex;
            justify-content: center;
        }
    }
`;

const PdfViewerWrapper = styled.div`
    position: relative; /* Ensure non-static positioning for absolute children */
    width: 95%;
    max-width: 650px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    scroll-snap-type: y mandatory; // Enable vertical scroll snapping

    canvas {
        max-width: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        height: auto !important;
    }

    .react-pdf__Document {
        max-height: 60vh;
        width: 100%;
        margin: 5px !important;
    }

    .react-pdf__Page {
        max-width: 100%;
        min-width: none;
    }
`;

const PDFDragAndDrop = () => {
    const [file, setFile] = useState(null);

    const handleFileDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        } else {
            console.error('No files accepted');
        }
    };

    function PDFDropZone({ onDrop }) {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            accept: { 'application/pdf': ['.pdf'] },
        });

        return (
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
            </div>
        );
    }

    return (
        <Container>
            <PdfViewerWrapper>
                {file ? (
                    <PDFViewer file={file} />
                ) : (
                    <PDFDropZone onDrop={handleFileDrop} />
                )}
            </PdfViewerWrapper>
            <Sidebar>
                <div>
                    <DraggableField name="Signature" />
                    <DraggableField name="Date" />
                    <DraggableField name="Text" />
                </div>
            </Sidebar>
        </Container>
    );
};

export default PDFDragAndDrop;
