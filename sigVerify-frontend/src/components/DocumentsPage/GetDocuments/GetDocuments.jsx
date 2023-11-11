import React, { useState, useEffect } from 'react';

// needs updating - currently taken out of application temporarily

function DocumentsComponent(userWallet) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Fetch documents from your Express.js API
    fetch('/api/document/getAllUserDocuments', { method: 'POST', body: userWallet })
      .then((response) => response.json())
      .then((data) => setDocuments(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h2>Documents</h2>
      <ul>
        {documents.map((document) => (
          <li key={document._id}>
            <a
              href={`/path-to-download/${document.filename}`} // Update with download route
              target="_blank"
              rel="noopener noreferrer"
            >
              {document.filename}
            </a>
            {document.contentType === 'application/pdf' && (
              <iframe
                title={document.filename}
                src={`/path-to-view-pdf/${document.filename}`} // Update with PDF view route
              ></iframe>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DocumentsComponent;
