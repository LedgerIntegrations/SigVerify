import { useState } from 'react';
import styled from 'styled-components';
import { addDocumentAccess } from '../../../../../utils/httpRequests/routes/documents';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    background-color: white;
    gap: 20px;
    width: 100%;
    max-width: 400px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    position: absolute;
    top: 27vh;
    left: 30vw;
    z-index: 40;
`;

const Input = styled.input`
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    padding-top: 5px;
    border: none;
    border-radius: 3px;
    background-color: #b44c4c;
    color: white;
    width: fit-content;
`;

// eslint-disable-next-line react/prop-types
function AddDocumentAccess({ documentId, onAccessAdded }) {
    const [email, setEmail] = useState('');
    const [walletAddress, setWalletAddress] = useState('');

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        console.log('Submitting access for document ID:', documentId);

        if (!email && !walletAddress) {
            console.error('Please provide either an email or a wallet address.');
            return;
        }

        try {
            // Call the utility function and pass the documentId, email, and walletAddress
            await addDocumentAccess(documentId, email, walletAddress);
            console.log('Access successfully added or updated');

            // Reset form fields
            setEmail('');
            setWalletAddress('');

            // Invoke the callback to inform the parent component
            if (onAccessAdded) {
                onAccessAdded();
            }
        } catch (error) {
            console.error('Error creating new document access: ', error);
        }
    };

    return (
        <Form onSubmit={handleFormSubmit}>
            <CloseButton onClick={onAccessAdded} className="buttonPop">
                X
            </CloseButton>
            <h2>Add Document Access</h2>
            <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Wallet Address (optional)" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            <Button type="submit">Add Access</Button>
        </Form>
    );
}

export default AddDocumentAccess;
