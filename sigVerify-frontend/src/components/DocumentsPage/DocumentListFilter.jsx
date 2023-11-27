import React, { useState } from 'react';
import styled from 'styled-components';

const DocumentListFilterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
    max-width: 300px;
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
  /* Add styles for your document list */
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: fit-content;
  max-height: 160px;
  overflow-y: auto;
  padding: 0px;
  
`;

const DocumentItem = styled.li`
  /* Add styles for each document item */
  list-style: none;
  
  button {
    width: 100%;
    text-align: start;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #333;
    background-color: rgba(171, 170, 170, 0.15);
    font-size: 12px;

    &:hover {
        background-color: white;
    }
  }
`;

const DocumentListFilter = ({ options, documents, setCurrentDocument }) => {
  const [selectedFilter, setSelectedFilter] = useState(options[0]);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);

  console.log("props: ", {documents, options})
  console.log("selectedFilter", selectedFilter);
  console.log("filteredDocuments", filteredDocuments);

  const handleDocumentClick = (doc) => {
    setCurrentDocument(doc);
  };

  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setSelectedFilter(filter);

    let filteredDocs;
    switch(filter) {
      case 'all documents':
        filteredDocs = documents;
        break;
      case 'signed documents':
        // Assuming each document has a 'signed' property
        filteredDocs = documents.filter(doc => doc.signed);
        break;
      case 'unsigned documents':
        filteredDocs = documents.filter(doc => !doc.signed);
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
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Dropdown>

      <DocumentList>
        {filteredDocuments?.map((doc, index) => (
          <DocumentItem key={index}>
            <button onClick={() => handleDocumentClick(doc)}>{doc.name}</button>
          </DocumentItem>
        ))}
      </DocumentList>
    </DocumentListFilterContainer>
  );
};

export default DocumentListFilter;
