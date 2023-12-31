import { useMemo } from 'react';
import styled from 'styled-components';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

const DocumentViewerContainer = styled.div`

`;

// eslint-disable-next-line react/prop-types
const DocumentViewer = ({ currentDocument, theme }) => {
    console.log(currentDocument);

    const memoizedUrl = useMemo(() => {
        // eslint-disable-next-line react/prop-types
        if (currentDocument && currentDocument.File) {
            // eslint-disable-next-line react/prop-types
            return window.URL.createObjectURL(currentDocument.File);
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
        {docs.length > 0 && <DocViewer documents={docs} theme={theme}  pluginRenderers={DocViewerRenderers} />}
        </DocumentViewerContainer>
    );
};

export default DocumentViewer;
