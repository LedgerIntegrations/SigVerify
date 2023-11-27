import React from 'react';
import styled from 'styled-components';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const DocumentViewerContainer = styled.div`
    width: 100%;
`;
const DocumentViewer = ({ currentDocument }) => {
    console.log(currentDocument);
    const documentUrl = currentDocument && currentDocument.File 
    ? window.URL.createObjectURL(currentDocument.File) : '';

    const docs = [
        { 
            uri: documentUrl,
            fileName: currentDocument?.name
        }
      ];


    console.log(documentUrl)
    return (
        <DocumentViewerContainer>
            {/* alternative document viewing option */}
            {/* {currentDocument.length > 0 &&

                <iframe
                    src={documentUrl}
                    style={{ width: '100%', minHeight: '360px' }} // Adjust styling as needed
                />
            } */}

            {currentDocument &&
                  (<DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />)
            }
        </DocumentViewerContainer>
    );
};

export default DocumentViewer;