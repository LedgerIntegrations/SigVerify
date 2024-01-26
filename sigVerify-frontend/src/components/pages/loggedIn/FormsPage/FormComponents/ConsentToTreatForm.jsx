import { useContext, useState } from 'react';
import styled from 'styled-components';
import { webCryptoApiHybridEncrypt } from '../../../../../utils/rsaKeyHandlers/helpers';
import { AccountContext } from '../../../../../App';
import CreateSignatureAndResolve from '../../../../XrplDependentComponents/CreateSignatureAndResolve';

const FormContainer = styled.form`
    background-color: white;
    padding: 40px 30px;
    margin: 10px;
    header {
        h1 {
            font-size: 22px;
            padding-bottom: 10px;
        }

        em {
            font-size: 0.8em;
        }
    }

    label {
        display: flex;
        flex-direction: column;
        max-width: fit-content;
    }
`;

function ConsentToTreatForm() {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [payloadSigningComponentOpened, setPayloadSigningComponentOpened] = useState(false);
    const [encryptedJsonFormData, setEncryptedJsonFormData] = useState('');
    const [signatureStatus, setSignatureStatus] = useState({ signed: false });

    const [formData, setFormData] = useState({
        patientName: '',
        practiceName: '',
        parentSignature: false,
        parentName: '',
        date: '',
        recipient: '',
    });

  function hashJsonData(base64PublicKey, jsonTextData) {
      console.log('jsonTextData: ', jsonTextData);
        //returns promise, also handles text encoding in function
        const data = webCryptoApiHybridEncrypt(base64PublicKey, jsonTextData);
        return data;
    }

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    //  useEffect(() => {
    //      if (documentSignatureStatus.signed && documentSignatureStatus.resolveData.dispatchedResult === 'tesSUCCESS') {
    //          console.log(documentSignatureStatus);
    //          const updatedEncryptedJsonFormData = {
    //              ...encryptedJsonFormData,
    //              status: 'signed',
    //              xrplSignatureHash: documentSignatureStatus.resolveData.txHash,
    //              xrplSigner: documentSignatureStatus.resolveData.signer,
    //          };

    //          setEncryptedJsonFormData(updatedEncryptedJsonFormData);

    //          console.log('final encryptedJsonFormData to send to server: ', updatedEncryptedJsonFormData);

    //          // TODO: send request to server
    //      } else {
    //          console.log('document not signed yet: ', documentSignatureStatus);
    //      }
    //  }, [documentSignatureStatus, encryptedJsonFormData]);

    // encryption process:
    // 1. convert raw data into json text
    // 2. encode json text into Uint8Array
    // 3. use WebCrypto API encryption method to perform RSA-OAEP encryption -> (reciever publicKey<base64>, data<Uint8Array>)
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Creating a new object with empty strings replaced by null
        const modifiedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
            acc[key] = value === '' ? null : value;
            return acc;
        }, {});

        // Convert modifiedFormData to a JSON string and then to an ArrayBuffer
        const encoder = new TextEncoder();
        const jsonFormData = JSON.stringify(modifiedFormData);
        const encodedJsonFormData = encoder.encode(jsonFormData);

        // Encrypt the encodedJsonFormData
        const hashedJsonFormData = await hashJsonData(accountObject.publicKey, encodedJsonFormData);
        console.log('hashedJsonFormData: ', hashedJsonFormData);


        const payload = {
            type: 'consentToTreat',
            status: 'pending',
            // formDataHash: '',
            xrplSignatureHash: '',
            formData: hashedJsonFormData,
        };

        setEncryptedJsonFormData(payload);
        payloadSigningComponentOpened(true);

        // Handle the form submission logic here
        console.log('raw payload', payload);

        const jsonPayload = JSON.stringify(payload);
        console.log('json payload: ', jsonPayload);
    };

    if (signatureStatus.signed && signatureStatus.resolveData.dispatchedResult === 'tesSUCCESS') {
        console.log(signatureStatus);
        const finalEncryptedJsonFormData = {
            ...encryptedJsonFormData,
            status: 'complete',
            xrplSignatureHash: signatureStatus.resolveData.txHash,
            xrplSigner: signatureStatus.resolveData.signer,
        };

        console.log('final encryptedJsonFormData to send to server: ', finalEncryptedJsonFormData);

        //send request to server
    } else {
        console.log('document not signed yet: ', signatureStatus);
    }

    return (
        <FormContainer onSubmit={handleSubmit}>
            <header>
                <h1>Consent To Treat</h1>
            </header>
            <hr style={{ marginBottom: '40px' }} />

            <label>
                Patient Name:
                <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} />
            </label>
            <br />

            <label>
                Practice Name:
                <input type="text" name="practiceName" value={formData.practiceName} onChange={handleInputChange} />
            </label>
            <br />

            <label>
                Recipient Email:
                <input type="text" name="recipient" value={formData.recipient} onChange={handleInputChange} />
            </label>
            <br />

            <p>
                I, {formData.patientName || '[patient name]'}, give permission for{' '}
                {formData.practiceName || '[practice name]'} to give me medical treatment.
            </p>

            <p>
                I allow {formData.practiceName || '[practice name]'} to file for insurance benefits to pay for the care
                I receive.
            </p>

            <div>
                <p>I understand that:</p>
                <ul>
                    <li>
                        {formData.practiceName || '[practice name]'} will have to send my medical record information to
                        my insurance company.
                    </li>
                    <li>I must pay my share of the costs.</li>
                    <li>
                        I must pay for the cost of these services if my insurance does not pay or I do not have
                        insurance.
                    </li>
                </ul>
            </div>

            <div>
                <p>I understand:</p>
                <ul>
                    <li>I have the right to refuse any procedure or treatment.</li>
                    <li>I have the right to discuss all medical treatments with my clinician.</li>
                </ul>
            </div>

            <br />
            {payloadSigningComponentOpened && (
                <CreateSignatureAndResolve
                    setPayloadSigningComponentOpened={setPayloadSigningComponentOpened}
                    memoData={encryptedJsonFormData.formData}
                    setSignatureStatus={setSignatureStatus}
                />
            )}
            <label style={{ marginBottom: '10px' }}>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </label>
            {/* <br /> */}

            <label>
                Parent or Guardian Signature (for children under 18):
                <div>
                    <input
                        type="checkbox"
                        name="parentSignature"
                        checked={formData.parentSignature}
                        onChange={handleInputChange}
                    />
                    <span> I am the parent or guardian signing on behalf of the child.</span>
                </div>
            </label>
            <br />

            {/* Conditional rendering of the parentName input field */}
            {formData.parentSignature && (
                <label>
                    Parent or Guardian Name:
                    <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="Parent/Guardian Name"
                    />
                </label>
            )}

            <br />

            <button type="submit">Sign & Submit</button>

            {signatureStatus.signed ? (
                <p style={{ color: 'green' }}>Successfully signed document!</p>
            ) : (
                <p style={{ color: 'blue' }}>Waiting for document signature...</p>
            )}
        </FormContainer>
    );
}

export default ConsentToTreatForm;
