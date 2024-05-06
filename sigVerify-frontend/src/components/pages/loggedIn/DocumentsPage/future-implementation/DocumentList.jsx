import styled from 'styled-components';

// currently taken out of application temporarily

const List = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 375px;
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const ListItem = styled.li`
  margin: 10px 0;
  padding: 10px;
  background-color: #f3f3f3;
  border-radius: 5px;
`;

// eslint-disable-next-line react/prop-types
const DocumentList = ({ documents }) => {
  return (
    <List>
      {/* eslint-disable-next-line react/prop-types */}
      {documents.map((doc, index) => (
        <ListItem key={index}>
          {doc.name} - {doc.isSigned ? 'Signed' : 'Unsigned'}
        </ListItem>
      ))}
    </List>
  );
};

export default DocumentList;
