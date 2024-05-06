import styled from 'styled-components';

const DocumentSignaturesInterface = styled.div`
  text-align: start;
  padding-left: 0px;
  font-size: .9em;

  h5 {
    font-size: 1.2em;
  }
`
const SignatureList = styled.ul`
  padding-left: 0px;
`
const SignatureItem = styled.li`
    padding: 10px;
    margin: 10px 0;
    background: #ffffff;
    border-left: 3px solid #4caf50;
    font-size: 0.85em;
    list-style: none;
    text-align: start;

    strong {
      span {
        color: #94115d;
        font-size: .9em;
        word-break: break-all;
      }
    }
`;

const SignaturesList = ({ signatures }) => {

  if (signatures?.length === 0) return <div style={{marginBlock: '20px'}}>No signatures found.</div>;

    return (
        <DocumentSignaturesInterface>
            {/* <h5>Document Signatures:</h5> */}
            <SignatureList>
                {signatures.map((signature) => (
                    <SignatureItem key={signature.id}>
                        <strong>
                            XRP Ledger Hash: <br />
                            <span>{signature.xrpl_tx_hash}</span>
                        </strong>
                        <br />
                        <strong>
                            Signer: <br /> <span>{signature.signer_wallet_address}</span>
                        </strong>
                        <br />
                        <strong>
                            Timestamp: <br />
                            <span>{new Date(signature.created_at).toLocaleString()}</span>
                        </strong>
                    </SignatureItem>
                ))}
            </SignatureList>
        </DocumentSignaturesInterface>
    );
};

export default SignaturesList;
