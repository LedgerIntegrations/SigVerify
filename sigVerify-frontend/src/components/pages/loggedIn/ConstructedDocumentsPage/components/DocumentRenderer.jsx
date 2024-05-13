// import React, { useState, useRef } from 'react';
// import styled from 'styled-components';
// import { useDrop } from 'react-dnd';

// const Container = styled.div`
//     width: 80%;
//     max-width: 450px;
//     height: auto;
//     border: 2px dashed #b3d9ff;
//     text-align: center;
//     position: relative;
//     margin: 20px auto;
//     padding: 15px 20px;
//     background-color: #e6f0ff;
//     border-radius: 10px;

//     @media (hover: hover) {
//         &:hover {
//             border-color: #3385ff;
//         }
//     }
// `;

// const DocumentSection = styled.div`
//     margin-top: 20px;
//     max-width: 680px;
// `;

// const DocumentName = styled.p`
//     margin-top: 10px;
// `;

// const DocumentRenderer = () => {
//     const [document, setDocument] = useState(null);
//     const [pdfSrc, setPdfSrc] = useState('');
//     const uploadInputRef = useRef(null);

//     // Dummy state for holding dropped items, modify as needed
//     const [droppedItems, setDroppedItems] = useState([]);

//     const handleDrop = (event) => {
//         event.preventDefault();
//         const file = event.dataTransfer.files[0];
//         setDocument(file);
//         readPDF(file);
//     };

//     const handleFileInput = (event) => {
//         const file = event.target.files[0];
//         setDocument(file);
//         readPDF(file);
//     };

//     const handleClick = () => {
//         if (uploadInputRef.current) {
//             uploadInputRef.current.click();
//         }
//     };

//     const readPDF = (file) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//             setPdfSrc(reader.result);
//         };
//         reader.readAsDataURL(file);
//     };

//   const [{ isOver }, drop] = useDrop({
//       accept: 'box',
//       drop: (item, monitor) => {
//           const delta = monitor.getDifferenceFromInitialOffset();
//           if (delta) {
//               const left = Math.round(item.left + delta.x);
//               const top = Math.round(item.top + delta.y);
//               setDroppedItems((prevItems) => [...prevItems, { ...item, left, top }]);
//           }
//       },
//       collect: (monitor) => ({
//           isOver: !!monitor.isOver(),
//       }),
//   });

//     return (
//         <>
//             <Container ref={drop} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={handleClick}>
//                 <input ref={uploadInputRef} type="file" onChange={handleFileInput} accept=".pdf" style={{ display: 'none' }} />
//                 {document ? (
//                     <DocumentName>Uploaded Document: {document.name}</DocumentName>
//                 ) : (
//                     <p>Drag and drop or click here to upload a PDF document</p>
//                 )}
//                 {droppedItems.map((item, index) => (
//                     <div
//                         key={index}
//                         style={{ position: 'absolute', left: item.left, top: item.top, border: '1px solid black', padding: '5px' }}
//                     >
//                         {item.type}
//                     </div>
//                 ))}
//             </Container>
//             {pdfSrc && (
//                 <DocumentSection>
//                     <embed src={pdfSrc} type="application/pdf" width="100%" height="600px" />
//                 </DocumentSection>
//             )}
//         </>
//     );
// };

// export default DocumentRenderer;
// DocumentRenderer.jsx - Testing drop logic
// DocumentRenderer.js
import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Resizable } from 're-resizable';
import { FaTrash } from 'react-icons/fa';

const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 1px #ddd',
    background: '#f0f0f0',
    position: 'relative',
};


const customHandleStyles = {
    width: '10px', // Smaller width
    height: '10px', // Smaller height
};

const ResizeHandle = ({ custom }) => <div style={customHandleStyles } />;


const DraggableResizableBox = ({ item, onResize, onMove, onDelete, isActive, onActivate }) => {
    const [, drag] = useDrag({
        type: 'box',
        item: { ...item },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta) {
                const newLeft = Math.round(item.left + delta.x);
                const newTop = Math.round(item.top + delta.y);
                onMove(item.id, newLeft, newTop);
            }
        },
    });

    const elementRef = useRef(null);

    return (
        <Resizable
            style={style}
            size={{ width: item.width, height: item.height }}
            onResizeStop={(e, direction, ref, d) => {
                const newWidth = item.width + d.width;
                const newHeight = item.height + d.height;
                onResize(item.id, newWidth, newHeight);
            }}
            handleComponent={{
                top: <ResizeHandle />,
                right: <ResizeHandle />,
                bottom: <ResizeHandle />,
                left: <ResizeHandle />,
                topRight: <ResizeHandle />,
                bottomRight: <ResizeHandle />,
                bottomLeft: <ResizeHandle />,
                topLeft: <ResizeHandle />,
            }}
            enable={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
            }}
        >
            <div
                ref={(node) => {
                    drag(node);
                    elementRef.current = node;
                }}
                style={{
                    width: '110px',
                    height: '30px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onClick={() => onActivate(item.id, elementRef)}
            >
                {item.type}
                {isActive && (
                    <FaTrash
                        style={{
                position: 'absolute',
                          zIndex: 5,
                            top: -15,
                            right: 0,
                            cursor: 'pointer',
                            color: 'red',
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag event
                            onDelete(item.id);
                        }}
                    />
                )}
            </div>
        </Resizable>
    );
};

const DocumentRenderer = () => {
    const [items, setItems] = useState([]);
    const [activeItemId, setActiveItemId] = useState(null);
    const [activeItemRef, setActiveItemRef] = useState(null);
    const [documentUrl, setDocumentUrl] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeItemRef && activeItemRef.current && !activeItemRef.current.contains(event.target)) {
                setActiveItemId(null);
                setActiveItemRef(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeItemRef]);

    const [, drop] = useDrop({
        accept: 'box',
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const initialClientOffset = monitor.getInitialClientOffset();
            if (clientOffset && initialClientOffset) {
                const dx = clientOffset.x - initialClientOffset.x;
                const dy = clientOffset.y - initialClientOffset.y;
                if (item.isNew) {
                    const newItem = {
                        ...item,
                        id: `${item.type}-${Date.now()}`,
                        left: initialClientOffset.x + dx,
                        top: initialClientOffset.y + dy,
                        width: 100,
                        height: 30,
                        isNew: false,
                    };
                    setItems((prevItems) => [...prevItems, newItem]);
                } else {
                    const updatedItems = items.map((it) =>
                        it.id === item.id
                            ? {
                                  ...it,
                                  left: it.left + dx,
                                  top: it.top + dy,
                              }
                            : it
                    );
                    setItems(updatedItems);
                }
            }
        },
    });

    const handleResize = (id, width, height) => {
        const updatedItems = items.map((item) => (item.id === id ? { ...item, width, height } : item));
        setItems(updatedItems);
    };

    const handleDelete = (id) => {
        setItems(items.filter((item) => item.id !== id));
    };

  const handleDocumentUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setDocumentUrl(e.target.result);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
      <div>
          <input type="file" onChange={handleDocumentUpload} />
          {documentUrl && <embed src={documentUrl} type="application/pdf" width="100%" height="600px" />}
          <div ref={drop} style={{ width: '90%', height: '500px', position: 'relative', border: '2px solid blue' }}>
              {items.map((item) => (
                  <div key={item.id} style={{ position: 'absolute', left: item.left, top: item.top }}>
                      <DraggableResizableBox
                          item={item}
                          onResize={handleResize}
                          onMove={(id, left, top) => {
                              const updatedItems = items.map((it) =>
                                  it.id === id
                                      ? {
                                            ...it,
                                            left,
                                            top,
                                        }
                                      : it
                              );
                              setItems(updatedItems);
                          }}
                          onDelete={handleDelete}
                          isActive={activeItemId === item.id}
                          onActivate={(id, ref) => {
                              setActiveItemId(id);
                              setActiveItemRef(ref);
                          }}
                      />
                  </div>
              ))}
          </div>
      </div>
  );
};

export default DocumentRenderer;
