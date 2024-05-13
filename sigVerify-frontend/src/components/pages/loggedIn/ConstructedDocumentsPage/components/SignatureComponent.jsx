// import React, { useState } from 'react';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { Resizable } from 're-resizable';
// import styled from 'styled-components';

// const StyledBox = styled(Resizable)`
//     border: 1px solid #333;
//     background-color: #fff;
//     text-align: center;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     font-size: .8em;
// `;

// const ItemType = {
//     BOX: 'box',
// };

// const DraggableBox = ({ id, left, top, children }) => {
//     const [{ isDragging }, drag] = useDrag(() => ({
//         type: ItemType.BOX,
//         item: { id, left, top },
//         collect: (monitor) => ({
//             isDragging: monitor.isDragging(),
//         }),
//     }));

//     return (
//         <div ref={drag} style={{ position: 'absolute', left, top, opacity: isDragging ? 0.5 : 1 }}>
//             {children}
//         </div>
//     );
// };

// const SignatureComponent = () => {
//     const [boxes, setBoxes] = useState([
//         { id: 'signature', type: 'Signature Box' },
//         { id: 'initials', type: 'Initials Box' },
//         { id: 'date', type: 'Date Box' },
//     ]);

//     return (
//         <DndProvider backend={HTML5Backend}>
//             <div style={{ position: 'relative', width: '100%', height: '100px', border: '1px dashed grey' }}>
//                 {boxes.map((box) => (
//                     <DraggableBox key={box.id} id={box.id} >
//                         <StyledBox
//                             size={{ width: 95, height: 20 }}
//                             enable={{
//                                 top: true,
//                                 right: true,
//                                 bottom: true,
//                                 left: true,
//                                 topRight: true,
//                                 bottomRight: true,
//                                 bottomLeft: true,
//                                 topLeft: true,
//                             }}
//                         >
//                             {box.type}
//                         </StyledBox>
//                     </DraggableBox>
//                 ))}
//             </div>
//         </DndProvider>
//     );
// };

// export default SignatureComponent;

// SignatureComponent.js
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';

const SignatureComponentContainer = styled.div`
  width: 80%;
  display: flex;
`
const DraggableBox = ({ id, type }) => {
    const [, drag] = useDrag({
        type: 'box',
        item: { id, type, isNew: true }, // Flag to indicate it's a new item
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            style={{ border: '1px solid black', padding: '5px 10px', margin: '5px', cursor: 'move', width: '100px', fontSize: '10px' }}
        >
            {type}
        </div>
    );
};

const SignatureComponent = () => {
    // Generate unique IDs for each type of box you might have
    const items = [
        { id: `signature-${Date.now()}`, type: 'Signature Box' },
        { id: `initials-${Date.now() + 1}`, type: 'Initials Box' },
        { id: `date-${Date.now() + 2}`, type: 'Date Box' },
    ];

    return (
        <SignatureComponentContainer>
            {items.map((item) => (
                <DraggableBox key={item.id} id={item.id} type={item.type} />
            ))}
        </SignatureComponentContainer>
    );
};

export default SignatureComponent;
