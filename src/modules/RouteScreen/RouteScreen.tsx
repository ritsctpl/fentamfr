"use client"
import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowInstance,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  MarkerType,
  Panel,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout, Button, Modal, Form, Input, Table, message, Switch } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { retrieveTop50Operation, retrieveAllOperation, retrieveRouting, fetchTop50Routing } from '@services/routingServices';
import { Content } from 'antd/es/layout/layout';
import { useRoute } from './hooks/routeContext';
import CustomNode from './components/CustomNode';
import RoutingFlow from './components/RoutingFlow';
import ContextMenu from './components/ContextMenu';
import ScriptEditor from './components/ScriptEditor';
import { NodeData } from './types';

interface FlowNodeType {
  type: string;
  label: string;
  revision?: string;
  operationType?: string;
}

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

let id = 10;
const getNextAvailableId = (existingNodes: Node[]) => {
  if (existingNodes.length === 0) return "10";

  const existingIds = existingNodes.map(node => parseInt(node.id));
  const maxId = Math.max(...existingIds);
  return (maxId + 10).toString(); // Increment by 10 from the highest existing ID
};

const columns = [
  {
    title: 'Field',
    dataIndex: 'field',
    key: 'field',
    width: '30%',
    render: (text: string) => <strong>{text}</strong>
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    width: '70%'
  }
];

export default function RouteScreen() {
  const { formData, setFormData } = useRoute();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNodeModalVisible, setIsNodeModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [flowNodeTypes, setFlowNodeTypes] = useState<FlowNodeType[]>([]);
  const [flowNodeTypes2, setFlowNodeTypes2] = useState<FlowNodeType[]>([]);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [operationDetails, setOperationDetails] = useState<any>(null);
  // const [localFormData, setLocalFormData] = useState(formData);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'edge' | 'node';
    id: string;
    element?: Edge;
  } | null>(null);
  const [isScriptModalVisible, setIsScriptModalVisible] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isSwapModalVisible, setIsSwapModalVisible] = useState(false);
  const [swapNodeId, setSwapNodeId] = useState<string | null>(null);
  const [swapStepId, setSwapStepId] = useState<string>('');
  const [nodeForm] = Form.useForm();
  const [manualOverrides, setManualOverrides] = useState<{
    [key: string]: {
      entryStep?: boolean;
      lastReportingStep?: boolean;
    };
  }>({});

  const isAnyOrderType = formData?.subType === 'AnyOrder';

  useEffect(() => {
    retrieveTop50Operation('RITS').then((res) => {
      setFlowNodeTypes(res.map(data => ({
        type: "custom",
        label: data.operation,
        revision: data.revision,
        operationType: "Operation"
      })));
    });
    fetchTop50Routing('RITS').then((res) => {
      setFlowNodeTypes2(res.map(data => ({
        type: "custom",
        label: data.routing,
        revision: data.version || "00",
        operationType: "Routing"
      })));
    });
  }, []);

  useEffect(() => {
    if (formData?.routingStepList) {
      const HORIZONTAL_SPACING = 250;
      const VERTICAL_SPACING = 150;
      const START_X = 50;
      const START_Y = 100;

      // Sort the routing steps by stepId
      const sortedSteps = [...formData.routingStepList].sort((a, b) => a.stepId - b.stepId);
      const maxStepId = Math.max(...sortedSteps.map(step => step.stepId));
      id = maxStepId + 10;

      const newNodes = sortedSteps.map((item: any, index: number) => {
        let x = START_X;
        let y = START_Y;

        if (index % 2 === 0) {
          x = START_X + (Math.floor(index / 2) * HORIZONTAL_SPACING);
          y = START_Y;
        } else {
          x = START_X + (Math.floor(index / 2) * HORIZONTAL_SPACING) + (HORIZONTAL_SPACING / 2);
          y = START_Y + VERTICAL_SPACING;
        }

        let version;
        if (item.stepType === 'Operation') {
          version = item.operationVersion;
        } else if (item.stepType === 'Routing' && item.routerDetails[0]?.version) {
          version = item.routerDetails[0]?.version;
        } else {
          version = item.routingVersion;
        }

        return {
          id: item.stepId.toString(),
          type: 'custom',
          position: { x, y },
          data: {
            id: item.stepId,
            label: item.operation || item.routing || item.stepDescription,
            revision: version,
            operationType: item.stepType
          }
        };
      });

      // Create edges based on childStepId
      const newEdges = sortedSteps.flatMap((item: any) => {
        // Handle different formats of childStepId
        const childSteps = Array.isArray(item.childStepId)
          ? item.childStepId
          : typeof item.childStepId === 'string'
            ? item.childStepId.split(',').map(Number)
            : item.childStepId
              ? [item.childStepId]
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
    } else {
      setNodes([]);
      setEdges([]);
      id = 10;
    }
  }, [formData?.routingStepList]);

  useEffect(() => {
    if (formData?.subType === 'AnyOrder') {
      setEdges([]);
    }
  }, [formData?.subType]);

  useEffect(() => {
    if (!nodes.length) return;

    const currentRoutingStepList = formData?.routingStepList || [];
    const isAnyOrder = formData?.subType === 'AnyOrder';

    // Sort nodes by stepId to determine the last node
    const sortedNodes = [...nodes].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const lastNodeId = sortedNodes[sortedNodes.length - 1].id;

    const updatedRoutingStepList = nodes.map(node => {
      const existingStep = currentRoutingStepList.find(
        (step: any) => step.stepId === parseInt(node.id)
      );

      // Get connections only if not AnyOrder
      const nodeConnections = isAnyOrder ? [] : edges
        .filter(edge => edge.source === node.id)
        .map(edge => parseInt(edge.target));

      const incomingConnections = isAnyOrder ? [] : edges
        .filter(edge => edge.target === node.id)
        .map(edge => parseInt(edge.source));

      // Check for manual overrides
      const nodeOverrides = manualOverrides[node.id] || {};

      // For AnyOrder, all nodes are entry steps and only last node is last reporting step
      const autoEntryStep = isAnyOrder ? true : !edges.some(edge => edge.target === node.id);
      const autoLastReportingStep = isAnyOrder 
        ? node.id === lastNodeId 
        : !edges.some(edge => edge.source === node.id);

      // Use manual overrides if they exist, otherwise use automatic values
      const finalEntryStep = nodeOverrides.hasOwnProperty('entryStep')
        ? nodeOverrides.entryStep
        : autoEntryStep;

      const finalLastReportingStep = nodeOverrides.hasOwnProperty('lastReportingStep')
        ? nodeOverrides.lastReportingStep
        : autoLastReportingStep;

      // Base step data structure
      const baseStep = {
        stepId: parseInt(node.id),
        stepType: node.data.operationType,
        stepDescription: node.data.label,
        reworkStep: existingStep?.reworkStep || false,
        parentStep: existingStep?.parentStep || true,
        blockPcusUntilInspectionFinished: existingStep?.blockPcusUntilInspectionFinished || false,
        entryStep: finalEntryStep,
        lastReportingStep: finalLastReportingStep,
        childStepId: isAnyOrder ? [] : nodeConnections,
        nextStepId: isAnyOrder ? "00" : (finalLastReportingStep ? "00" : (nodeConnections.join(',') || "00")),
        previousStepId: isAnyOrder ? "00" : (finalEntryStep ? "00" : (incomingConnections[0]?.toString() || parseInt(node.id).toString())),
        queueDecision: existingStep?.queueDecision || "Completing Operator",
        maximumLoopCount: existingStep?.maximumLoopCount || "",
        erpControlKey: existingStep?.erpControlKey || "",
        erpOperation: existingStep?.erpOperation || "",
        workCenter: existingStep?.workCenter || "",
        erpWorkCenter: existingStep?.erpWorkCenter || "",
        requiredTimeInProcess: existingStep?.requiredTimeInProcess || "",
        specialInstruction: existingStep?.specialInstruction || "",
        erpSequence: existingStep?.erpSequence || "",
        needToBeCompleted: isAnyOrder ? "" : nodeConnections.join(','),
      };

      if (node.data.operationType === 'Routing') {
        return {
          ...baseStep,
          operation: null,
          operationVersion: null,
          routing: node.data.label,
          routingVersion: node.data.revision || "00",
          key: parseInt(node.id),
          routingBO: `RoutingBo:RITS,${node.data.label},${node.data.revision || "00"}`,
          routerDetails: []
        };
      }

      return {
        ...baseStep,
        operation: node.data.label,
        operationVersion: node.data.revision || "00",
      };
    });

    // Only update if there are actual changes
    const currentJSON = JSON.stringify(currentRoutingStepList);
    const updatedJSON = JSON.stringify(updatedRoutingStepList);

    if (currentJSON !== updatedJSON) {
      setFormData(prev => {
        if (JSON.stringify(prev?.routingStepList) === updatedJSON) {
          return prev;
        }
        return {
          ...prev,
          routingStepList: updatedRoutingStepList
        };
      });
    }
  }, [nodes, edges, formData?.subType, manualOverrides]);

  useEffect(() => {
    if (isNodeModalVisible && selectedNode) {
      const currentStep = formData?.routingStepList?.find(
        (step: any) => step.stepId === parseInt(selectedNode.id)
      );

      nodeForm.setFieldsValue({
        stepId: selectedNode.id,
        childStepId: currentStep?.childStepId?.join(',') || '',
        nextStepId: currentStep?.nextStepId || '',
        previousStepId: currentStep?.previousStepId || '',
        entryStep: currentStep?.entryStep || false,
        lastReportingStep: currentStep?.lastReportingStep || false,
        needToBeCompleted: currentStep?.needToBeCompleted || '',
      });
    }
  }, [isNodeModalVisible, selectedNode, formData?.routingStepList]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);

    // Check the operationType and handle accordingly
    if (node.data.operationType === 'Operation') {
      retrieveAllOperation("RITS", node.data.label as string).then((data) => {
        setOperationDetails(data);
        setIsNodeModalVisible(true);
      });
    } else if (node.data.operationType === 'Routing' || node.data.operationType === 'AnyOrder') {
      retrieveRouting('RITS', node.data.label as string, node.data.revision as string).then((data) => {
        setOperationDetails(data?.routingStepList);
        setIsNodeModalVisible(true);
      })
    }
  }, []);

  const handleModalOk = () => {
    const values = form.getFieldsValue();
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, label: values.label } as NodeData }
            : node
        )
      );
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, label: string, revision?: string, operationType?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', label);
    event.dataTransfer.setData('revision', revision);
    event.dataTransfer.setData('operationType', operationType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('nodeName');
      const revision = event.dataTransfer.getData('revision');
      const operationType = event.dataTransfer.getData('operationType');


      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position based on existing nodes
      const existingNodes = nodes.length;
      const HORIZONTAL_SPACING = 250;
      const VERTICAL_SPACING = 150;
      const START_X = 50;
      const START_Y = 100;

      let position;
      if (existingNodes % 2 === 0) {
        position = {
          x: START_X + (Math.floor(existingNodes / 2) * HORIZONTAL_SPACING),
          y: START_Y
        };
      } else {
        position = {
          x: START_X + (Math.floor(existingNodes / 2) * HORIZONTAL_SPACING) + (HORIZONTAL_SPACING / 2),
          y: START_Y + VERTICAL_SPACING
        };
      }

      const newId = getNextAvailableId(nodes);

      const newNode: Node = {
        id: newId,
        type,
        position,
        data: {
          label,
          revision: revision || "00",
          operationType
        } as NodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, nodes]
  );

  const onConnect = useCallback((params: Connection) => {
    // Prevent connections if it's AnyOrder type
    if (isAnyOrderType) {
      message.warning('Connections are not allowed in AnyOrder type');
      return;
    }

    setEdges((eds) => {
      const connectionExists = eds.some(
        (edge) => edge.source === params.source && edge.target === params.target
      );

      if (!connectionExists && params.source && params.target) {
        return addEdge({
          ...params,
          id: `e${params.source}-${params.target}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        }, eds);
      }
      return eds;
    });
  }, [isAnyOrderType]);

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Prevent native context menu from showing
      event.preventDefault();

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        id: edge.id,
        element: edge,
      });
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        id: node.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!contextMenu) return;

    if (contextMenu.type === 'edge') {
      setEdges(edges => edges.filter(e => e.id !== contextMenu.id));
    } else if (contextMenu.type === 'node') {
      setNodes(nodes => nodes.filter(n => n.id !== contextMenu.id));
      // Also remove any connected edges
      setEdges(edges => edges.filter(e => e.source !== contextMenu.id && e.target !== contextMenu.id));
    }
  }, [contextMenu]);

  const clearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    id = 10;
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleScriptClick = useCallback((edge: Edge) => {
    setSelectedEdge(edge);
    setIsScriptModalVisible(true);
  }, []);

  const handleScriptExecute = useCallback((result: string) => {
    if (selectedEdge) {
      setEdges(edges => edges.map(edge => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              scriptOutput: result
            },
            label: result ? `[ ${result} ]` : undefined
          };
        }
        return edge;
      }));
    }
  }, [selectedEdge]);

  const handleSwap = useCallback((nodeId: string) => {
    setSwapNodeId(nodeId);
    setIsSwapModalVisible(true);
  }, []);

  const handleSwapConfirm = useCallback(() => {
    if (!swapNodeId || !swapStepId) return;

    const sourceNode = nodes.find(n => n.id === swapNodeId);
    const targetNode = nodes.find(n => n.id === swapStepId);

    if (!sourceNode || !targetNode) {
      message.error('Invalid node selection');
      return;
    }

    // Swap node data instead of positions
    setNodes(nds => nds.map(node => {
      if (node.id === swapNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: targetNode.data.label,
            revision: targetNode.data.revision || "00",
            operationType: targetNode.data.operationType
          }
        };
      }
      if (node.id === swapStepId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: sourceNode.data.label,
            revision: sourceNode.data.revision || "00",
            operationType: sourceNode.data.operationType
          }
        };
      }
      return node;
    }));

    // Update formData to reflect the swapped data
    setFormData(prev => {
      if (!prev?.routingStepList) return prev;

      const updatedStepList = prev.routingStepList.map(step => {
        if (step.stepId.toString() === swapNodeId) {
          const targetStep = prev.routingStepList.find(s => s.stepId.toString() === swapStepId);
          if (!targetStep) return step;

          return {
            ...step,
            stepDescription: targetStep.stepDescription,
            operation: targetStep.operation,
            operationVersion: targetStep.operationVersion,
            routing: targetStep.routing,
            routingVersion: targetStep.routingVersion,
            routingBO: targetStep.routingBO,
            routerDetails: targetStep.routerDetails
          };
        }
        if (step.stepId.toString() === swapStepId) {
          const sourceStep = prev.routingStepList.find(s => s.stepId.toString() === swapNodeId);
          if (!sourceStep) return step;

          return {
            ...step,
            stepDescription: sourceStep.stepDescription,
            operation: sourceStep.operation,
            operationVersion: sourceStep.operationVersion,
            routing: sourceStep.routing,
            routingVersion: sourceStep.routingVersion,
            routingBO: sourceStep.routingBO,
            routerDetails: sourceStep.routerDetails
          };
        }
        return step;
      });

      return {
        ...prev,
        routingStepList: updatedStepList
      };
    });

    setIsSwapModalVisible(false);
    setSwapNodeId(null);
    setSwapStepId('');
    message.success('Node data swapped successfully');
  }, [swapNodeId, swapStepId, nodes]);

  const handleNodeDetailsChange = useCallback((nodeId: string, changes: any) => {
    // Track manual changes to entry/last reporting steps
    if (changes.hasOwnProperty('entryStep') || changes.hasOwnProperty('lastReportingStep')) {
      setManualOverrides(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          ...(changes.hasOwnProperty('entryStep') ? { entryStep: changes.entryStep } : {}),
          ...(changes.hasOwnProperty('lastReportingStep') ? { lastReportingStep: changes.lastReportingStep } : {})
        }
      }));
    }

    const updates = () => {
      // Update nodes if needed (for label changes)
      if (changes.label) {
        setNodes(nds => nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: changes.label
              }
            };
          }
          return node;
        }));
      }

      // Update formData.routingStepList
      setFormData(prev => {
        if (!prev?.routingStepList) return prev;

        const updatedStepList = prev.routingStepList.map(step => {
          if (step.stepId.toString() === nodeId) {
            const isAnyOrder = prev.subType === 'AnyOrder';
            const sortedNodes = [...nodes].sort((a, b) => parseInt(a.id) - parseInt(b.id));
            const lastNodeId = sortedNodes[sortedNodes.length - 1].id;
            
            const autoEntryStep = isAnyOrder ? true : !edges.some(edge => edge.target === nodeId);
            const autoLastReportingStep = isAnyOrder 
              ? nodeId === lastNodeId 
              : !edges.some(edge => edge.source === nodeId);

            // Use manual overrides if they exist, otherwise use automatic values
            const nodeOverrides = manualOverrides[nodeId] || {};

            return {
              ...step,
              ...changes,
              stepId: parseInt(changes.stepId || step.stepId),
              childStepId: changes.childStepId ? changes.childStepId.split(',').map(Number) : step.childStepId,
              entryStep: changes.hasOwnProperty('entryStep') 
                ? changes.entryStep 
                : nodeOverrides.hasOwnProperty('entryStep')
                  ? nodeOverrides.entryStep
                  : autoEntryStep,
              lastReportingStep: changes.hasOwnProperty('lastReportingStep')
                ? changes.lastReportingStep
                : nodeOverrides.hasOwnProperty('lastReportingStep')
                  ? nodeOverrides.lastReportingStep
                  : autoLastReportingStep
            };
          }
          return step;
        });

        if (JSON.stringify(prev.routingStepList) === JSON.stringify(updatedStepList)) {
          return prev;
        }

        return {
          ...prev,
          routingStepList: updatedStepList
        };
      });
    };

    setTimeout(updates, 0);
  }, [nodes, edges, manualOverrides]);

  const resetNodeOverrides = useCallback((nodeId: string) => {
    setManualOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[nodeId];
      return newOverrides;
    });
  }, []);

  return (
    <Layout style={{ height: '100%' }}>
      <Sider width={250} style={{
        backgroundColor: '#fff',
        boxShadow: '1px 0 2px rgba(0,0,0,0.05)',
        height: '100%',
        padding: '8px',
      }}>
        <div className="sidebar" style={{ overflowY: 'auto', height: 'calc(72vh)' }}>
          <Input.Search
            placeholder="Search..."
            onSearch={handleSearch}
            enterButton
            style={{ marginBottom: '12px' }}
          />
          <div>
            <h3 style={{
              fontSize: '14px',
              color: '#1e293b',
              borderBottom: '1px solid #e5e7eb',
            }}>
              Operation List
            </h3>

            {flowNodeTypes.filter(nodeType => nodeType.label.toLowerCase().includes(searchQuery.toLowerCase())).map((nodeType, index) => (
              <div
                style={{
                  padding: '2px',
                  margin: '4px 0',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  cursor: 'grab',
                  backgroundColor: '#f8fafc',
                  fontSize: '12px',
                }}
                key={nodeType.label + index}
                draggable
                onDragStart={(event) => onDragStart(event, nodeType.type, nodeType.label, nodeType.revision, nodeType.operationType)}
              >
                {nodeType.label}
              </div>
            ))}
          </div>
          <div>
            <h3 style={{
              fontSize: '14px',
              color: '#1e293b',
              borderBottom: '1px solid #e5e7eb',
            }}>
              Routing List
            </h3>
            {flowNodeTypes2.filter(nodeType => nodeType.label.toLowerCase().includes(searchQuery.toLowerCase())).map((nodeType, index) => (
              <div
                style={{
                  padding: '2px',
                  margin: '4px 0',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  cursor: 'grab',
                  backgroundColor: '#f8fafc',
                  fontSize: '12px',
                }}
                key={nodeType.label + index}
                draggable
                onDragStart={(event) => onDragStart(event, nodeType.type, nodeType.label, nodeType.revision, nodeType.operationType)}
              >
                {nodeType.label}
              </div>
            ))}
          </div>
        </div>
      </Sider>
      <Content>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeContextMenu={onEdgeContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
            snapToGrid={true}
            snapGrid={[15, 15]}
            nodesDraggable={true}
            nodesConnectable={!isAnyOrderType}
            elementsSelectable={true}
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <Button
                onClick={clearFlow}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 1px 2px rgba(239,68,68,0.1)',
                  fontSize: '13px',
                  padding: '4px 12px',
                  height: 'auto',
                  marginRight: '10px'
                }}
              >
                Clear Flow
              </Button>
            </Panel>
            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={() => setContextMenu(null)}
                onDelete={handleDelete}
                onScript={handleScriptClick}
                onSwap={handleSwap}
                type={contextMenu.type}
                element={contextMenu.type === 'edge' ? contextMenu.element : nodes.find(n => n.id === contextMenu.id)}
              />
            )}
          </ReactFlow>
        </div>
      </Content>
      <Modal
        title="Edit Node"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form}>
          <Form.Item name="label" label="Label">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedNode?.data?.label}
        open={isNodeModalVisible}
        centered
        onCancel={() => setIsNodeModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ fontSize: '14px' }}>
          {selectedNode?.data?.operationType === 'Operation' ? (
            operationDetails && operationDetails.length > 0 ? (
              <div>
                {/* Operation Details Table */}
                <Table
                  dataSource={[
                    { key: '1', field: 'Operation', value: operationDetails[0].operation },
                    { key: '2', field: 'Description', value: operationDetails[0].description },
                    { key: '3', field: 'Revision', value: operationDetails[0].revision },
                    { key: '4', field: 'Status', value: operationDetails[0].status },
                    { key: '5', field: 'Operation Type', value: operationDetails[0].operationType },
                    { key: '6', field: 'Current Version', value: operationDetails[0].currentVersion ? 'Yes' : 'No' }
                  ]}
                  columns={columns}
                  pagination={false}
                  bordered
                  size="small"
                  style={{ marginBottom: '24px' }}
                />

                {/* Editable Routing Details Form */}
                <Form
                  form={nodeForm}
                  layout="vertical"
                  key={selectedNode.id}
                  onValuesChange={(changedValues) => {
                    handleNodeDetailsChange(selectedNode.id, changedValues);
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    backgroundColor: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <Form.Item label="Step ID" name="stepId">
                      <Input disabled />
                    </Form.Item>
                    <Form.Item label="Child Step ID" name="childStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} placeholder="Enter comma-separated step IDs" />
                    </Form.Item>
                    <Form.Item label="Next Step ID" name="nextStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} />
                    </Form.Item>
                    <Form.Item label="Previous Step ID" name="previousStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} />
                    </Form.Item>
                    <Form.Item label="Need To Be Completed" name="needToBeCompleted">
                      <Input />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Form.Item 
                        label={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Entry Step
                            {manualOverrides[selectedNode?.id]?.hasOwnProperty('entryStep') && (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => resetNodeOverrides(selectedNode.id)}
                                style={{ padding: 0 }}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        }
                        name="entryStep" 
                        valuePropName="checked"
                        tooltip="Auto-set based on connections, but can be manually overridden"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item 
                        label={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Last Reporting Step
                            {manualOverrides[selectedNode?.id]?.hasOwnProperty('lastReportingStep') && (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => resetNodeOverrides(selectedNode.id)}
                                style={{ padding: 0 }}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        }
                        name="lastReportingStep" 
                        valuePropName="checked"
                        tooltip="Auto-set based on connections, but can be manually overridden"
                      >
                        <Switch />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              </div>
            ) : (
              <p>Loading...</p>
            )
          ) : selectedNode?.data?.operationType === 'Routing' ? (
            operationDetails ? (
              <div>
                {/* <Table
                  dataSource={[
                    { key: '1', field: 'Routing', value: selectedNode.data.label },
                    { key: '2', field: 'Version', value: selectedNode.data.revision || '00' },
                    { key: '3', field: 'Type', value: selectedNode.data.operationType }
                  ]}
                  columns={columns}
                  pagination={false}
                  bordered
                  size="small"
                  style={{ marginBottom: '24px' }}
                /> */}
                <div style={{ marginBottom: '24px' }}>
                  <RoutingFlow routingSteps={operationDetails} />
                </div>
                <Form
                  form={nodeForm}
                  layout="vertical"
                  key={selectedNode.id}
                  onValuesChange={(changedValues) => {
                    handleNodeDetailsChange(selectedNode.id, changedValues);
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    backgroundColor: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <Form.Item label="Step ID" name="stepId">
                      <Input disabled />
                    </Form.Item>
                    <Form.Item label="Child Step ID" name="childStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} placeholder="Enter comma-separated step IDs" />
                    </Form.Item>
                    <Form.Item label="Next Step ID" name="nextStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} />
                    </Form.Item>
                    <Form.Item label="Previous Step ID" name="previousStepId">
                      <Input disabled={formData?.subType === 'AnyOrder'} />
                    </Form.Item>
                    <Form.Item label="Need To Be Completed" name="needToBeCompleted">
                      <Input />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Form.Item 
                        label={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Entry Step
                            {manualOverrides[selectedNode?.id]?.hasOwnProperty('entryStep') && (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => resetNodeOverrides(selectedNode.id)}
                                style={{ padding: 0 }}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        }
                        name="entryStep" 
                        valuePropName="checked"
                        tooltip="Auto-set based on connections, but can be manually overridden"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item 
                        label={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Last Reporting Step
                            {manualOverrides[selectedNode?.id]?.hasOwnProperty('lastReportingStep') && (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => resetNodeOverrides(selectedNode.id)}
                                style={{ padding: 0 }}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        }
                        name="lastReportingStep" 
                        valuePropName="checked"
                        tooltip="Auto-set based on connections, but can be manually overridden"
                      >
                        <Switch />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              </div>
            ) : (
              <p>Loading routing details...</p>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No additional details available for {selectedNode?.data?.operationType} type.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="Script Editor"
        open={isScriptModalVisible}
        onCancel={() => setIsScriptModalVisible(false)}
        width={800}
        footer={null}
      >
        <ScriptEditor onExecute={handleScriptExecute} />
      </Modal>

      <Modal
        title="Swap Node Position"
        open={isSwapModalVisible}
        onOk={handleSwapConfirm}
        onCancel={() => {
          setIsSwapModalVisible(false);
          setSwapNodeId(null);
          setSwapStepId('');
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Enter Step ID to swap with">
            <Input
              value={swapStepId}
              onChange={e => setSwapStepId(e.target.value)}
              placeholder="Enter Step ID"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}