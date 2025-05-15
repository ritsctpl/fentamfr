'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }: any) => {
    return (
        <div style={{
            padding: '15px',
            borderRadius: '8px',
            background: 'white',
            border: '1px solid #ddd',
            textAlign: 'center',
            minWidth: '200px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {data.title}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {data.oee?.toFixed(2)}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', marginBottom: '10px' }}>
                <span>A - {data.availability?.toFixed(2)}%</span>
                <span>P - {data.performance?.toFixed(2)}%</span>
                <span>Q - {data.quality?.toFixed(2)}%</span>
            </div>
            <div style={{ display: 'grid', fontSize: '12px',gap:10 }}>
                <span style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                    Target Qty
                    <span style={{ fontSize: '13px',fontWeight:600}}>{data.targetQty?.toFixed(2)}</span>
                </span>
                <span style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                    Actual Qty
                    <span style={{ fontSize: '13px',fontWeight:600}}>{data.actualQty?.toFixed(2)}</span>
                </span>
            </div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default CustomNode;