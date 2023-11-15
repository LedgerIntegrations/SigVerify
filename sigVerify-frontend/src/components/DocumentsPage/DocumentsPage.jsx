import React, { useContext, useState, useEffect } from 'react';
import styles from './DocumentsPage.module.css';
import Tile from '../Tile/Tile';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import { AccountContext } from '../../App';

function DocumentsPage() {
  const [accountObject, setAccountObject] = useContext(AccountContext);
  // const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);



  const base64ToBlob = (base64, contentType) => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: contentType });
  };

  const handleFiles = async (arrayOfDocuments) => {
    const fileObjects = await arrayOfDocuments.map(doc => {
      const blob = base64ToBlob(doc.base64Data, doc.contentType);
      const file = new File([blob], doc.fileName);
      const url = window.URL.createObjectURL(file);
      return file;
    });
    console.log(fileObjects)
    return fileObjects;
  };



  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/document/getAllDocuments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: accountObject.email }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        // const fileObjects = await handleFiles(data.documents);

        setDocuments(data.documents); // Update state
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []); // Dependency array empty if you only want to run this once after the component mounts


  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInnerDiv}>
        <h1>My Documents</h1>
        <p>This section contains all your documents.</p>
        <div className={styles.tiles}>
          <Tile title="View All" icon="📂" link="/my-documents" finePrint='' />
          <Tile title="Legal" icon="⚖️" link="/my-documents" finePrint='' />
          <Tile title="Contractual" icon="📝" link="/my-documents" finePrint='' />
          <Tile title="Conditional" icon="💡" link="/my-documents" finePrint='' />
          {/* Add more tiles as needed */}
        </div>

        {/* Document List Section */}
        <div className={styles.documentsContainer}>
          <h2>Documents</h2>
          <ul className={styles.documentList}>
            {documents.map((document, index) => (
              <li key={index}><a href={document} target="_blank">{document}</a></li> // Adjust according to your document object structure
            ))}
          </ul>
          {/* <>
         <DocViewer
        documents={files.map((file) => ({
          uri: window.URL.createObjectURL(file),
          fileName: file.name,
        }))}
        pluginRenderers={DocViewerRenderers}
      />
         </>        */}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
