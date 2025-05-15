'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Position, ReactFlow, MarkerType } from '@xyflow/react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { Form, Input, Switch, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import '@xyflow/react/dist/style.css';

interface MachineData {
  machineNo: string;
  completed: number;
  cycleTime: string;
  materialUsed: number;
  remaining: number;
  description: string;
}

const machineData: MachineData[] = [
  {
    machineNo: "MIX-01",
    completed: 500,
    cycleTime: "45 mins",
    materialUsed: 100,
    remaining: 400,
    description: "Raw Material Mixing"
  },
  {
    machineNo: "GRN-02",
    completed: 480,
    cycleTime: "30 mins",
    materialUsed: 98,
    remaining: 382,
    description: "Granulation"
  },
  {
    machineNo: "DRY-03",
    completed: 475,
    cycleTime: "60 mins",
    materialUsed: 95,
    remaining: 380,
    description: "Drying & Milling"
  },
  {
    machineNo: "CMP-04",
    completed: 45000,
    cycleTime: "20 mins",
    materialUsed: 92,
    remaining: 368,
    description: "Tablet Compression"
  },
  {
    machineNo: "CTG-05",
    completed: 44500,
    cycleTime: "25 mins",
    materialUsed: 90,
    remaining: 360,
    description: "Coating"
  },
  {
    machineNo: "PKG-01",
    completed: 44000,
    cycleTime: "15 mins",
    materialUsed: 88,
    remaining: 352,
    description: "Packaging"
  }
];

const Popup = ({ data }: { data: MachineData }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '280px',
    border: '1px solid #ddd',
    position: 'relative'
  }}>
    <div style={{
      position: 'absolute',
      left: '-6px',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      width: '12px',
      height: '12px',
      backgroundColor: '#f9f9f9',
      borderLeft: '1px solid #ddd',
      borderBottom: '1px solid #ddd'
    }} />
    
    <div style={{ 
      borderBottom: '1px solid #ccc', 
      paddingBottom: '8px',
      marginBottom: '8px'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '4px', color: '#333' }}>
        {data.description}
      </div>
      <div style={{ color: '#777' }}>
        Machine: {data.machineNo}
      </div>
    </div>
    
    <div style={{ display: 'grid', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#777' }}>Completed:</span>
        <span style={{ fontWeight: '500', color: '#333' }}>
          {data.completed.toLocaleString()} {data.completed > 10000 ? 'tablets' : 'kg'}
        </span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#777' }}>Cycle Time:</span>
        <span style={{ fontWeight: '500', color: '#333' }}>{data.cycleTime}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#777' }}>Material Used:</span>
        <span style={{ fontWeight: '500', color: '#333' }}>{data.materialUsed}kg</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#777' }}>Remaining:</span>
        <span style={{ fontWeight: '500', color: '#333' }}>{data.remaining}kg</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#777' }}>Efficiency:</span>
        <span style={{ 
          fontWeight: '500',
          backgroundColor: '#e0f7fa',
          color: '#00796b',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.9em'
        }}>
          {Math.round((data.materialUsed / (data.materialUsed + data.remaining)) * 100)}%
        </span>
      </div>
    </div>
  </div>
);

const NodeTable = ({ data }: { data: MachineData }) => {
  const [showPopup, setShowPopup] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
    }
    setShowPopup(true);
  };

  return (
    <div 
      ref={nodeRef}
      style={{ 
        padding: '0',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPopup(false)}
    >
      {showPopup && (
        <div style={{
          position: 'fixed',
          zIndex: 1000,
        }}>
          <Popup data={data} />
        </div>
      )}
      
      {/* Header Section */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: '12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: '1.1em',
          color: '#333',
          marginBottom: '4px'
        }}>
          {data.description}
        </div>
        <div style={{
          fontSize: '0.9em',
          color: '#666'
        }}>
          {data.machineNo}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '12px' }}>
        {/* Remaining Section */}
        <div style={{
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '4px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>
            Remaining
          </div>
          <div style={{ fontWeight: 'bold', color: '#333' }}>
            {data.remaining} kg
          </div>
        </div>

        {/* Material Used Section */}
        <div style={{
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '4px',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>
            Material Used
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>
              {data.materialUsed}kg
            </div>
            <div style={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.8em'
            }}>
              {Math.round((data.materialUsed / (data.materialUsed + data.remaining)) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getNodeColor = (machineNo: string) => {
  switch (true) {
    case machineNo.startsWith('MIX'):
      return { background: '#e3f2fd', border: '2px solid #1976d2' }; 
    case machineNo.startsWith('GRN'):
      return { background: '#f3e5f5', border: '2px solid #7b1fa2' };
    case machineNo.startsWith('DRY'):
      return { background: '#fff3e0', border: '2px solid #e65100' }; 
    case machineNo.startsWith('CMP'):
      return { background: '#e8f5e9', border: '2px solid #2e7d32' }; 
    case machineNo.startsWith('CTG'):
      return { background: '#fce4ec', border: '2px solid #c2185b' }; 
    case machineNo.startsWith('PKG'):
      return { background: '#f1f8e9', border: '2px solid #558b2f' }; 
    default:
      return { background: '#fff', border: '1px solid #ddd' };
  }
};

const createNodes = (machinesData: MachineData[]) => {
  return machinesData.map((data, index) => ({
    id: (index + 1).toString(),
    position: { 
      x: (index % 3) * 500,
      y: Math.floor(index / 3) * 400
    },
    data: { 
      label: <NodeTable data={data} /> 
    },
    style: {
      padding: '10px',
      borderRadius: '8px',
      minWidth: '250px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      ...getNodeColor(data.machineNo)
    },
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
  }));
};

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps & { data?: { completed: number; rejected: number; showRejected: boolean } }) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 - 10;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: '#b1b1b7',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
      />
      {data?.completed && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          style={{
            fill: '#2196f3',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: 'white',
          }}
        >
          {data.completed.toLocaleString()} {data.completed > 10000 ? 'tablets' : 'kg'}
          {data.showRejected && ` - ${data.rejected.toLocaleString()} rejected`}
        </text>
      )}
    </>
  );
};

const createEdges = (machinesData: MachineData[]) => {
  const edges = [];
  
  for (let i = 0; i < machinesData.length - 1; i++) {
    let source = (i + 1).toString();
    let target = (i + 2).toString();
    const isRowTransition = i === 2;
    
    const showRejected = machinesData[i].machineNo.startsWith('CMP') || 
                        machinesData[i].machineNo.startsWith('CTG');
    
    const rejected = machinesData[i].completed - machinesData[i + 1].completed;
    
    edges.push({
      id: `e${i + 1}-${i + 2}`,
      source: source,
      target: target,
      type: 'custom',
      animated: true,
      data: {
        completed: machinesData[i].completed,
        rejected: rejected,
        showRejected: showRejected
      },
      style: { 
        stroke: '#b1b1b7',
        ...(isRowTransition && {
          strokeWidth: 2,
          strokeDasharray: '5,5',
        })
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#b1b1b7',
      },
    });
  }
  
  return edges;
};

interface CompletedBatch {
  timestamp: string;
  quantity: number;
}

interface TableDataType {
  key: string;
  timestamp: string;
  quantity: number;
  status: string;
}

export default function TransferTime() {
  const [currentData, setCurrentData] = useState(machineData);
  const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>([]);
  const [isAlternateMode, setIsAlternateMode] = useState(false);

  const getRandomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const updateValues = (isAlternate: boolean = false) => {
    setCurrentData(prevData => {
      const newData = [...prevData];
      
      // Different ranges based on toggle state
      const ranges = isAlternate ? {
        firstValue: { min: 600, max: 700 },
        loss: { min: 2, max: 8 }
      } : {
        firstValue: { min: 450, max: 550 },
        loss: { min: 1, max: 5 }
      };
      
      // Store current completed values to use as next remaining values
      const previousCompleted = newData.map(machine => machine.completed);
      
      // Update first node
      const newFirstValue = getRandomValue(ranges.firstValue.min, ranges.firstValue.max);
      newData[0].completed = newFirstValue;
      newData[0].remaining = previousCompleted[0]; // Previous completed becomes new remaining
      
      // Update subsequent nodes
      for (let i = 1; i < newData.length; i++) {
        const loss = getRandomValue(ranges.loss.min, ranges.loss.max) / 100;
        const prevValue = newData[i - 1].completed;
        
        if (i >= 3) {
          // For tablet stages (multiply by 100)
          newData[i].completed = i === 3 
            ? Math.floor(prevValue * 100)
            : Math.floor(prevValue * (1 - loss));
        } else {
          // For kg stages
          newData[i].completed = Math.floor(prevValue * (1 - loss));
        }
        
        // Set remaining as previous completed value
        newData[i].remaining = previousCompleted[i];
      }

      // Add last completed batch to table
      const lastMachine = newData[newData.length - 1];
      setCompletedBatches(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          quantity: lastMachine.completed
        },
        ...prev 
      ]);

      return newData;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => updateValues(isAlternateMode), 60000);
    return () => clearInterval(interval);
  }, [isAlternateMode]);

  const nodes = createNodes(currentData);
  const edges = createEdges(currentData);

  console.log(completedBatches,'completedBatches');
  

  const [form] = Form.useForm();

  const onFormSubmit = (values: any) => {
    console.log('Form values:', values);
  };

  const handleToggleChange = (checked: boolean) => {
    setIsAlternateMode(checked);
    // Immediately update values when toggle changes
    updateValues(checked);
  };

  const columns: ColumnsType<TableDataType> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Quantity (Tablets)',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => quantity.toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <span style={{ 
          color: '#4CAF50',
          backgroundColor: '#e8f5e9',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.9em'
        }}>
          Completed
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        margin: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Form
          form={form}
          layout="inline"
          onFinish={onFormSubmit}
          style={{ justifyContent: 'space-between' }}
        >
          <Space size="middle" style={{width:'100%', display:'flex', justifyContent:'space-around'}}>
            <Form.Item
              name="field1"
              label="Field 1"
            >
              <Input placeholder="Enter field 1" />
            </Form.Item>
            
            <Form.Item
              name="field2"
              label="Field 2"
            >
              <Input placeholder="Enter field 2" />
            </Form.Item>
            
            <Form.Item
              name="field3"
              label="Field 3"
            >
              <Input placeholder="Enter field 3" />
            </Form.Item>

            <Form.Item
              name="toggle"
              label="Toggle"
              valuePropName="checked"
            >
              <Switch onChange={handleToggleChange} />
            </Form.Item>
          </Space>
        </Form>
      </div>

      <div style={{ width: '100%', height: '600px' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          edgeTypes={{ custom: CustomEdge }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        />
      </div>
      
      <div style={{ 
        margin: '20px', 
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Recent Completed Batches</h3>
        <Table 
          columns={columns}
          dataSource={completedBatches.map((batch, index) => ({
            key: batch.timestamp,
            timestamp: batch.timestamp,
            quantity: batch.quantity,
            status: 'Completed'
          }))}
          pagination={false}
          scroll={{ y: 240 }}
          size="middle"
        />
      </div>
    </div>
  );
}