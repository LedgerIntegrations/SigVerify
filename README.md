# XRP SigVerify: Blockchain Signature Validation Platform 📜🔒

Your premier platform for secure and transparent document signing and signature validation powered by the [XRP Ledger](https://xrpl.org). In an era defined by digital transactions, the integrity and authenticity of important documents are of utmost importance. While traditional methods falter in transparency and are prone to tampering, XRP SigVerify rises above by leveraging the robust features of blockchain technology.

## Embracing the XRPL's Strengths 💪

- **Decentralized Security**: Eliminating single points of failure.
- **Immutable Records**: Assuring the permanence and untampered state of signed documents.
- **Transparency**: Ensuring verifiable authenticity without intermediaries.
- **Fast and Economical Transactions**: Swift validations without exorbitant costs.
- **Global Reach**: Access and verify from anywhere in the world.
- **Cryptographic Excellence**: Ensuring top-tier security for all transactions.
- **Scalability**: Capable of handling high volumes seamlessly.
- **Future-Ready**: Poised to integrate smart contract capabilities as they evolve on the XRPL.

Building on the tried-and-tested foundation of the XRPL, we're not only enhancing trust in the document signing process but also streamlining development, aligning with our mission to provide the best in the domain.

## Preview Unfinished Mock Demo

![Landing Page](./sigVerify-frontend/src/assets/mobile-createAccount.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-genKeypairs.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-dashboard.png)

![Landing Page](./sigVerify-frontend/src/assets/mobile-unauthenticatedProfile.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-authenticateWallet.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-profile.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-documents.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-documentDetails.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-decryptedDocument.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-signDocument.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-documentUpload.png)
![Landing Page](./sigVerify-frontend/src/assets/mobile-navigation.png)


<br />
<hr>

## Technologies 🛠

- **Node**: JavaScript runtime.
- **Express.js**: Node.js framework for managing servers and routes.
- **PostgreSQL**: Relational database.
- **Vite**: Front-end build tool.
- **React**: Front-end framework.
- **Styled-Components**: Modular component styling for react.
- **Xrpl**: XRPL JavaScript library.
- **Xumm-Sdk**: Allow developers to deliver xrpl and other (sign-in) payloads to Xaman app users.
- **Pinata**: IPFS pinning services.

<br />
<hr>

## Current Functionalities 🌟

### Xaman Functionality
- Management of xrpl keypairs
- Wallet Authentication / Querying.
- Composing xrpl transaction payloads to be submitted to ledger.
- Easy to use QR code system built-in for signing payloads.

### XRPL Functionality
- Transaction and document hash storage on ledger.
- Specified Transaction Queries.
- Signature Verification.
- Storing of document hashes in tx memo field.
- Immutable timestamped signature authentication.

### Base Functionality
- Document upload ( currently .pdf or .txt for mvp ).
- Document preview.
- Document Hashing (Sha-512).
- End-to-end document encryption.
- RSA-OAEP and AES-GCM encryption algorithms for encryption and decryption of documents.
- XRPL wallet authentication and linkage to account.
- Mapping of authenticated emails to authenticated xrpl r-addresses.
- Sharing of encrypted or unencrypted documents with other users.
- Designate required signatures on documents (single or multi).
- Centralized database to track and relate all decentralized aspects smoothly and efficiently.
(document IPFS CIDs attached to appropriate xrpl 'signature' transaction payloads before signing)
- UI to view all created documents you have been mentioned in as (signer/viewer).
- Status of all documents you are mentioned in signed / partial signed / completed.
- links to all ipfs documents and signature hashes in document viewer UI.

<br />
<hr>

## Future Functionalities 🔮
- Xaman push notifications for payloads after initial sign-in.
- User-friendly navigation.
- identity verification.
- Intuitive dashboard.
- multi - sig for documents. ✅
- document editor.
- drag-and-drop document upload. ✅
- document sharing in-app. ✅
- detailed user profiles.
- signature history.
- upload / signature of all document types and more.
- customizable signature fields and visual signature templates.

<br />
<hr>

## Steps To Run Project

1. Clone the project from GitHub.
2. Navigate to the `sigVerify-frontend` directory in the terminal and run 'npm i' to install all front-end dependencies.
3. Navigate to the `sigVerify-backend` directory in the terminal and run 'npm i' to install all back-end dependencies.
4. Copy the `.env.dist` file in the root of the `sigVerify-backend` directory to create a new file named `.env`. Add your API key and secret for Xaman API in the `.env` file. <br />
   ```bash
   Xaman_API_KEY="api key here"
   Xaman_API_SECRET="api secret here"
   POSTGRES_HOST="sigverify-database"
   POSTGRES_USER="postgres"
   POSTGRES_PASSWORD="postgres"
   POSTGRES_DB="sigverifydb"

   MAIL_HOST="sigverify-mailcatcher"
   MAIL_PORT=1025
   MAIL_USERNAME=""
   MAIL_PASSWORD=""
   MAIL_FROM_ADDRESS="noreply@ledgerintegrations.com"
   MAIL_FROM_NAME="Ledger Integrations"
   ```
5. Execute 'docker-compose up -d' in the `sigVerify-backend` terminal.
6. Open a second terminal, navigate to `sigVerify-frontend`, and execute 'npm run dev' in the terminal. Then, navigate to the outputted localhost URL.
7. For current development and testing, switch Xaman's advanced setting to use XRPL test node: `wss://testnet.xrpl-labs.com`. The XRPL backend web socket is already pre-configured to the XRPL testnet: `wss://s.altnet.rippletest.net:51233` for you.


