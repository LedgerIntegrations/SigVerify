import { useMemo } from 'react';
import styled from 'styled-components';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

const DocumentViewerContainer = styled.div`
    max-height: 500px;
    overflow: auto;
    margin-bottom: 14px;

    .react-pdf__Document {
        /* overflow: auto; */
    }

    #proxy-renderer {
      max-height: 420px;
    }
    /* #react-doc-viewer {
      min-height: 400px;

      #pdf-renderer {
        height: 100%;
      }
    }
    #pdf-page-wrapper {

        div {
            canvas {

            }

            div {
                span {
                    left: 0px !important;
                    transform: none !important;
                    white-space: normal !important;
                }
            }
        }
    }
    .react-pdf__Document {
        width: 100%;
    }
    .react-pdf__Page__canvas {
        width: 100% !important;
        display: none !important;
    }

    .react-pdf__Page__textContent {
        width: 100% !important;
        height: 100%;
        span {
            left: 0px !important;
            font-size: 0.9em !important;
            position: relative !important;
        }
    }

    .react-pdf__Page__annotations {
        width: 100% !important;
    } */
`;

// eslint-disable-next-line react/prop-types
const DocumentViewer = ({ currentDocument }) => {
    console.log(currentDocument);

    const memoizedUrl = useMemo(() => {
        // eslint-disable-next-line react/prop-types
        if (currentDocument) {
            // eslint-disable-next-line react/prop-types
            return window.URL.createObjectURL(currentDocument);
        }
    }, [currentDocument]);

    const docs = useMemo(() => {
        // eslint-disable-next-line react/prop-types
        if (memoizedUrl && currentDocument?.name) {
            // eslint-disable-next-line react/prop-types
            return [{ uri: memoizedUrl, fileName: currentDocument.name }];
        }
        return [];
    }, [memoizedUrl, currentDocument]);

    console.log(memoizedUrl);
    return (
        <DocumentViewerContainer>
            {docs.length > 0 && <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />}
        </DocumentViewerContainer>
    );
};

export default DocumentViewer;
