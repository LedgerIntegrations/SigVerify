import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import styled from 'styled-components';

const DisplayDocument = styled.div`
    transform: scale(1);
    width: 100%;
    max-width: 600px;
    max-height: 500px;
    /* overflow-y: auto; */

    #pdf-renderer {
        /* overflow-y: auto !important; */
        /* height: 500px !important; */
    }

    #pdf-controls {
        z-index: 30;
    }

    // too wide going off page
    .react-pdf__Document {
        overflow-y: auto !important;
        max-height: 500px;
        max-width: 600px !important;
        /* min-width: 380px !important;
        max-width: 600px !important; */
        /* height: 600px !important; */
    }

    // too wide going off page
    #pdf-page-wrapper {
        /* width: 100% !important; */

        .react-pdf__Page {
            min-width: 480px !important;
            min-height: 600px !important;
            /* max-width: 95% !important; */

            /* overflow-y: auto; */
            > div {
                max-width: 100% !important;
                /* min-height: 500px !important; */
            }

            canvas {
                max-width: 100% !important;
                min-width: 480px !important;
                min-height: 600px !important;
                /* min-height: 590px !important;
                min-width: 380px !important; */
            }
        }
    }
    /* .textLayer {
        span {
            font-size: calc(var(--scale-factor) * 644px) !important;
        }
    } */
`;
// const DocumentViewer = ({ presignedUrl }) => {
//     const [docs, setDocs] = useState([]);

//     useEffect(() => {
//         if (presignedUrl) {
//             setDocs([{ uri: presignedUrl }]);
//         }
//     }, [presignedUrl]);

//     return (
//         <DisplayDocument>
//             {docs.length > 0 && (
//                 <DocViewer
//                     style={{ width: '100%', height: '500' }}
//                     prefetchMethod="GET"
//                     pluginRenderers={DocViewerRenderers}
//                     documents={docs}
//                     config={{
//                         header: {
//                             disableHeader: true,
//                             disableFileName: true,
//                             retainURLParams: true,
//                         },
//                         pdfVerticalScrollByDefault: true,
//                         pdfZoom: {
//                             defaultZoom: 1.1, // 1 as default,
//                             zoomJump: 0.2, // 0.1 as default,
//                         },
//                     }}
//                 />
//             )}
//         </DisplayDocument>
//     );
// };

const DocumentViewer = ({ documentBlob }) => {
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        if (documentBlob) {
            setDocs([{ uri: window.URL.createObjectURL(documentBlob), fileName: documentBlob.name }]);
        }
    }, [documentBlob]);
    console.log(docs);

    return (
        <DisplayDocument>
            {docs.length > 0 && (
                <DocViewer
                    style={{ width: '500', height: '600' }}
                    documents={docs}
                    prefetchMethod="GET"
                    pluginRenderers={DocViewerRenderers}
                    config={{
                        // header: {
                        //     disableHeader: true,
                        //     disableFileName: false,
                        //     retainURLParams: true,
                        // },
                        pdfVerticalScrollByDefault: true,
                        pdfZoom: {
                            defaultZoom: 1.2, // 1 as default,
                            zoomJump: 0.2, // 0.1 as default,
                        },
                    }}
                />
            )}
        </DisplayDocument>
    );
};

export default DocumentViewer;
