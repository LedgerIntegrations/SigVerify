import React, { useContext, useState } from 'react';
import { AccountContext } from '../../App';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [accountObject, setAccountObject] = useContext(AccountContext);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document', file);
    formData.append('targetRAddress', accountObject.wallet)
    const response = await fetch('http://localhost:3001/api/document/fileUpload', { method: 'POST', body: formData });
    if (!response.ok) {
        console.error(`Error ${response.status}: ${response.statusText}`);
        return;
    }
    const result = await response.json();
    console.log(result)
  };

  return (
    <form onSubmit={onFormSubmit}>
      <input type="file" onChange={onFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;
