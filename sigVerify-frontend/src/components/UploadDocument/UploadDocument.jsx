import './UploadDocument.css'
import React, { useContext, useState } from 'react';
import { AccountContext } from '../../App';

function UploadDocument() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const [userPromptMessage, setUserPromptMessage] = useState("Waiting for upload of document...");
    const [file, setFile] = useState(null);
    const [txPayloadForPaymentToSelfWithDocHashInMemo, settxPayloadForPaymentToSelfWithDocHashInMemo] = useState(null);

    const handleSubmit = async () => {
        if (!file) return;

        console.log(file);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('rAddress', accountObject.wallet);

        console.log(formData);

        try {
            const response = await fetch('http://localhost:3001/api/sign', { method: 'POST', body: formData });
            if (!response.ok) {
                console.error(`Error ${response.status}: ${response.statusText}`);
                return;
            }
            const result = await response.json();
            console.log(result)
            settxPayloadForPaymentToSelfWithDocHashInMemo(result)

            const subscriptionToPaymentTx = await fetch('http://localhost:3001/api/subscribeToPayload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payloadUuid: result.uuid }),
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
            console.log(err);
        };
    };

    return (
        <div id="upload-document-container">
            <p>Upload document you desire to sign.</p>
            <section>
                <div>
                    <label id="fileLabel">
                        Choose File
                        <input type="file" id="fileInput" onChange={(e) => {
                            setFile(e.target.files[0]);
                            e.target.value = null;
                        }} />
                    </label>
                    <span id="fileName">{file ? file.name : 'No file chosen'}</span>
                </div>
                <button onClick={handleSubmit}>Upload</button>
            </section>
            {txPayloadForPaymentToSelfWithDocHashInMemo ? (
                <div id="payloadDataDiv">
                    <p>Document Hash: <em>{txPayloadForPaymentToSelfWithDocHashInMemo.documentHash}</em></p>
                    <a href={txPayloadForPaymentToSelfWithDocHashInMemo.qrLink} target='_blank'>
                        <img src={txPayloadForPaymentToSelfWithDocHashInMemo.qrImage} />
                    </a>
                    <p>Waiting for payload to be signed via XUMM...</p>
                </div>
            ) : <p id="userPromptMessage"> {userPromptMessage}</p>}
        </div>
    );
}

export default UploadDocument;
