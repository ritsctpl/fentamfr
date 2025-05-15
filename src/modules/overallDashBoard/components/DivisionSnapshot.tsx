import React from 'react';

const DivisionSnapshot = () => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '16px',
  };

  const comparisonStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#6b7280', // text-gray-500
    fontWeight: '500',
  };

  const valueStyle = {
    fontSize: '14px',
    fontWeight: '600',
  };

  const getComparisonData = (current: number, previous: number) => {
    const diff = ((current - previous) / previous) * 100;
    const isPositive = diff >= 0;
    return {
      color: isPositive ? '#10b981' : '#ef4444',
      icon: isPositive ? '▲' : '▼',
      value: `${Math.abs(diff).toFixed(1)}%`,
    };
  };

  return (
    <div style={containerStyle}>
      <div style={comparisonStyle}>
        <div style={labelStyle}>Today vs Yesterday</div>
        <div style={{ ...valueStyle, color: '#10b981' }}>
          <span>50% vs 60%</span>
          <span style={{ marginLeft: '4px' }}>▲ 3.8%</span>
        </div>
      </div>

      <div style={comparisonStyle}>
        <div style={labelStyle}>Week vs Last</div>
        <div style={{ ...valueStyle, color: '#ef4444' }}>
          <span>45% vs 44%</span>
          <span style={{ marginLeft: '4px' }}>▼ 1.2%</span>
        </div>
      </div>

      <div style={comparisonStyle}>
        <div style={labelStyle}>Month vs Last</div>
        <div style={{ ...valueStyle, color: '#10b981' }}>
          <span>55% vs 52%</span>
          <span style={{ marginLeft: '4px' }}>▲ 5.4%</span>
        </div>
      </div>

      <div style={comparisonStyle}>
        <div style={labelStyle}>Year vs Last</div>
        <div style={{ ...valueStyle, color: '#10b981' }}>
          <span>65% vs 60%</span>
          <span style={{ marginLeft: '4px' }}>▲ 8.7%</span>
        </div>
      </div>
    </div>
  );
};

export default DivisionSnapshot;
