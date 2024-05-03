import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import TextFileViewer from '../../loggedIn/DocumentsPage/subComponents/TextFileViewer';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = styled.div`
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin-top: 26px;

    @media (min-width: 620px) {
        margin-top: 0px;
        grid-column: 9/24;
    }

    canvas {
        max-width: 100% !important;
        max-height: 100% !important;
        height: auto !important;
    }

    .react-pdf__Document {
        max-height: 60vh;
    }

    .react-pdf__Page_canvas {
    }

    .react-pdf__Page__textContent {
        display: none !important;
    }

    .react-pdf__Page__annotations {
        display: none !important;
    }
`;

function DocumentEmbed({ documentUrl, mimeType, filename }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePrevious = () => {
        setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
    };

    const handleNext = () => {
        setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
    };

    if (mimeType === 'application/pdf') {
        return (
            <PdfViewer>
                <div>
                    {pageNumber > 1 && <button onClick={handlePrevious}>Previous</button>}
                    {pageNumber < numPages && <button onClick={handleNext}>Next</button>}
                </div>
                <Document file={documentUrl} onLoadSuccess={onLoadSuccess} loading={<div>Loading PDF...</div>}>
                    <Page pageNumber={pageNumber} />
                </Document>
            </PdfViewer>
        );
    } else if (mimeType.startsWith('text/')) {
        return <TextFileViewer presignedUrl={documentUrl} filename={filename} />;
    }

    return (
        <iframe src={documentUrl} style={{ width: '100%', height: 'auto', minHeight: '60vh' }} frameBorder="0">
            Your browser does not support iframes.
        </iframe>
    );
}

export default DocumentEmbed;
