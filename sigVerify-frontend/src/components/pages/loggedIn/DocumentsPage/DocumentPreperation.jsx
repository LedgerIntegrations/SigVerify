import { useState, useMemo, useEffect, useRef } from 'react';
// import { DraggableCore } from 'react-draggable';
import { useLocation } from 'react-router-dom';
import DocumentViewer from '../DocumentsPage/DocumentViewer';
import SignatureBox from '../DocumentsPage/SignatureBox';
import styled from 'styled-components';
import media from '../../../Styles/media';

const DocumentPreperationContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding: 30px;
    justify-content: space-around;
`;

const DocumentPreperationActionsModal = styled.div`
    display: flex;
    flex-wrap: wrap;
    position: absolute;
    padding: 20px;
    bottom: 0px;
    background-color: gray;

    @media ${media.tablet} {
        flex-direction: column;
    }
`;

const DocumentViewerContainer = styled.div`
    min-width: 320px;
    max-width: 600px;
    min-height: 50vh;

    &:first-child {
        min-width: 500px;
    }
`;

function DocumentPreparation() {
    const [documentViewerSize, setDocumentViewerSize] = useState({ width: 0, height: 0 });
    const documentViewerRef = useRef(null);
    console.log(documentViewerRef);
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { offsetWidth, offsetHeight } = entry.target;
                setDocumentViewerSize({ width: offsetWidth, height: offsetHeight });
            }
        });

        if (documentViewerRef.current) {
            observer.observe(documentViewerRef.current);
        }

        // Clean up observer when component unmounts
        return () => {
            if (documentViewerRef.current) {
                observer.disconnect();
            }
        };
    }, []);

    console.log('documents viewer size: ', documentViewerSize);

    const [boxes, setBoxes] = useState([]);
    const [draggingBox, setDraggingBox] = useState(null);

    const location = useLocation();
    const document = location.state?.document;

    const handleDrag = (e, data, boxId) => {
        const relativeX = (data.x / documentViewerSize.width) * 100;
        const relativeY = (data.y / documentViewerSize.height) * 100;
        setDraggingBox({ id: boxId, x: relativeX, y: relativeY });
    };

    const handleDragStop = (e, data, boxId) => {
        const relativeX = (data.x / documentViewerSize.width) * 100;
        const relativeY = (data.y / documentViewerSize.height) * 100;
        setBoxes(boxes.map((box) => (box.id === boxId ? { ...box, x: relativeX, y: relativeY } : box)));
        setDraggingBox(null);
    };

    const addSignatureBox = () => {
        setBoxes([...boxes, { x: 0, y: 0, id: Date.now() }]);
    };

    const savePositions = async () => {
        // try {
        //     // Example: POST request to save the positions
        //     // Update the URL and data structure as needed for your backend
        //     await axios.post('http://localhost:3000/save-box-positions', { documentId: document.document_id, boxes });
        //     console.log('Positions saved');
        // } catch (error) {
        //     console.error('Error saving positions:', error);
        //     // Handle error
        // }

        console.log({ documentId: document.document_id, boxes });
    };



    const memoizedBoxes = useMemo(() => {
        return boxes.map((box) => (box.id === draggingBox?.id ? { ...box, x: draggingBox.x, y: draggingBox.y } : box));
    }, [boxes, draggingBox]);

    return (
        <DocumentPreperationContainer ref={documentViewerRef}>
            <DocumentPreperationActionsModal>
                <SignatureBox
                    boxes={memoizedBoxes}
                    onDrag={handleDrag}
                    onDragStop={handleDragStop}
                    documentViewerSize={documentViewerSize}
                />
                <button onClick={addSignatureBox}>Add Signature Box</button>
                <button onClick={addSignatureBox}>Add Signature Box</button>
                <button onClick={addSignatureBox}>Add Signature Box</button>
                <button onClick={addSignatureBox}>Add Signature Box</button>
                <button onClick={addSignatureBox}>Add Signature Box</button>
                <button onClick={savePositions}>Save Positions</button>
            </DocumentPreperationActionsModal>
            <DocumentViewerContainer>
                <DocumentViewer currentDocument={document} />
            </DocumentViewerContainer>
        </DocumentPreperationContainer>
    );
}

export default DocumentPreparation;
