import styled from 'styled-components';

const FormContainer = styled.form`
    background-color: white;
    padding: 40px 40px;
    margin: 10px;
    header {
        h1 {
            font-size: 22px;
            padding-bottom: 10px;
        }

        em {
            font-size: 12px;
        }
    }

    em {
        margin-bottom: 10px;

        p {
            margin-inline: 0px;
        }
    }

    p {
        margin: 14px;
    }

    strong {
        color: #b97911;
        word-wrap: break-word;
    }
`;

const SignatureDetails = styled.div`
    border: 1px solid black;
`;

function ConsentToTreatFormViewer({ form }) {
    return (
        <FormContainer>
            <header>
                <h1>Consent To Treat</h1>
                <em>
                    Recipient: <strong>{form?.formData?.recipient}</strong>
                </em>
            </header>
            <hr style={{ marginBottom: '40px' }} />
            <p>
                I, <strong>{form?.formData?.patientName}</strong>, give permission for{' '}
                <strong>{form?.formData?.practiceName}</strong> to give me medical treatment.
            </p>
            <p>
                I allow <strong>{form?.formData?.practiceName}</strong> to file for insurance benefits to pay for the
                care I receive.
            </p>
            <div>
                <p>I understand that:</p>
                <ul>
                    <li>
                        <strong>{form?.formData?.practiceName}</strong> will have to send my medical record information
                        to my insurance company.
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
            <SignatureDetails>
                <p>
                    Date: <strong>{form?.formData?.date}</strong>
                </p>
                {form?.formData?.parentSignature ? (
                    <p>
                        Parent or Guardian Signature (for children under 18):
                        <br />
                        <br />
                        <em>
                            <span>
                                Print Name: <br /> <strong>{form?.formData?.patientName}</strong>
                            </span>
                            <br />
                            <span>
                                Parent Name: <br /> <strong>{form?.formData?.parentName}</strong>
                            </span>
                            <br />
                            <br />
                            <span>
                                Parent Signature: <strong>{form?.xrplSignatureHash}</strong>
                            </span>
                        </em>
                    </p>
                ) : (
                    <p>
                        <em>
                            <span>
                                Print Name: <br /> <strong>{form?.formData?.patientName}</strong>
                            </span>
                            <br />
                            <br />
                            Patient Signature: <strong style={{ fontSize: '14px' }}>{form?.xrplSignatureHash}</strong>
                        </em>
                    </p>
                )}
            </SignatureDetails>

            <br />
        </FormContainer>
    );
}

export default ConsentToTreatFormViewer;
