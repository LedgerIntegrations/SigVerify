// LoadingIcon.jsx
import React from 'react';
import { SiSpinrilla } from 'react-icons/si';
import './LoadingIcon.css';

const LoadingIcon = () => {
  return (
    <span className="loading-icon">
      <SiSpinrilla className="spinner" />
    </span>
  );
};

export default LoadingIcon;
