import './VerifySignature.css';
import React, { useState } from 'react';
import DocumentPreview from '../DocumentPreview/DocumentPreview'; //no longer exists, need to update w/ new document viewer

// needs updating - currently taken out of application temporarily

function VerifySignature() {
  const [file, setFile] = useState(null);
  const [userPromptMessage, setUserPromptMessage] = useState("Waiting for upload of document");
  const [targetRAddress, setTargetRAddress] = useState('');
  const [returnedMatchingTxsArray, setReturnedMatchingTxsArray] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchMessage, setSearchMessage] = useState(null);

  const handleSubmit = async () => {
    if (!file || !targetRAddress) return;

    setErrorMessage(null);
    setSearchMessage(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('targetRAddress', targetRAddress);

    try {
      const response = await fetch('http://localhost:3001/api/document/verify', { method: 'POST', body: formData });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);
      setReturnedMatchingTxsArray(result);

      if (Array.isArray(result) && result.length > 0) {
        setFile(null);
        setSearchMessage("The target user HAS signed this document!");
      } else {
        setSearchMessage("The target user HAS NOT signed this document!");
        setFile(null);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div id="verify-sig-container">
      <div id="verify-sig-head">
        <h3>Verify Signature</h3>
        <p>Enter users account address and document in which you would like to verify.</p>
      </div>
      <p id="userPromptMessage">
                    {userPromptMessage}
                    <em className="loading-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </em>
                </p>
      <div id="verify-sig-main">
        <section id='upload-document-section'>
          <h4>Upload Document</h4>
          <div>
            <label id="fileLabel">
              Choose File
              <input type="file" id="fileInput" onChange={(e) => {
                setFile(e.target.files[0]);
                setUserPromptMessage("Document uploaded. Review it below before proceeding.");
                e.target.value = null;
              }} />
            </label>
            <span id="upload-fileName">{file ? file.name : 'No file chosen'}</span>
          </div>

        </section>

        <div id="target-address-input">
          <input id="addressInput" type="text" placeholder="Enter Target Account" onChange={(e) => setTargetRAddress(e.target.value)} />
          {
            file && targetRAddress && <button onClick={handleSubmit} className='buttonPop verifyButton'>Verify</button>
          }
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {searchMessage && <p className="search-message">{searchMessage}</p>}

        {returnedMatchingTxsArray !== null && (
          <div id="verified-sigs-found">
            {returnedMatchingTxsArray?.map(tx => (
              <div key={tx.TransactionHash} className="verified-sig">
                <p>Signer: <em>{tx.Signer}</em></p>
                <p>Document Hash: <em>{tx.DocumentHash}</em></p>
                <p>Date: <em>{tx.date}</em></p>
                <a href={`https://testnet.xrpl.org/transactions/${tx.TransactionHash}`} target='_blank'>Lookup Transaction</a>
              </div>
            ))}
          </div>
        )}

        <div id="upload-doc-container">
          <DocumentPreview file={file} />
        </div>
      </div>
    </div>
  );
}

export default VerifySignature;
