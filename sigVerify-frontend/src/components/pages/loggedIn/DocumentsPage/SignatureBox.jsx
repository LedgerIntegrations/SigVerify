import { DraggableCore } from 'react-draggable';

// eslint-disable-next-line react/prop-types
function SignatureBox({ boxes, onDrag, onDragStop, documentViewerSize }) {
    return (
        <div style={{ position: 'relative' }}>
            {/* eslint-disable-next-line react/prop-types */}
            {boxes.map((box) => (
                <DraggableCore
                    key={box.id}
                    onDrag={(e, data) => onDrag(e, data, box.id)}
                    onStop={(e, data) => onDragStop(e, data, box.id)}
                >
                    <input
                        type="text"
                        placeholder="signature box"
                        style={{
                            position: 'absolute',
                            // eslint-disable-next-line react/prop-types
                            top: `${(box.y / 100) * documentViewerSize.height}px`,
                            // eslint-disable-next-line react/prop-types
                            left: `${(box.x / 100) * documentViewerSize.width}px`,
                            border: '1px solid black',
                            zIndex: 50,
                        }}
                    />
                </DraggableCore>
            ))}
        </div>
    );
}

export default SignatureBox;
