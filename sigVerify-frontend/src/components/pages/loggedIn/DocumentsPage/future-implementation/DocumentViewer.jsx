import { useMemo } from 'react';
import styled from 'styled-components';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

const DocumentViewerContainer = styled.div`
    height: 100%;
    overflow: auto;

    /* .react-pdf__Document {
        width: 100%;
        height: 100%;
    }
    .react-pdf__Page__textContent {
        width: 100% !important;
        height: 100% !important;

        span {
            width: 100% !important;
            left: 0 !important;
            top: 0 !important;
        }
    }
    .react-pdf__Page__canvas {
        width: 100% !important;
        height: 100% !important;
    }
    .react-pdf__Page__annotations {
        width: 100% !important;
        important
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
