import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import SignatureBox from '../../DocumentsPage/SignatureBox';

const DocumentPreperationActionsModal = styled.div`
    display: flex;
    position: absolute;
    padding: 20px;
    bottom: 20px;
    background-color: gray;
    /* flex-direction: column */

`;

const MobileActionModal = ({ documentViewerSize}) => {
      const [documentViewerSize, setDocumentViewerSize] = useState({ width: 0, height: 0 });


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
            <button onClick={savePositions}>Save Positions</button>
        </DocumentPreperationActionsModal>
    );
};

export default MobileActionModal;
