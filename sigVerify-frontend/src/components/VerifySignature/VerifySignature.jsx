import './VerifySignature.css'
import React, { useState } from 'react';

function VerifySignature() {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [isValid, setIsValid] = useState(null);

  const handleSubmit = async () => {
    if (!file || !signature) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('signature', signature);

    const response = await fetch('http://localhost:3001/api/verify', { method: 'POST', body: formData });
    const result = await response.json();

    setIsValid(result.isValid);
  };

  return (
    <div id="verify-sig-container">
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input type="text" placeholder="Enter Signature" onChange={(e) => setSignature(e.target.value)} />
        <button onClick={handleSubmit}>Verify</button>
        {isValid !== null && <p>Signature is {isValid ? 'Valid' : 'Invalid'}!</p>}
      </div>
    </div>
  );
}

export default VerifySignature;
