import React from 'react';
import styled from 'styled-components';
import DocViewer, {
  DocViewerRenderers,
} from '@cyntler/react-doc-viewer';

const DocumentViewerContainer = styled.div`
  max-height: 100%;
`;

const DocumentViewer = ({ currentDocument }) => {
  console.log(currentDocument);
  const documentUrl =
    currentDocument && currentDocument.File
      ? window.URL.createObjectURL(currentDocument.File)
      : '';

  const docs = [
    {
      uri: documentUrl,
      fileName: currentDocument?.name,
    },
  ];

  console.log(documentUrl);
  return (
    <>
      {currentDocument && (
        <DocumentViewerContainer>
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
          />
        </DocumentViewerContainer>
      )}
    </>
  );
};

export default DocumentViewer;
