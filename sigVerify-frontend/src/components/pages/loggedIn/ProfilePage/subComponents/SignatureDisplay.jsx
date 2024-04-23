import { useState } from 'react';
import styled from 'styled-components';
import { FaFileSignature } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { MdExpandLess } from 'react-icons/md'; // Importing icons
import { CiEdit } from 'react-icons/ci';
import { RiUserReceivedLine } from 'react-icons/ri';
import { BsSend } from 'react-icons/bs';

const SignatureDisplay = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    text-align: start;
    width: 100%;
    padding: 0px 0px;
    margin-bottom: 10px;
    z-index: 10;
`;

const SignaturesList = styled.ul`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding-left: 0px;
    margin-block: 0px;
    list-style: none;
    border: none;
    border-radius: 10px 10px 10px 10px;
    overflow-y: auto;
`;

const Signature = styled.li`
    background-color: ${(props) => (props.isActive ? '#e4f0fee6' : '#ffffff')};
    border: ${(props) => (props.isActive ? '1px solid #6fa2fa' : '0.5px solid #c1c1c1')};
    display: flex;
    width: 100%;
    padding: 0px;
    flex-direction: column;
    align-items: start;
    justify-content: space-between;
    margin: 3px;
    border-radius: 10px;
    font-size: 80%;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 2px 2px 2px 0px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 10px 10px 25px 0px rgba(0, 0, 0, 0.15),
            2px 2px 2px 0px rgba(0, 0, 0, 0.1);
    }
`;

const SignatureContents = styled.div`
    display: flex;
    flex-direction: column;
    padding: 13px;
    padding-bottom: 0px;
    width: 100%;

    .signature-card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: 0px 4px;
        margin-bottom: 1px;

        #uploadDate {
            margin-inline: 5px;
        }

        h4 {
            margin-left: 0px;
            margin-top: 7px;
            margin-bottom: 7px;
            color: #e6710c;
            font-weight: 800;
            font-size: 14px;

            @media (min-width: 446px) {
                font-size: 16px;
            }
        }

        div {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3px;

            span {
                color: #4f4f4f89;
            }
        }
    }

    .main-content {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0px 10px;
        width: 100%;
        margin-inline: auto;
        margin-top: 10px;
        margin-bottom: 12px;
        font-size: 1.1em;
        font-family: 'Saira', sans-serif;

        @media (min-width: 446px) {
            font-size: 0.9em;
            padding-left: 24px;
        }

        span {
            font-weight: 400;
            color: #34a41e;

            em {
                color: #111;
                word-break: break-all;
            }
        }

        ul {
            padding-left: 20px;

            li {
                max-width: 180px;
                word-break: break-all;
            }
        }

        .metadata-content {
            p {
                margin-block: 0px;
                padding-left: 12px;
                color: #222;
                font-weight: 800;

                em {
                    color: #888;
                    font-size: 0.9em;
                }
            }
        }

        .recipient-content {
            color: #888;

            ::marker {
                color: #222;
            }
        }
    }
`;

const SignatureIconContainer = styled.div`
    background-color: #4bc95e;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 26px;
    width: 26px;
    border-radius: 50%;
    margin-left: 6px;
    color: white;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);

    svg {
        stroke-width: 1.1;
        border: none;
        transform: scale(1.1);
        position: relative;
        left: 2px;
    }
`;

const ContentToggle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: 0px;

    svg {
        position: relative;
        bottom: 1px;
        margin-left: 5px;
        color: #06adfa;
    }
`;

const RotatableIcon = styled(MdExpandLess)`
    height: 24px;
    width: 24px;
    background-color: transparent;
    color: #ce8a0c !important;
    border-radius: 50%;
    transform: ${({ isopen }) => (isopen ? 'rotate(-180deg)' : 'rotate(0deg)')};
    transition: transform 0.2s;
    box-shadow: inset 1px 1px 2px 0px rgba(255, 255, 255, 0.5), 1px 1px 2px 0px rgba(0, 0, 0, 0.1), 1px 1px 2.5px 0px rgba(0, 0, 0, 0.1);
`;

const SignatureActionButtons = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    padding: 10px 20px;
    padding-top: 5px;
    padding-bottom: 13px;
    width: 100%;
    font-size: 9px;
    margin-top: 3px;

    @media (min-width: 446px) {
        margin-top: 0px;
        justify-content: end;
        font-size: 11px;
    }

    button {
        min-width: 83px;
        padding: 5px 10px;
        padding-top: 6px;
        margin-right: 0px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        background-color: #e6710c;
        color: white;

        &:hover {
            background-color: #ef9343;
        }
    }
`;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    return `${day}.${month}.${year}`;
};

// eslint-disable-next-line react/prop-types
function SignaturesDisplay({ arrayOfSignatures = [], displayCategory }) {
    console.log('array of given Signatures: ', arrayOfSignatures);
    const [contentDropdownOpen, setContentDropdownOpen] = useState({});

    return (
        <SignatureDisplay>
            <SignaturesList>
                {arrayOfSignatures.map((signature) => (
                    <Signature key={signature.id}>
                        <SignatureContents>
                            <div className="signature-card-title">
                                <div>
                                    <h4>Signature</h4>
                                    <ContentToggle
                                        onClick={() =>
                                            setContentDropdownOpen((prevState) => ({
                                                ...prevState,
                                                [signature.id]: !prevState[signature.id],
                                            }))
                                        }
                                    >
                                        <RotatableIcon isopen={contentDropdownOpen[signature.id]} />{' '}
                                    </ContentToggle>
                                </div>
                                <div>
                                    <span id="uploadDate">{formatDate(signature.created_at)}</span>
                                    <SignatureIconContainer>
                                        {displayCategory === 'upload' && <CiEdit />}
                                        {displayCategory === 'recieve' && <RiUserReceivedLine />}
                                        {displayCategory === 'sent' && (
                                            <BsSend style={{ position: 'relative', top: '1px', right: '1px' }} />
                                        )}
                                        {displayCategory == null && <FaFileSignature />}
                                    </SignatureIconContainer>
                                    {/* <CiStar /> */}
                                </div>
                            </div>
                            {contentDropdownOpen[signature.id] && (
                                <div className="main-content">
                                    <span>
                                        Signed By: <br />
                                        <em>{signature.signer_wallet_address}</em>
                                    </span>{' '}
                                    <span>
                                        Transaction Hash: <br />
                                        <em>{signature.xrpl_tx_hash}</em>
                                    </span>{' '}
                                    <span>
                                        Document Checksum:
                                        <br /> <em>{signature.document_checksum}</em>
                                    </span>{' '}
                                </div>
                            )}
                        </SignatureContents>
                        <SignatureActionButtons>
                            <Link
                                to={`https://testnet.xrpl.org/transactions/${signature.xrpl_tx_hash}/detailed`}
                                style={{ textDecoration: 'none', color: 'white' }}
                            >
                                <button className="buttonPop">Raw Signature</button>
                            </Link>
                            <Link to={`/document/${signature.document_id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                <button className="buttonPop">Document</button>{' '}
                            </Link>{' '}
                        </SignatureActionButtons>
                    </Signature>
                ))}
            </SignaturesList>
        </SignatureDisplay>
    );
}

export default SignaturesDisplay;
