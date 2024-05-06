import { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px 50px;
    border-radius: 10px;
    max-width: 400px;
    width: 90%;
    height: 180px;
    display: flex;
    flex-direction: column;

    h2 {
        font-size: 16px;
        margin-bottom: 40px;
    }

    button {
        margin-inline: auto;
        width: 100%;
        border-radius: 10px;
        border: 1px solid gray;
        background-color: #ffffff;
        color: black;
        padding: 5px;
    }
`;

const KeyDisplay = styled.div`
    background-color: #f0f0f0; // Light grey background
    border: 1px solid #ccc; // Light grey border
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    max-height: 150px; // Fixed height
    overflow-y: auto; // Enable vertical scrolling
    word-wrap: break-word; // Break long words
`;

const KeyPairGeneratorModal = ({ onClose, onKeyPairGenerated }) => {
    const [keys, setKeys] = useState({ publicKey: null, privateKey: null });

    const exportCryptoKey = async (key, isPrivateKey = false) => {
        const format = isPrivateKey ? 'pkcs8' : 'spki'; // Use "pkcs8" for private keys and "spki" for public keys
        const exported = await window.crypto.subtle.exportKey(format, key);
        const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
        const exportedAsBase64 = window.btoa(exportedAsString);
        return exportedAsBase64;
    };

    const generateKeyPair = async () => {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256',
                },
                true,
                ['encrypt', 'decrypt']
            );

            const publicKeyBase64 = await exportCryptoKey(keyPair.publicKey);
            const privateKeyBase64 = await exportCryptoKey(keyPair.privateKey, true); // Set isPrivateKey to true for private key

            setKeys({
                publicKey: publicKeyBase64,
                privateKey: privateKeyBase64,
            });

            onKeyPairGenerated(publicKeyBase64);
        } catch (error) {
            console.error('Error generating keys:', error);
        }
    };

    useEffect(() => {
        generateKeyPair();
    }, []);

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <h2>key pair generation for future P2P encryption feature, ignore for demo.</h2>
                {/* <h2>Your Key Pair</h2>
                <div>
                    <strong>Public Key:</strong>
                    <KeyDisplay>{keys.publicKey ? keys.publicKey : 'Generating...'}</KeyDisplay>
                </div>
                <div>
                    <strong>Private Key:</strong>
                    <KeyDisplay>{keys.privateKey ? keys.privateKey : 'Generating...'}</KeyDisplay>
                </div> */}
                <button className="buttonPop" onClick={onClose}>
                    Close
                </button>
            </ModalContent>
        </ModalBackdrop>
    );
};

export default KeyPairGeneratorModal;
