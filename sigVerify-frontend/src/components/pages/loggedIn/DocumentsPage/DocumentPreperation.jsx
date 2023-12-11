import { useState, useMemo } from 'react';
// import { DraggableCore } from 'react-draggable';
import { useLocation } from 'react-router-dom';
import DocumentViewer from '../DocumentsPage/DocumentViewer';
// import axios from 'axios';
import SignatureBox from '../DocumentsPage/SignatureBox';

function DocumentPreparation() {
    const [boxes, setBoxes] = useState([]);
    const [draggingBox, setDraggingBox] = useState(null);

    const location = useLocation();
    const document = location.state?.document;

    const handleDrag = (e, data, boxId) => {
        setDraggingBox({ id: boxId, x: data.x, y: data.y });
    };

    const handleDragStop = (e, data, boxId) => {
        setBoxes(boxes.map((box) => (box.id === boxId ? { ...box, x: data.x, y: data.y } : box)));
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
        <div>
            <DocumentViewer currentDocument={document} />
            <SignatureBox boxes={memoizedBoxes} onDrag={handleDrag} onDragStop={handleDragStop} />
            <button onClick={addSignatureBox}>Add Signature Box</button>
            <button onClick={savePositions}>Save Positions</button>
        </div>
    );
}

export default DocumentPreparation;
