import React, { useContext, useState, useEffect } from 'react';
import styles from './DocumentsPage.module.css';
import Tile from '../Tile/Tile';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import { AccountContext } from '../../App';

function DocumentsPage() {
  const [accountObject, setAccountObject] = useContext(AccountContext);
  const [documents, setDocuments] = useState([]);
  const [documentCategoryInfo, setDocumentCategoryInfo] = useState({ name: "All" });


  async function convertUrlToFile(url, filename) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type === "application/octet-stream" ? "text/plain" : blob.type });
  }

  async function fetchAndConvertFiles(urls) {
    const filePromises = urls.map(url => {
      return convertUrlToFile(url.signedUrl, url.documentName);
    });

    return Promise.all(filePromises);
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
        const urlsToJsFileObjects = await fetchAndConvertFiles(data);
        console.log("urls as file objects: ", urlsToJsFileObjects)
        setDocuments(urlsToJsFileObjects);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []); // Dependency array empty if you only want to run this once after the component mounts


  return (
    <div className={styles.dashboard}>
      <h1 className={styles.mainTitle}>Documents</h1>
      <p id={styles.pageDescription}>View all documents, filter by category.</p>

      <div className={styles.dashboardInnerDiv}>

        <div className={styles.tiles}>
          <Tile title="All" icon="" link="/my-documents" finePrint='' />
          <Tile title="Sent" icon="" link="/my-documents" finePrint='' />
          <Tile title="Received" icon="" link="/my-documents" finePrint='' />
          <Tile title="Signed" icon="" link="/my-documents" finePrint='' />
          <Tile title="Unsigned" icon="" link="/my-documents" finePrint='' />
          {/* Add more tiles as needed */}
        </div>

        {/* Document List Section */}
        <div className={styles.documentsContainer}>
          <h2>{documentCategoryInfo.name} Documents ...</h2>
          {documents.length > 0 &&
            (
              <>
                {/* need to fix warning when clicking #doc-nav-next */}
                {/* styled-components: it looks like an unknown prop "last" is being sent through to the DOM */}
                <DocViewer
                  documents={documents.map((file) => ({
                    uri: window.URL.createObjectURL(file),
                    fileName: file.name,
                  }))}
                  pluginRenderers={DocViewerRenderers}
                  last="true"
                />
              </>
            )
          }
          {/* <ul className={styles.documentList}>
            {documents.map((document, index) => (
              <li key={index}><a href={document} target="_blank">{document}</a></li> // Adjust according to your document object structure
            ))}
          </ul> */}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
