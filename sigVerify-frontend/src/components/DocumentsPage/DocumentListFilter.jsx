import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import DocumentViewer from './DocumentViewer';

const DocumentListFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
  padding: 10px 5px;
`;

const Dropdown = styled.select`
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  border-radius: 10px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
`;

const DocumentList = styled.ul`
  /* Add styles for document list */
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-height: fit-content;

  padding: 0px;
`;

const DocumentItem = styled.li`
  /* Add styles for each document item */
  list-style: none;
  width: 120px;
  height: 165px;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  font-size: 10px;

  li {
    strong {
      color: #643c0b;
    }
  }

  button {
    width: 50%;
    text-align: center;
    padding: 3px 5px;
    border-radius: 5px;
    border: 1px solid #333;
    background-color: rgba(171, 170, 170, 0.15);
    margin-top: 5px;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5),
      2px 2px 7px 0px rgba(0, 0, 0, 0.1),
      2px 2px 7px 0px rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: white;
      box-shadow: inset 1px 1px 2px 1px rgba(59, 59, 59, 0.5),
        2px 2px 10px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1);
    }
  }
`;

const DocItemName = styled.li`
  text-decoration: underline;
  font-size: 1.05em;
  test-wrap: wrap;
  margin-bottom: 5px;
`;

const DocumentListFilter = ({
  options,
  documents,
}) => {
  const [selectedFilter, setSelectedFilter] = useState(options[0]);
  const [filteredDocuments, setFilteredDocuments] =
    useState(documents);

  console.log('props: ', { documents, options });
  console.log('selectedFilter', selectedFilter);
  console.log('filteredDocuments', filteredDocuments);

  const [currentDocument, setCurrentDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDocumentClick = (doc) => {
    setCurrentDocument(doc);
    setIsModalOpen(true); // Open the modal when a document is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDocument(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Format the date and time in a readable format
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Combine date and time
    const readableDateTime = `${formattedDate} at ${formattedTime}`;

    return readableDateTime;
  };

  // const handleDocumentClick = (doc) => {
  //   setCurrentDocument(doc);
  // };

  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setSelectedFilter(filter);
    setCurrentDocument(null);
    let filteredDocs;
    switch (filter) {
      case 'all documents':
        filteredDocs = documents;
        break;
      case 'signed documents':
        // Assuming each document has a 'signed' property
        filteredDocs = documents.filter((doc) => doc.signed);
        break;
      case 'unsigned documents':
        filteredDocs = documents.filter((doc) => !doc.signed);
        break;
      // Add more cases as needed
      default:
        filteredDocs = documents;
    }

    setFilteredDocuments(filteredDocs);
  };

  return (
    <DocumentListFilterContainer>
      <Dropdown onChange={handleFilterChange} value={selectedFilter}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Dropdown>

      <DocumentList>
        {filteredDocuments?.map((doc, index) => (
          <DocumentItem key={index}>
            <DocItemName>
              <strong>{doc.name}</strong>
            </DocItemName>
            <li>
              signed: <strong>{doc.signed ? 'true' : 'false'}</strong>
            </li>
            <li>
              hash:{' '}
              <strong>
                {doc.xrplTxHash ? doc.xrplTxHash : 'false'}
              </strong>
            </li>
            {/* <li>blockchain nft: <strong>false</strong></li> */}
            <li>
              expires:{' '}
              <strong>{doc.expires ? doc.expires : 'false'}</strong>
            </li>
            <li>
              uploaded:{' '}
              <strong>
                {doc.uploaded ? formatDate(doc.uploaded) : 'null'}
              </strong>
            </li>

            <button>Sign</button>
            <br />
            <button onClick={() => handleDocumentClick(doc)}>
              View
            </button>
          </DocumentItem>
        ))}
      </DocumentList>
      <Modal show={isModalOpen} onClose={closeModal}>
        <DocumentViewer currentDocument={currentDocument} />
      </Modal>
    </DocumentListFilterContainer>
  );
};

export default DocumentListFilter;
