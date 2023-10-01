import './UploadDocument.css'
import React, { useState } from 'react';

function UploadDocument() {
    const [file, setFile] = useState(null);
    const [signedFileResponse, setSignedFileResponse] = useState(null)

    const handleSubmit = async () => {
        if (!file) return;

        console.log(file)

        const formData = new FormData();
        formData.append('document', file);

        console.log(formData)

        const response = await fetch('http://localhost:3001/api/sign', { method: 'POST', body: formData });
        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            return;
        }
        const result = await response.json();
        console.log(result)
        setSignedFileResponse(result)
    };

    return (
        <div id="upload-document-container">
            <h2>Welcome to <em>SigVerify</em></h2>
            <p>Upload document you desire to sign.</p>
            <section>
                <label id="fileLabel">
                    Choose File
                    <input type="file" id="fileInput" onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <span id="fileName">{file ? file.name : 'No file chosen'}</span>
                <button onClick={handleSubmit}>Upload</button>
            </section>
            {signedFileResponse ? (
                <div id="display-div">
                    <div id='document-div'>
                        <h3>Document:</h3>
                        <p>{signedFileResponse?.document}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(signedFileResponse.document)}>Copy Document Hash to Clipboard</button>

                    <div id='signature-div'>
                        <h3>Signature:</h3>
                        <p>{signedFileResponse?.signature}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(signedFileResponse.signature)}>Copy Signature to Clipboard</button>
                </div>
            ) : null}
        </div>
    );
}

export default UploadDocument;
