import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import UploadDocument from './components/UploadDocument/UploadDocument';
import VerifySignature from './components/VerifySignature/VerifySignature';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/verify" element={<VerifySignature />} />
        <Route path="/" element={<UploadDocument />} />
      </Routes>
    </Router>
  );
}

export default App;


