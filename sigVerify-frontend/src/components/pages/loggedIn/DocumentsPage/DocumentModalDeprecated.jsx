import styled from 'styled-components';

// Styled components for the modal
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

const ModalContainer = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 80%;
    max-width: 500px;
    z-index: 1001;
`;

const CloseButton = styled.button`
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    float: right;
`;

const DocumentDetails = styled.div`
    margin-top: 20px;
`;

// eslint-disable-next-line react/prop-types
const DocumentModal = ({ document, onClose }) => {
    if (!document) return null;

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                {' '}
                {/* Prevent click inside the modal from closing it */}
                <CloseButton onClick={onClose}>X</CloseButton>
                <h2>{document.title}</h2>
                <DocumentDetails>
                    <p>
                        <strong>Description:</strong> {document.description}
                    </p>
                    <p>
                        <strong>Category:</strong> {document.category}
                    </p>
                    <p>
                        <strong>Type:</strong> {document.document_type}
                    </p>
                    <p>
                        <strong>Size:</strong> {document.document_size} bytes
                    </p>
                    <p>
                        <strong>Status:</strong> {document.is_signed ? 'Signed' : 'Pending'}
                    </p>
                </DocumentDetails>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default DocumentModal;
