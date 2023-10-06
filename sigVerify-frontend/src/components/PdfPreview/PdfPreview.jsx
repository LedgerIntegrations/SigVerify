import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PdfPreview.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

function PdfPreview({ file }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [width, setWidth] = useState(window.innerWidth);
    const [previewSource, setPreviewSource] = useState(null);

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
        };
    }, [file]);

    useEffect(() => {
        const resizeListener = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', resizeListener);
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    let pdfWidth = width;
    let pdfScale = 1;
    
    if (width <= 420) {
        pdfWidth = width;
        pdfScale = 1;
    } else if (width > 420) {
        pdfWidth = Math.min(width * 0.8, 800);  // Use Math.min to cap the width at 500px
        pdfScale = 0.8;
    }
    

    return (
        <div>
            {previewSource && (
                <Document
                    file={previewSource}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page pageNumber={pageNumber} width={pdfWidth} scale={pdfScale} />
                </Document>
            )}
            {numPages && (
                <p>
                    Page {pageNumber} of {numPages}
                </p>
            )}
        </div>
    );
}

export default PdfPreview;

