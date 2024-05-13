import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfViewerContainer = styled.div`
    position: relative;
    width: 95%;
    max-width: 650px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    scroll-snap-type: y mandatory;

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

const DocumentPage = styled.div`
    scroll-snap-align: start;
    margin-bottom: 10px; /* Adjust the margin as per your preference */
`;

const PDFViewer = ({ file }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(null);

    const onThumbnailClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        const pageElement = document.getElementById(`page-${pageNumber}`);
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <PdfViewerContainer>
            <div>
                {file && (
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={index} onClick={() => onThumbnailClick(index + 1)}>
                                <Page pageNumber={index + 1} width={70} renderTextLayer={false} renderAnnotationLayer={false} />
                            </div>
                        ))}
                    </Document>
                )}
            </div>

            {file ? (
                <Document file={file}>
                    {Array.from(new Array(numPages), (el, index) => (
                        <DocumentPage key={index} id={`page-${index + 1}`}>
                            <Page pageNumber={index + 1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
                        </DocumentPage>
                    ))}
                </Document>
            ) : (
                <div>
                    <p>No file selected</p>
                </div>
            )}
        </PdfViewerContainer>
    );
};

export default PDFViewer;
