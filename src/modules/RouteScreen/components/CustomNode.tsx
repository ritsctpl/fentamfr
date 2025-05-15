import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }: { data: any }) => {
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const isRoutingNode = data.operationType === 'Routing';
  const isAnyOrderNode = data.operationType === 'AnyOrder';

  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #cbd5e1',
        backgroundColor: data.operationType === 'Operation' ? '#e2e8f0' : '#f1f5f9',
        width: '150px',
        height: isRoutingNode || isAnyOrderNode ? '150px' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: isAnyOrderNode ? '50%' : isRoutingNode ? '0' : '4px',
        transform: isRoutingNode ? 'rotate(45deg)' : 'none',
        position: 'relative',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#94a3b8' }}
      />
      <div
        style={{
          transform: isRoutingNode ? 'rotate(-45deg)' : 'none',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#1e293b',
            marginBottom: '4px',
          }}
        >
          {truncateText(data.label)}
        </div>
        {data.revision && (
          <div
            style={{
              fontSize: '10px',
              color: '#64748b',
            }}
          >
            Rev: {data.revision}
          </div>
        )}
        <div
            style={{
              fontSize: '10px',
              color: '#64748b',
            }}
          >
            Step ID: {data.id}
          </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#94a3b8' }}
      />
    </div>
  );
};

export default memo(CustomNode); 