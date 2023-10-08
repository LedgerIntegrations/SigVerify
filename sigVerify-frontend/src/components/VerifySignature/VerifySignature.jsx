import './VerifySignature.css';
import React, { useState } from 'react';
import DocumentPreview from '../DocumentPreview/DocumentPreview';

function VerifySignature() {
  const [file, setFile] = useState(null);
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
      const response = await fetch('http://localhost:3001/api/verify', { method: 'POST', body: formData });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);
      setReturnedMatchingTxsArray(result);

      if (Array.isArray(result) && result.length > 0) {
        setSearchMessage("Search of this document signature in target account was found!");
      } else {
        setSearchMessage("Search of this document signature in target account not found!");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div id="verify-sig-container">
      <div id="verify-sig-head">
        <h3>Verify Signature</h3>
        <p>Enter document and account address of person you want to check has signed the document.</p>
      </div>
      
      <div id="verify-sig-main">
        <div id='verify-input-label-div'>
          <label id="fileLabel">
            Choose File
            <input type="file" id="fileInput" onChange={(e) => {
              setFile(e.target.files[0]);
              e.target.value = null;
            }} />
          </label>
          <span id="fileName">{file ? file.name : 'No file chosen'}</span>
        </div>

        <div id="target-address-input">
          <input type="text" placeholder="Enter Target Account" onChange={(e) => setTargetRAddress(e.target.value)} />
          <button onClick={handleSubmit}>Verify</button>
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
