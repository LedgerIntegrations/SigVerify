import React from 'react';
import PdfPreview from '../PdfPreview/PdfPreview';
import TxtPreview from '../txtPreview/TxtPreview';

function DocumentPreview({ file }) {
    if (!file) return null;
    console.log("file before split: ", file);
    const fileType = file.type.split('/')[1];
    console.log("filetype after split: ", fileType);

    switch(fileType) {
        case 'pdf':
            return <PdfPreview file={file} />;
            //potential image upload options
        // case 'jpeg':
        // case 'jpg':
        // case 'png':
        // case 'gif':
        case 'plain': // Text files usually have a MIME type of text/plain
            return <TxtPreview file={file} />;
        // Additional case conditions for other document types...
        default:
            return <p>Cannot preview this file type</p>;
    }
}

export default DocumentPreview;