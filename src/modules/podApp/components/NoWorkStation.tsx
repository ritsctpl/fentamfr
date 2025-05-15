import React from 'react';
import { MdComputer } from "react-icons/md";

const NoWorkStation = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    gap: '20px'
  };

  const messageStyle = {
    fontSize: '1rem',
    color: '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center' as 'center',
    padding: '10px',
    border: '2px solid #d9534f',
    borderRadius: '8px',
    backgroundColor: '#fce6e6',
  };

  const iconStyle = {
    fontSize: '100px',
    color: '#d9534f',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <MdComputer style={iconStyle} />
      <h1 style={messageStyle}>NO WORKSTATION FOUND</h1>
    </div>
  );
};

export default NoWorkStation;
