import React, { useMemo, useCallback, useState, useContext, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, MarkerType, ConnectionLineType, NodeTypes,
   EdgeTypes, OnNodesDelete, OnEdgesDelete, OnConnect, addEdge, Panel, Connection, useReactFlow, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMyContext } from '../hooks/WorkFlowConfigurationContext';
import styles from '../styles/WorkFlowMaintenance.module.css';
import { Input, Modal, Table, Button, Space } from 'antd';
import { parseCookies } from 'nookies';
import { fetchAllUserGroup, retrieveAllUserGroup, retrieveAllWorkFlowStatesMaster } from '@services/workflowConfigurationService';
import { AnyAaaaRecord } from 'dns';
import { GrFormView } from "react-icons/gr";
import { CheckOutlined, CloseCircleTwoTone, CloseOutlined, EyeTwoTone } from '@ant-design/icons';
import { CheckCircleTwoTone } from '@ant-design/icons';

// Update the interface to match the new JSON structure
interface WorkflowTransition {
  fromUserId: any;
  action: string;
  toUserId: any;
  uiConfig: {
    remarksRequired: boolean;
    attachmentRequired: boolean;
  };
  constraints: {
    dueInHours: number;
  };
}

interface WorkflowConfig {
  workflowId: string;
  transitions: WorkflowTransition[];
}

// Create positioning strategy
const createPositioningStrategy = (users: string[], transitions: WorkflowTransition[]) => {
  const nodePositions = new Map<string, { x: number, y: number }>();
  const nodeDepths = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();

  // First, identify the root node (typically the initiator)
  const findRootNode = (users: string[], transitions: WorkflowTransition[]) => {
    // Prefer initiator or first node without incoming transitions
    const usersWithIncomingTransitions = new Set(
      transitions ? transitions.map(t => t.toUserId) : []
    );

    const initiator = users.find(
      user => user.toLowerCase().includes('initiator') || 
              !usersWithIncomingTransitions.has(user)
    );

    return initiator || users[0];
  };

  const rootNode = findRootNode(users, transitions);

  // Group transitions by source node to handle multiple paths
  const transitionsBySource = transitions ? transitions.reduce((acc, transition) => {
    if (!acc[transition.fromUserId]) {
      acc[transition.fromUserId] = [];
    }
    acc[transition.fromUserId].push(transition);
    return acc;
  }, {} as Record<string, WorkflowTransition[]>): {};

  // Improved depth-first positioning with better handling of multiple paths
  const assignDepthAndPosition = (
    currentUser: string, 
    depth: number = 0, 
    horizontalOffset: number = 0,
    parentPath: string[] = []
  ) => {
    // Avoid cycles
    if (parentPath.includes(currentUser)) return;

    // Assign depth
    nodeDepths.set(currentUser, depth);

    // Get outgoing transitions for current user
    const outgoingTransitions = transitionsBySource[currentUser] || [];

    // Group transitions by action type
    const submitTransitions = outgoingTransitions.filter(t => t.action === 'Submit');
    const draftTransitions = outgoingTransitions.filter(t => t.action === 'Draft');
    const otherTransitions = outgoingTransitions.filter(
      t => t.action !== 'Submit' && t.action !== 'Draft'
    );

    // Combine and prioritize transitions
    const prioritizedTransitions = [
      ...submitTransitions,
      ...draftTransitions,
      ...otherTransitions
    ];

    // Position current node
    if (!nodePositions.has(currentUser)) {
      nodePositions.set(currentUser, { 
        x: horizontalOffset, 
        y: depth * 250 
      });
    }

    // Recursive positioning for children
    prioritizedTransitions.forEach((transition, index) => {
      const child = transition.toUserId;
      
      // Calculate horizontal spread
      const childrenCount = prioritizedTransitions.length;
      const horizontalSpread = 300; // Increased spacing
      const childOffset = horizontalOffset + 
        (index - (childrenCount - 1) / 2) * horizontalSpread;

      // Recursively position child
      if (!nodePositions.has(child)) {
        assignDepthAndPosition(
          child, 
          depth + 1, 
          childOffset,
          [...parentPath, currentUser]
        );
      }
    });
  };

  // Start positioning from root node
  nodePositions.set(rootNode, { x: 0, y: 0 });
  assignDepthAndPosition(rootNode);

  return nodePositions;
};



// Modify edge creation to handle different transition types
function transformWorkflowToGraph(workflowConfig: WorkflowConfig, payloadData?: any) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();
  let nodeCounter = 1;

  // Use payloadData transitions if available, otherwise fallback to workflowConfig transitions
  const transitions = payloadData?.transitions || workflowConfig?.transitions || [];

  // Extract unique users from transitions
  const uniqueUsers = new Set<string>();
  transitions.forEach(transition => {
    uniqueUsers.add(transition.fromUserId);
    uniqueUsers.add(transition.toUserId);
  });

  // Create node positions
  const usersArray = Array.from(uniqueUsers);
  const nodePositions = createPositioningStrategy(usersArray, transitions);

  // Create nodes
  usersArray.forEach(user => {
    const position = nodePositions.get(user) || { x: 0, y: 0 };
    const node = {
      id: `n${nodeCounter++}`,
      data: { label: user },
      position: position,
      style: {
        // border: '2px solid #1874CE',
        borderRadius: '8px',
        padding: '2px',
        backgroundColor: '#f0f8ff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '120px'
      },
      type: 'default'
    };
    nodes.push(node);
    nodeMap.set(user, node);
  });

  // Create edges based on transitions
  transitions.forEach((transition, index) => {
    const sourceNode = nodeMap.get(transition.fromUserId);
    const targetNode = nodeMap.get(transition.toUserId);

    if (sourceNode && targetNode) {
      edges.push({
        id: `e${sourceNode.id}-${targetNode.id}-${index}`,
        source: sourceNode.id,
        target: targetNode.id,
        label: transition.action,
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
        
        data: {
          uiConfig: transition.uiConfig,
          constraints: transition.constraints
        },
        style: { 
          stroke: transition.action === 'Approve' ? '#4CAF50' : 
                  transition.action === 'Reject' ? '#F44336' : 
                  transition.action === 'Submit' ? '#1874CE' :
                  transition.action === 'Draft' ? '#FFA500' : 
                  '#000000', 
          strokeWidth: 2,
          strokeDasharray: 
            transition.action === 'Draft' ? '5,5' : 
            transition.action === 'Submit' ? '5,5' :
            transition.action === 'Approve' ? '5,5' :
            transition.action === 'Reject' ? '5,5' : 'none'
        },
        animated: 
          transition.action == 'Draft' || 
          transition.action == 'Submit' ||
          transition.action == 'Approve' ||
          transition.action == 'Reject'
      });
    }
  });

  return { nodes, edges };
}



// Predefined list of states
const predefinedStates1 = [
  'Approve', 
  'Reject', 
  'Draft', 
  'Submit', 
  'In Review', 
  'In Progress', 
  'Completed', 
  'On Hold',
  'Pending Approval'
];

// Custom node component for users with handles and double-click modal
const UserNode = ({ data }: { data: { label: string } }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData('application/json', JSON.stringify({
      label: data.label,
      type: 'user'
    }));
  };

  const handleDoubleClick = () => {
    setIsModalVisible(true);
  };

 

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      style={{
        padding: '5px',
        border: '1px solid #1874CE',
        borderRadius: '4px',
        backgroundColor: '#f0f8ff',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '120px',
        position: 'relative',
        fontSize: '12px',
        wordBreak: 'break-word',
        margin: '3px 0',
      }}
    >
      {data.label}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source" 
        style={{ background: '#1874CE' }} 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target" 
        style={{ background: '#1874CE' }} 
      />
      
     

    </div>
  );
};

// State drag component with connection guidance
const StateDrag = ({ 
  state, 
  onStateSelect 
}: { 
  state: string, 
  onStateSelect: (state: string) => void 
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData('application/json', JSON.stringify({
      label: state,
      type: 'state'
    }));
  };

  return (
    <div 
      draggable 
      onClick={() => onStateSelect(state)}
      onDragStart={handleDragStart}
      style={{
        padding: '5px',
        border: '1px solid #4CAF50',
        borderRadius: '4px',
        backgroundColor: '#e6f2ff',
        cursor: 'grab',
        margin: '3px 0',
        textAlign: 'center',
        fontSize: '12px',
      }}
    >
      {state}
    </div>
  );
};

// Wrapper component to ensure ReactFlowProvider is used
const FlowChartWrapper: React.FC<{ workflowSteps: WorkflowConfig }> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowChart {...props} />
    </ReactFlowProvider>
  );
};

// Updated FlowChart component with improved drag-and-drop
const FlowChart: React.FC<{ workflowSteps: WorkflowConfig }> = ({ workflowSteps }) => {
  // Initial graph transformation
  const {predefinedUsers, triggerToExport, setTriggerToExport, setPayloadData, tranisitionList, payloadData
    ,setPredefinedUsers, setShowAlert, predefinedStates, setPredefinedStates
  } = useMyContext();
  const { nodes: initialNodes, edges: initialEdges } = transformWorkflowToGraph(workflowSteps, payloadData);
  // State management for nodes and edges
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);

  // State management for nodes and edges
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    initialNodes.map(node => ({
      ...node,
      type: 'userNode', // Ensure all nodes use the userNode type
      draggable: true,  // Make sure nodes are draggable
      selectable: true, // Ensure nodes are selectable
      connectable: true // Make nodes connectable
    }))
  );

  // Track the current connection state
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [sourceNode, setSourceNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeModalVisible, setIsNodeModalVisible] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({
    remarksRequired: false,
    attachmentRequired: false,
    dueInHours: 4
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  // React Flow instance
  const reactFlow = useReactFlow();

  // Custom node types
  const nodeTypes: NodeTypes = {
    userNode: UserNode
  };

  // Handle node deletion
  const onNodesDelete: OnNodesDelete = useCallback((deleted) => {
    setFlowEdges(
      deleted.reduce((acc, node) => 
        acc.filter((edge) => edge.source !== node.id && edge.target !== node.id), 
        flowEdges
      )
    );
  }, [flowEdges]);

  // Handle edge deletion
  const onEdgesDelete: OnEdgesDelete = useCallback((deleted) => {
    // Optional: Add any specific edge deletion logic
  }, []);

  // Handle state selection for connection
  const handleStateSelect = useCallback((state: string) => {
    setCurrentState(state);
  }, []);



  // Handle node connection
const handleNodeConnect = useCallback((sourceNodeId: string, targetNodeId: string) => {
  setShowAlert(true);
  if (currentState) {
    // Find the source and target nodes
    const sourceNode = flowNodes.find(n => n.id === sourceNodeId);
    const targetNode = flowNodes.find(n => n.id === targetNodeId);

    if (sourceNode && targetNode) {
      // Create the transition object
      const newTransition: WorkflowTransition = {
        fromUserId: sourceNode.data.label,
        action: currentState,
        toUserId: targetNode.data.label,
        uiConfig: {
          remarksRequired: false,
          attachmentRequired: false
        },
        constraints: {
          dueInHours: 4 // Default value, can be customized later
        }
      };

      const newEdge = { 
        id: `edge-${sourceNodeId}-${targetNodeId}-${currentState}`,
        source: sourceNodeId,
        target: targetNodeId,
        type: 'default',
        label: currentState,
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: currentState === 'Approve' ? '#4CAF50' : 
                 currentState === 'Reject' ? '#F44336' : '#000000'
        },
        style: { 
          strokeWidth: 2,
          stroke: currentState === 'Approve' ? '#4CAF50' : 
                  currentState === 'Reject' ? '#F44336' : '#000000',
          strokeDasharray: '5,5',
          animation: 'dashedLineAnimation 1s linear infinite'
        },
        animated: true,
        data: {
          transition: newTransition
        }
      };

      // Add the new edge to flow edges
      setFlowEdges((eds: any) => addEdge(newEdge, eds));

      // Update transitions in context
      tranisitionList.current = [...tranisitionList.current, newTransition];

      // Update payloadData with the new transition
      setPayloadData((prev) => ({
        ...prev,
        transitions: [...(prev.transitions || []), newTransition]
      }));

      // Reset connection state
      setCurrentState(null);
      setSourceNode(null);
    }
  }
}, [currentState, flowNodes, tranisitionList, setPayloadData]);

  // Add global styles for animated dashed lines
  React.useEffect(() => {
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = `
      @keyframes dashedLineAnimation {
        0% {
          stroke-dashoffset: 10;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      
      .react-flow__edge-path {
        transition: all 0.3s ease;
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, []);

  useEffect(() => {
    if (triggerToExport) {
      const exportedConfig = exportWorkflowSteps();
      setPayloadData((prev) => ({
        ...prev,
        transitions: exportedConfig.transitions
      }))
      tranisitionList.current = exportedConfig;
      // Do something with the exported config
      // Optionally reset the trigger
    }
  }, [triggerToExport]);

  // Handle dropping a new node onto the canvas
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setShowAlert(true);
    // Get the dropped item details
    const droppedItemStr = event.dataTransfer?.getData('application/json');
    
    if (droppedItemStr) {
      const { label, type } = JSON.parse(droppedItemStr);
      
      // Only create a node if it's a user
      if (type === 'user') {
        // Calculate position based on drop coordinates
        const position = reactFlow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        // Create a new node
        const newNode: any = {
          id: `node-${Date.now()}`,
          type: 'userNode',
          position,
          data: { label },
          style: {
            // border: '2px solid #1874CE', 
            borderRadius: '8px',
            padding: '2px',
            backgroundColor: '#f0f8ff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
          }
        };

        setFlowNodes((nds) => nds.concat(newNode));
      }
    }
  }, [reactFlow]);

  // Prevent default to allow dropping
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Export workflow steps method
  const exportWorkflowSteps = useCallback(() => {
    const transitions: any = flowEdges.map(edge => {
      const sourceNode = flowNodes.find(n => n.id === edge.source);
      const targetNode = flowNodes.find(n => n.id === edge.target);

      return {
        fromUserId: sourceNode?.data.label || '',
        action: typeof edge.label === 'string' ? edge.label : '',
        toUserId: targetNode?.data.label || '',
        uiConfig: edge.data?.uiConfig || {
          remarksRequired: false,
          attachmentRequired: false
        },
        constraints: edge.data?.constraints || {
          dueInHours: 0
        }
      };
    });

    const workflowConfig: WorkflowConfig = {
      workflowId: 'approval_flow_v1',
      transitions
    };

    // Update context and ref
    setPayloadData((prev) => ({
      ...prev,
      transitions: transitions
    }));
    tranisitionList.current = transitions;

    console.log("Exported Workflow Config:", workflowConfig);
    return transitions; // Return transitions directly
  }, [flowNodes, flowEdges]);

  // Add a new state to store node configurations
  const [nodeConfigurations, setNodeConfigurations] = useState<{
    [nodeName: string]: {
      remarksRequired: boolean;
      attachmentRequired: boolean;
      dueInHours: number;
    }
  }>({});

  const handleCloseNodeModal = useCallback(() => {
    setIsNodeModalVisible(false);
    setSelectedNode(null);
  }, []);


  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeLabel: any = node.data.label;
    
    // Find related edges where this node is the target
    const relatedIncomingEdges = flowEdges.filter(
      edge => {
        const targetNode = flowNodes.find(n => n.id === edge.target);
        return targetNode?.data.label === nodeLabel;
      }
    );

    // Find related edges where this node is the source
    const relatedOutgoingEdges = flowEdges.filter(
      edge => {
        const sourceNode = flowNodes.find(n => n.id === edge.source);
        return sourceNode?.data.label === nodeLabel;
      }
    );

    // Find related transitions from payloadData
    const relatedTransitions = payloadData?.transitions?.filter(
      transition => 
        transition.fromUserId === nodeLabel || 
        transition.toUserId === nodeLabel
    ) || [];

    // Enhanced selection logic
    const selectMostRelevantConfiguration = () => {
      // Priority 1: Exact match for incoming edges
      for (const edge of relatedIncomingEdges) {
        const sourceNode = flowNodes.find(n => n.id === edge.source);
        const matchingTransition = relatedTransitions.find(
          transition => 
            transition.fromUserId === sourceNode?.data.label &&
            transition.toUserId === nodeLabel &&
            transition.action === edge.label
        );

        if (matchingTransition) {
          return {
            edge,
            transition: matchingTransition,
            type: 'incoming'
          };
        }
      }

      // Priority 2: Exact match for outgoing edges
      for (const edge of relatedOutgoingEdges) {
        const targetNode = flowNodes.find(n => n.id === edge.target);
        const matchingTransition = relatedTransitions.find(
          transition => 
            transition.fromUserId === nodeLabel &&
            transition.toUserId === targetNode?.data.label &&
            transition.action === edge.label
        );

        if (matchingTransition) {
          return {
            edge,
            transition: matchingTransition,
            type: 'outgoing'
          };
        }
      }

      // Fallback: Use first available transition or edge
      return relatedTransitions.length > 0
        ? {
            transition: relatedTransitions[0],
            edge: relatedIncomingEdges[0] || relatedOutgoingEdges[0],
            type: relatedTransitions[0].toUserId === nodeLabel ? 'incoming' : 'outgoing'
          }
        : null;
    };

    const selectedConfiguration : any = selectMostRelevantConfiguration();

    // Prepare node configuration
    const nodeConfig = selectedConfiguration 
      ? {
          remarksRequired: 
            selectedConfiguration.transition.uiConfig.remarksRequired ?? 
            selectedConfiguration.edge?.data?.uiConfig?.remarksRequired ?? 
            false,
          attachmentRequired: 
            selectedConfiguration.transition.uiConfig.attachmentRequired ?? 
            selectedConfiguration.edge?.data?.uiConfig?.attachmentRequired ?? 
            false,
          dueInHours: 
            selectedConfiguration.transition.constraints.dueInHours ?? 
            selectedConfiguration.edge?.data?.constraints?.dueInHours ?? 
            4,
          source: 
            selectedConfiguration.type === 'incoming' 
              ? selectedConfiguration.transition.fromUserId 
              : nodeLabel,
          target: 
            selectedConfiguration.type === 'incoming' 
              ? nodeLabel 
              : selectedConfiguration.transition.toUserId,
          action: selectedConfiguration.transition.action
        }
      : {
          remarksRequired: false,
          attachmentRequired: false,
          dueInHours: 4,
          source: '',
          target: '',
          action: ''
        };

    // Set the current node configuration
    setNodeConfig(nodeConfig);
    
    setSelectedNode(node);
    setIsNodeModalVisible(true);
  }, [flowEdges, flowNodes, payloadData]);

  const handleNodeConfigSave = useCallback(() => {
    if (selectedNode) {
      const nodeLabel: any = selectedNode.data.label;

      // Update transitions in payloadData
      const updatedTransitions = payloadData.transitions.map(transition => {
        // Match transitions where the node is either source or target
        if (
          transition.fromUserId === nodeLabel || 
          transition.toUserId === nodeLabel
        ) {
          return {
            ...transition,
            uiConfig: {
              remarksRequired: nodeConfig.remarksRequired,
              attachmentRequired: nodeConfig.attachmentRequired
            },
            constraints: {
              dueInHours: nodeConfig.dueInHours
            }
          };
        }
        return transition;
      });

      // Update payload data
      setPayloadData(prev => ({
        ...prev,
        transitions: updatedTransitions
      }));

      // Update flow edges for both incoming and outgoing edges
      setFlowEdges(edges => 
        edges.map(edge => {
          const sourceNode = flowNodes.find(n => n.id === edge.source);
          const targetNode = flowNodes.find(n => n.id === edge.target);
          
          // Update edges where the node is either source or target
          if (
            sourceNode?.data.label === nodeLabel || 
            targetNode?.data.label === nodeLabel
          ) {
            return {
              ...edge,
              data: {
                ...edge.data,
                uiConfig: {
                  remarksRequired: nodeConfig.remarksRequired,
                  attachmentRequired: nodeConfig.attachmentRequired
                },
                constraints: {
                  dueInHours: nodeConfig.dueInHours
                }
              }
            };
          }
          return edge;
        })
      );

      // Update transitions list
      tranisitionList.current = updatedTransitions;
      
      // Close the modal
      handleCloseNodeModal();
    }
  }, [
    selectedNode, 
    nodeConfig, 
    flowNodes, 
    flowEdges, 
    payloadData, 
    handleCloseNodeModal, 
    setPayloadData
  ]);

  const handleSearch = async () => {

    const cookies = parseCookies();
    const site = cookies?.site;
    const request = {
        site: site,
        userGroup: searchTerm
    }
    try {
        let response = await retrieveAllUserGroup(request);


        // Update the filtered data state
        setPredefinedUsers(response);

    }
    catch (e) {
        console.log("Error in retrieving all configuration", e);
    }
}  

const handleStateSearch = async () => {

    const cookies = parseCookies();
    const site = cookies?.site;
    const request = {
        site: site,
        name: stateSearchTerm
    }
    try {
        let response = await retrieveAllWorkFlowStatesMaster(request);


        // Update the filtered data state
        setPredefinedStates(response);

    }
    catch (e) {
        console.log("Error in retrieving all workflow states", e);
    }
}

// Add state for modal visibility and selected transitions
const [isTransitionModalVisible, setIsTransitionModalVisible] = useState(false);

// Function to handle displaying transitions in table
const handleDisplayinTable = useCallback(() => {
  setIsTransitionModalVisible(true);
}, []);

// Close modal function
const handleCloseTransitionModal = useCallback(() => {
  setIsTransitionModalVisible(false);
}, []);

  return (
    <div  style={{ height: 'calc(100vh - 150px)', width: '100%', display: 'flex',   }}>
      {/* Sidebar for Draggable Items */}
      <div 
        style={{ 
          width: '200px', 
          padding: '10px', 
          backgroundColor: 'white', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Connection Guidance */}
        {currentState && (
          <div 
            style={{
              backgroundColor: '#e6f2ff',
              border: '1px solid #4CAF50',
              padding: '10px',
              marginBottom: '10px',
              textAlign: 'center',
              borderRadius: '4px'
            }}
          >
            Selected State: {currentState}
            <br />
            Click on source node, then target node to connect
          </div>
        )}

        

        {/* Users Section */}
       <div>
          <h3 style={{ 
            marginBottom: '5px',  // Reduced margin
            fontSize: '14px',     // Optional: slightly smaller font
            paddingBottom: '3px', // Optional: slight padding
            borderBottom: '1px solid #e0e0e0' // Optional: subtle separator
          }}>
            Drag Users
          </h3>
          <div style={{ 
            maxHeight: 'calc(100vh - 450px)', 
            overflowY: 'auto',
            marginTop: '3px'  // Reduced margin
          }}>
             <Input.Search
                  style={{ marginBottom: "1px" }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                  onSearch={handleSearch}
              />
            { predefinedUsers && predefinedUsers.map((user) => (
              <UserNode key={user?.userGroup} data={{ label: user?.userGroup }} />
            ))}
          </div>
        </div>

        {/* States Section */}
        <div style={{ 
          marginTop: '10px',  // Kept for separation between Users and States sections
        }}>
          <h3 style={{ 
            marginBottom: '5px',  // Reduced margin
            fontSize: '14px',     // Optional: slightly smaller font
            paddingBottom: '3px', // Optional: slight padding
            borderBottom: '1px solid #e0e0e0' // Optional: subtle separator
          }}>
            Select States
          </h3>
          <div style={{ 
            maxHeight: 'calc(100vh - 495px )',  
            overflowY: 'auto',
            marginTop: '3px'  // Reduced margin
          }}>
            <Input.Search
                  style={{ marginBottom: "1px" }}
                  onChange={(e) => setStateSearchTerm(e.target.value)}
                  value={stateSearchTerm}
                  onSearch={handleStateSearch}
              />
          { predefinedStates && predefinedStates.map((state) => (
            <StateDrag 
              key={state?.name} 
              state={state?.name} 
              onStateSelect={handleStateSelect} 
            />
          ))}
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow 
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        onNodeClick={(event, node) => {
          if (currentState) {
            if (!sourceNode) {
              // Set source node
              setSourceNode(node.id);
            } else {
              // Connect nodes
              handleNodeConnect(sourceNode, node.id);
            }
          }
        }}
        onNodeDoubleClick={handleNodeDoubleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineType={ConnectionLineType.Straight}
        connectionLineStyle={{
          stroke: '#4CAF50',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          animation: 'dashedLineAnimation 1s linear infinite'
        }}
        defaultEdgeOptions={{
          markerEnd: { 
            type: MarkerType.ArrowClosed 
          },
          style: {
            strokeWidth: 2,
            strokeDasharray: '5,5',
            animation: 'dashedLineAnimation 1s linear infinite'
          },
          animated: true
        }}
        fitView
        minZoom={0.5}
        
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>

     
           
            <button 
              onClick={handleDisplayinTable}
              style={{
                position: 'absolute',
                top: '0px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5em',
                cursor: 'pointer',
                color: '#666'
              }}
            >
             <EyeTwoTone twoToneColor="#124561"/>
            </button>
          
     
      {/* Node Details Modal */}
      {isNodeModalVisible && selectedNode && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            backgroundColor: 'white',
            border: '2px solid #1874CE',
            borderRadius: '12px',
            width: '350px',
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1874CE',
              fontSize: '1.2em'
            }}>
              Node Configuration
            </h2>
            <button 
              onClick={handleCloseNodeModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5em',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ 
            padding: '15px',
            flexGrow: 1,
            overflowY: 'auto'
          }}>
            {/* Configuration Options */}
            <div style={{ 
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '15px'
            }}>
              {/* Remarks Required Checkbox */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px' 
              }}>
                <input 
                  type="checkbox" 
                  id="remarksRequired"
                  checked={nodeConfig.remarksRequired}
                  onChange={(e) => setNodeConfig(prev => ({
                    ...prev, 
                    remarksRequired: e.target.checked
                  }))}
                  style={{ marginRight: '10px' }}
                />
                <label htmlFor="remarksRequired">
                  Remarks Required
                </label>
              </div>

              {/* Attachment Required Checkbox */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px' 
              }}>
                <input 
                  type="checkbox" 
                  id="attachmentRequired"
                  checked={nodeConfig.attachmentRequired}
                  onChange={(e) => setNodeConfig(prev => ({
                    ...prev, 
                    attachmentRequired: e.target.checked
                  }))}
                  style={{ marginRight: '10px' }}
                />
                <label htmlFor="attachmentRequired">
                  Attachment Required
                </label>
              </div>

              {/* Due Hours Input */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <label 
                  htmlFor="dueInHours" 
                  style={{ marginRight: '10px' }}
                >
                  Due in Hours:
                </label>
                <input 
                  type="number" 
                  id="dueInHours"
                  value={nodeConfig.dueInHours}
                  onChange={(e) => setNodeConfig(prev => ({
                    ...prev, 
                    dueInHours: Number(e.target.value)
                  }))}
                  min="0"
                  style={{ 
                    width: '60px', 
                    padding: '5px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer with OK button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '6px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f4f4f4'
          }}>
            <button 
              onClick={handleNodeConfigSave}
              style={{
                backgroundColor: '#1874CE',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Transition Modal */}
      {isTransitionModalVisible && (
        <Modal
          title="Workflow Transitions"
          open={isTransitionModalVisible}
          onCancel={handleCloseTransitionModal}
          footer={null}
          width="80%"
        >
          <Table 
            dataSource={payloadData?.transitions || []} 
            columns={[
              {
                title: 'From User',
                dataIndex: 'fromUserId',
                key: 'fromUserId',
                align: 'center',
              },
              {
                title: 'To User',
                dataIndex: 'toUserId',
                key: 'toUserId',
                align: 'center',
              },
              {
                title: 'Action',
                dataIndex: 'action',
                key: 'action',
                align: 'center',
              },
              {
                title: 'Remarks Required',
                dataIndex: ['uiConfig', 'remarksRequired'],
                key: 'remarksRequired',
                align: 'center',
                render: (text) => text 
                  ? <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '18px' }} /> 
                  : <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: '18px' }}/>
              },
              {
                title: 'Attachment Required',
                dataIndex: ['uiConfig', 'attachmentRequired'],
                key: 'attachmentRequired',
                align: 'center',
                render: (text) => text 
                  ? <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '18px' }}/> 
                  : <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: '18px' }}/>
              },
              {
                title: 'Due Hours',
                dataIndex: ['constraints', 'dueInHours'],
                key: 'dueInHours',
                align: 'center',
              },
            ]}
            rowKey={(record: any) => `${record.fromUserId}-${record.toUserId}-${record.action}`}
            pagination={false}
            scroll={{ y: 300 }}
            bordered
            size="small"
          />
        </Modal>
      )}
    </div>
  );
};

export default FlowChartWrapper;