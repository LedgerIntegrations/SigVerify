
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
    const [scale, setScale] = useState(1);
    const [pdfWidth, setPdfWidth] = useState(390); // Set initial value
    
    const padding = 20; // Desired padding on each side
    
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
            setDynamicScaleAndWidth(window.innerWidth);
        };
        window.addEventListener('resize', resizeListener);
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    const setDynamicScaleAndWidth = (width) => {
        const availableWidth = width - 2 * padding; // Width minus padding on both sides
        const minWidth = 390; // Adjust as per requirement
        
        if (availableWidth < minWidth) {
            setScale(availableWidth / minWidth);
            setPdfWidth(minWidth);
        } else {
            setScale(1);
            setPdfWidth(Math.min(minWidth, availableWidth));
        }
    };

    useEffect(() => {
        setDynamicScaleAndWidth(window.innerWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <div style={{minHeight: '70vh', padding: `10px`}}>
            {previewSource && (
                <Document
                    file={previewSource}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page pageNumber={pageNumber} width={pdfWidth} scale={scale}/>
                </Document>
            )}
            {numPages && (
                <p style={{marginBottom: "6vh"}}>
                    Page {pageNumber} of {numPages}
                </p>
            )}
        </div>
    );
}

export default PdfPreview;
