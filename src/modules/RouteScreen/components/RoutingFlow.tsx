import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 1.5 },
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#94a3b8',
  },
};

const RoutingFlow: React.FC<{ routingSteps: any[] }> = ({ routingSteps }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (routingSteps) {
      const HORIZONTAL_SPACING = 250;
      const VERTICAL_SPACING = 150;
      const START_X = 50;
      const START_Y = 100;

      // Sort the routing steps by stepId
      const sortedSteps = [...routingSteps].sort((a, b) => a.stepId - b.stepId);

      // Create nodes with staggered positioning
      const newNodes = sortedSteps.map((item: any, index: number) => {
        let x = START_X;
        let y = START_Y;

        // Create a staggered layout
        if (index % 2 === 0) {
          x = START_X + (Math.floor(index / 2) * HORIZONTAL_SPACING);
          y = START_Y;
        } else {
          x = START_X + (Math.floor(index / 2) * HORIZONTAL_SPACING) + (HORIZONTAL_SPACING / 2);
          y = START_Y + VERTICAL_SPACING;
        }

        return {
          id: item.stepId.toString(),
          type: 'custom',
          position: { x, y },
          data: {
            label: item.operation || item.stepDescription,
            revision: item.operationVersion,
            operationType: item.stepType
          }
        };
      });

      // Create edges based on childStepId and needToBeCompleted
      const newEdges = sortedSteps.flatMap((item: any) => {
        // Handle different formats of childStepId
        const childSteps = Array.isArray(item.childStepId)
          ? item.childStepId
          : typeof item.childStepId === 'string'
            ? item.childStepId.split(',').map(Number)
            : item.needToBeCompleted
              ? item.needToBeCompleted.split(',').map(Number)
              : [];

        return childSteps
          .filter((childId: any) => childId && childId !== '0' && childId !== 0)
          .map((childId: any) => ({
            id: `e${item.stepId}-${childId}`,
            source: item.stepId.toString(),
            target: childId.toString(),
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          }));
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [routingSteps]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 130, y: 0, zoom: 0.9 }}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default RoutingFlow; 