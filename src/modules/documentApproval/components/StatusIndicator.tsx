import React from 'react';

interface StatusItemProps {
  label: string;
  count: number;
  color: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, count, color }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginRight: '24px',
  }}>
    <div style={{
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: color,
    }} />
    <span style={{ color: '#4A4A4A', fontSize: '14px' }}>
      {label}: {count}
    </span>
  </div>
);

const StatusIndicator: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      paddingRight: '24px',
    }}>
      <StatusItem label="Complete" count={12} color="#4CAF50" />
      <StatusItem label="Pending" count={8} color="#FFC107" />
      <StatusItem label="Ongoing" count={5} color="#2196F3" />
    </div>
  );
};

export default StatusIndicator; 