import './UploadSingleFileAndSendToCreateSignatureQrEndpoint.css'
import React, { useContext, useState, useRef } from 'react';
import { AccountContext } from '../../../App';
import DocumentPreview from '../DocumentPreview/DocumentPreview'; //does not exist needs to be reworked

// needs updating - currently taken out of application temporarily

function UploadSingleFileAndSendToCreateSignatureQrEndpoint() {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const abortController = useRef(new AbortController()); // for aborting the fetch request

    const [userPromptMessage, setUserPromptMessage] = useState("Waiting for upload of document");
    const [file, setFile] = useState(null);
    const [txPayloadForPaymentToSelfWithDocHashInMemo, settxPayloadForPaymentToSelfWithDocHashInMemo] = useState(null);

    const resetPayload = () => {
        settxPayloadForPaymentToSelfWithDocHashInMemo(null);
        abortController.current.abort(); // Abort the previous fetch request if it's ongoing
        abortController.current = new AbortController(); // Reset the abort controller for future use
    };

    const handleSubmit = async () => {
        if (!file) return;

        console.log(file);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('rAddress', accountObject.wallet);

        console.log(formData);

        try {
            const response = await fetch('http://localhost:3001/api/document/sign', { method: 'POST', body: formData });
            if (!response.ok) {
                console.error(`Error ${response.status}: ${response.statusText}`);
                return;
            }
            const result = await response.json();
            console.log(result)
            settxPayloadForPaymentToSelfWithDocHashInMemo(result)

            const subscriptionToPaymentTx = await fetch('http://localhost:3001/api/user/subscribeToPayload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payloadUuid: result.uuid }),
                signal: abortController.current.signal // Pass the signal to the fetch request
            });

            const subscriptionToPaymentTxResponseJson = await subscriptionToPaymentTx.json();
            if (subscriptionToPaymentTxResponseJson.loggedIn) {
                setUserPromptMessage("Document has been signed, and submitted to the blockchain forever!");
                settxPayloadForPaymentToSelfWithDocHashInMemo(null);
                setFile(null);
            }

            if (!subscriptionToPaymentTxResponseJson.loggedIn) {
                setUserPromptMessage("Payload was declined!");
                settxPayloadForPaymentToSelfWithDocHashInMemo(null);
                setFile(null);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log("Fetch request has been aborted");
            } else {
                console.log(err);
            }
        };
    };

    return (
        <div id="upload-document-container">
            <div id="sign-doc-head">
                <h3>Sign Document</h3>
                <ol>
                    <li>Upload document you desire to sign.</li>
                    <li>Review document.</li>
                    <li>Click 'Verify'</li>
                    <li>Sign generated QR via XUMM app.</li>
                </ol>
            </div>
            <section id='upload-document-section'>
                <h4>Upload Document</h4>
                <div>
                    <label id="fileLabel">
                        Choose File
                        <input type="file" id="fileInput" onChange={(e) => {
                            resetPayload(); // Reset the payload when a new file is selected
                            setFile(e.target.files[0]);
                            setUserPromptMessage("Document uploaded. Review it below before proceeding.");
                            e.target.value = null;
                        }} />
                    </label>
                    <span id="upload-fileName">{file ? file.name : 'No file chosen'}</span>
                </div>
               
            </section>

            {txPayloadForPaymentToSelfWithDocHashInMemo ? (
                <div id="payloadDataDiv">
                    {/* <p>Document Hash: <em>{txPayloadForPaymentToSelfWithDocHashInMemo.documentHash}</em></p> */}
                    <a href={txPayloadForPaymentToSelfWithDocHashInMemo.qrLink} target='_blank' rel="noreferrer">
                        <img src={txPayloadForPaymentToSelfWithDocHashInMemo.qrImage} alt="QR Code" />
                    </a>
                    <p id="sign-msg">Waiting for payload to be signed via XUMM...</p>
                </div>
            ) :
                <p id="userPromptMessage">
                    {userPromptMessage}
                    <em className="loading-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </em>
                </p>}
                {
                    file && <button onClick={handleSubmit} className='buttonPop verifyButton'>Verify</button>
                }
            <div id="upload-document-container-preview">
                <DocumentPreview file={file} id="doc-preview" />
            </div>
        </div>
    );
}

export default UploadSingleFileAndSendToCreateSignatureQrEndpoint;
