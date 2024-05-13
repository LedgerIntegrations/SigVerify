// import { useState } from 'react';
// import styled from 'styled-components';

// // Styled Components
// const Container = styled.div`
//     width: 100%;
//     max-width: 600px;
//     display: flex;
//     flex-direction: column;
//     align-items: start;
//     padding: 20px 0px;
// `;

// const Form = styled.form`
//     display: flex;
//     flex-direction: column;
//     gap: 5px;
//     margin-bottom: 10px;
//     width: 100%;
//     border: 1px dotted black;
//     border-radius: 5px;
//     padding: 10px 20px;

//     h2 {
//       margin-top: 5px;
//       margin-bottom: 10px;
//     }
// `;

// const InputBox = styled.section`
//   display: flex;
//   flex-direction: column;
//   border: 1px dotted #bbb;
//   border-radius: 5px;
//   padding: 5px 10px;
// `;

// const Input = styled.input`
//     padding: 8px;
//     margin: 5px 0;
//     border: 1px solid #ccc;
//     border-radius: 4px;
// `;

// const Button = styled.button`
//     padding: 10px;
//     margin-top: 10px;
//     background-color: #4caf50;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;

//     &:hover {
//         background-color: #45a049;
//     }
// `;

// const Label = styled.label`
//     margin-top: 10px;
// `;

// const Textarea = styled.textarea`
//     padding: 8px;
//     margin: 5px 0;
//     border: 1px solid #ccc;
//     border-radius: 4px;
//     width: 100%;
//     height: 60px; // You can adjust the height as needed
//     resize: vertical; // Allows the user to adjust the height
// `;

// const SegmentedSections = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 5px;
//     margin-bottom: 10px;
//     width: 100%;
//     border: 1px dotted black;
//     border-radius: 5px;
//     padding: 10px 20px;

//     h2 {
//         margin-top: 5px;
//         margin-bottom: 10px;
//     }
// `;

// const SectionContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     border: 2px dashed #626161;
//     padding: 10px;
//     border-radius: 4px;
//     margin-top: 10px;
//     width: 100%;
//     gap: 5px;

//     input {
//       width:85%;
//     }

//     div {

//     }
// `;

// const ListContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     margin-bottom: 12px;
// `;

// const ListItem = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-top: 5px;
//     padding-left: 5px;
//     width: 85%;
// `;

// const ListButton = styled.button`
//     margin-left: 10px;
//     padding: 2px;
//     background-color: #f53434;
//     border-radius: 4px;
//     border: none;

//     &:hover {
//         background-color: #c12a2a;
//     }
// `;

// const PlusButton = styled(Button)`
//     background-color: #555;
//     padding: 5px 10px;
//     margin-left: 6px;
//     &:hover {
//         background-color: #666;
//     }
// `;

// const DocumentPreview = styled.div`

// `

// // Component for managing recipients and authorizers
// const ListEditor = ({ items, setItems, label }) => {
//     const [input, setInput] = useState('');

//     const handleAdd = () => {
//         if (input.trim() !== '') {
//             setItems([...items, input]);
//             setInput('');
//         }
//     };

//     const handleRemove = (index) => {
//         setItems(items.filter((_, i) => i !== index));
//     };

//     return (
//         <div>
//             <Label>{label}</Label>
//             <div>
//                 <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
//                 <PlusButton onClick={handleAdd}>+</PlusButton>
//             </div>
//             <ListContainer>
//                 {items.map((item, index) => (
//                     <ListItem key={index}>
//                         - {item}
//                         <ListButton onClick={() => handleRemove(index)} className="buttonPop">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth={1.5}
//                                 stroke="white"
//                                 className="w-6 h-6"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
//                                 />
//                             </svg>
//                         </ListButton>
//                     </ListItem>
//                 ))}
//             </ListContainer>
//         </div>
//     );
// };

// const HeaderForm = ({ header, onChange }) => (
//     <Form>
//         <h2>Header Section</h2>
//         <InputBox>
//             <Label>Title:</Label>
//             <Input type="text" name="title" value={header.title} onChange={onChange} />
//         </InputBox>
//         <InputBox>
//             <Label>Introduction:</Label>
//             <Textarea name="intro" value={header.intro} onChange={onChange} />
//         </InputBox>
//     </Form>
// );

// const SectionForm = ({ section, onChange, onRemove, updateList }) => (
//     <SectionContainer>
//         <InputBox>
//             <Label>Content:</Label>
//             <Textarea name="content" value={section.content} onChange={onChange} />
//         </InputBox>
//         <InputBox>
//             <ListEditor items={section.signators} setItems={(items) => updateList('signators', items)} label="Signators" />
//         </InputBox>
//         <InputBox>
//             <ListEditor items={section.authorizers} setItems={(items) => updateList('authorizers', items)} label="Authorizers" />
//         </InputBox>
//         <Button onClick={onRemove}>Remove Section</Button>
//     </SectionContainer>
// );

// const FooterForm = ({ footer, onChange }) => (
//     <Form>
//         <Label>Additional Details:</Label>
//         <Input type="text" name="additionalDetails" value={footer.additionalDetails} onChange={onChange} />
//     </Form>
// );

// const ConstructedDocumentComponent = () => {
//     const [header, setHeader] = useState({ title: '', intro: '' });
//     const [sections, setSections] = useState([]);
//     const [footer, setFooter] = useState({ additionalDetails: '' });
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const [constructedDocument, setConstructedDocument] = useState(null);

//     const handleHeaderChange = (e) => {
//         const { name, value } = e.target;
//         setHeader((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSectionChange = (index, e) => {
//         const { name, value } = e.target;
//         const updatedSections = [...sections];
//         updatedSections[index] = { ...updatedSections[index], [name]: value };
//         setSections(updatedSections);
//     };

//     const updateList = (listName, items, index) => {
//         const updatedSections = [...sections];
//         updatedSections[index][listName] = items;
//         setSections(updatedSections);
//     };

//     const handleFooterChange = (e) => {
//         const { name, value } = e.target;
//         setFooter((prev) => ({ ...prev, [name]: value }));
//     };

//     const addSection = () => {
//         setSections((prev) => [...prev, { content: '', signators: [], authorizers: [] }]);
//     };

//     const removeSection = (index) => {
//         setSections((prev) => prev.filter((_, i) => i !== index));
//     };

//   const DocumentDisplay = ({ document, onEdit, onSubmit }) => (
//       <DocumentPreview>
//           <h2>{document.header.title}</h2>
//           <h4>Introduction: {document.header.intro}</h4>
//           {document.sections.map((section, index) => (
//               <SectionContainer key={index}>
//                   <p>{section.content}</p>
//                   <div>
//                       <strong>Signators:</strong> {section.signators.join(', ')}
//                   </div>
//                   <div>
//                       <strong>Authorizers:</strong> {section.authorizers.join(', ')}
//                   </div>
//               </SectionContainer>
//           ))}
//           <h3>Additional Details:</h3>
//           <p>{document.footer.additionalDetails}</p>
//           <Button onClick={onEdit}>Edit Document</Button><br />
//           <Button onClick={onSubmit}>Submit Document</Button>
//       </DocumentPreview>
//   );

//      const handleSubmit = (e) => {
//          e.preventDefault();
//          const document = {
//              documentId: `doc_${Date.now()}`,
//              header,
//              sections,
//              footer,
//          };
//          setConstructedDocument(document);
//          setIsSubmitted(true);
//          console.log('Document to be sent:', document);
//      };

//    const handleEdit = () => {
//        setIsSubmitted(false);
//    };

//    const handleFinalSubmit = () => {
//        console.log('Final Submit:', constructedDocument);
//        alert('Document has been submitted!');
//        // Reset form (optional)
//        setHeader({ title: '', intro: '' });
//        setSections([]);
//        setFooter({ additionalDetails: '' });
//        setIsSubmitted(false);
//    };

//     return (
//         <Container>
//             {!isSubmitted ? (
//                 <>
//                     <HeaderForm header={header} onChange={handleHeaderChange} />
//             <SegmentedSections>
//               <h2>Segmented Sections</h2>
//                         {sections.map((section, index) => (
//                             <SectionForm
//                                 key={index}
//                                 section={section}
//                                 onChange={(e) => handleSectionChange(index, e)}
//                                 updateList={(listName, items) => updateList(listName, items, index)}
//                                 onRemove={() => removeSection(index)}
//                             />
//                         ))}
//                         <Button onClick={addSection}>Add Section</Button>
//                     </SegmentedSections>

//                     <FooterForm footer={footer} onChange={handleFooterChange} />
//                     <Button onClick={handleSubmit}>Preview Document</Button>
//                 </>
//             ) : (
//                 <DocumentDisplay document={constructedDocument} onEdit={handleEdit} onSubmit={handleFinalSubmit} />
//             )}
//         </Container>
//     );

// };

// export default ConstructedDocumentComponent;







// import { useState } from 'react';
// import styled from 'styled-components';
// // import PrepareContainer from '../InteractivePdfInterface/subComponents/PrepareContainer';
// import DocumentPreparation from '../DocumentsPage/future-implementation/DocumentPreperation';
// import { useDropzone } from 'react-dropzone';

// // Styled Components
// const Container = styled.div`
//     width: 100%;
//     height: 80vh;
//     /* max-width: 600px; */
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     padding: 0px 0px;

//     .dropzone {
//         display: flex;
//         flex-direction: column;
//         gap: 15px;
//         margin-bottom: 20px;
//         margin-top: 30px;
//         border: 2px dashed rgb(102, 148, 233);
//         height: 140px;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         cursor: pointer;
//         text-align: center;
//         width: 95%;
//         max-width: 400px;
//         border-radius: 20px;
//         padding-inline: 40px;
//         font-size: 13px;
//         background-color: rgb(227, 234, 245);

//         svg {
//             height: 50px;
//             width: 50px;
//             color: rgb(102, 148, 233);
//         }
//     }
// `;

// const ConstructedDocumentComponent = () => {
//     const [file, setFile] = useState(null);

//     const handleFileDrop = (acceptedFiles) => {
//         if (acceptedFiles.length > 0) {
//             setFile(acceptedFiles[0]);
//         } else {
//             console.error('No files accepted');
//         }
//     };

//     function PDFDropZone({ onDrop }) {
//         const { getRootProps, getInputProps, isDragActive } = useDropzone({
//             onDrop,
//             accept: { 'application/pdf': ['.pdf'] },
//         });

//         return (
//             <div {...getRootProps({ className: 'dropzone' })}>
//                 <input {...getInputProps()} />
//                 {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
//             </div>
//         );
//     }

//     return (
//         <Container>
//             {file ? <DocumentPreparation document={file} /> : <PDFDropZone onDrop={handleFileDrop} />}
//             {/* <PrepareContainer /> */}
//       </Container>
//     );
// };

// export default ConstructedDocumentComponent;

// import { useEffect, useRef } from 'react';

// const ConstructedDocumentComponent = () => {
//     const canvasRef = useRef(null);

//     useEffect(() => {
//         const resizeCanvas = () => {
//             const canvas = canvasRef.current;
//             if (canvas) {
//                 canvas.width = window.innerWidth - window.innerWidth * 0.1;
//                 canvas.height = window.innerHeight - window.innerHeight * 0.2;
//                 canvas.style.backgroundColor = 'black';
//             }
//         };

//         // Call the resizeCanvas function when the window is resized
//         window.addEventListener('resize', resizeCanvas);
//         // Call resizeCanvas once initially to set canvas size based on window dimensions
//         resizeCanvas();
//         // Clean up the event listener when the component is unmounted
//         return () => {
//             window.removeEventListener('resize', resizeCanvas);
//         };
//     }, []); // Empty dependency array ensures this effect runs only once after initial render

//     const drawSignature = () => {
//         // Code for drawing signature on canvas
//     };

//     return <canvas id="canvas" ref={canvasRef}></canvas>;
// };

// export default ConstructedDocumentComponent;
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DocumentRenderer from './components/DocumentRenderer';
import SignatureComponent from './components/SignatureComponent';

const ContainerComponent = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <SignatureComponent />
                <DocumentRenderer />
            </div>
        </DndProvider>
    );
};

export default ContainerComponent;


