import React, { useState } from 'react';
import styled from 'styled-components';
import axiosInstance from '../httpRequests/axiosInstance';
import { buffToPem, pemToBuff } from './helpers';

// currently taken out of application

const KeyReadOnlyTextArea = styled.textarea`
    width: 100%;
    height: 100px;
    font-size: 12px;
`;

// create rsa keypair, displaying private key for user to take down and storing public key to user account
const RSAKeyPairGenerator = ({ onKeyPairGenerated }) => {
    const [keyPair, setKeyPair] = useState({ publicKey: '', privateKey: '', publicKeyPem: '', privateKeyPem: '' });

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

            const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            const publicKeyPem = buffToPem(publicKey, 'PUBLIC');
            const privateKeyPem = buffToPem(privateKey, 'PRIVATE');

            setKeyPair({ publicKey, privateKey, publicKeyPem, privateKeyPem });

            const addPublicKey = await axiosInstance.post('http://localhost:3000/publicKey', {
                userId: 1,
                publicKey: publicKeyPem,
            });
            // const convertedResponse = await addPublicKey.json();
            console.log('addPublicKey axios response: ', addPublicKey);

            if (onKeyPairGenerated) {
                onKeyPairGenerated({ publicKey, privateKey });
            }
        } catch (err) {
            console.error('Error generating RSA key pair:', err);
        }
    };

    return (
        <div>
            <button onClick={generateKeyPair}>Generate RSA Key Pair</button>
            {/* {keyPair.publicKey && <KeyReadOnlyTextArea value={keyPair.publicKeyPem} readOnly />} */}
            {keyPair.privateKey && <KeyReadOnlyTextArea value={keyPair.privateKeyPem} readOnly />}
        </div>
    );
};

export default RSAKeyPairGenerator;
