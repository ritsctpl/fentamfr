import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tree } from "antd";
import { Key } from "react";
import { LuListTree } from "react-icons/lu";
import { PlusSquareOutlined } from "@ant-design/icons";

// Interfaces for data types
interface Component {
  _id: string;
  componentLabel: string;
  dataType: string;
  unit?: string;
  defaultValue?: string;
  required?: boolean;
  validation?: string;
  tableConfig?: any;
  site?: string;
  active?: number;
  userId?: string;
  createdDateTime?: string;
  _class?: string;
}

interface Section {
  _id: string;
  sectionLabel: string;
  components: Component[];
}

interface Group {
  _id: string;
  groupLabel: string;
  sectionIds: Section[];
}

type NodeType = 'root' | 'group' | 'section' | 'component';

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  nodeType: NodeType;
  originalId: string;
}

interface TemplateStructureTreeProps {
  selectedGroups: (Group | Section | Component)[];
}

export const TemplateStructureTree: React.FC<TemplateStructureTreeProps> = ({
  selectedGroups,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  // Memoize the component title rendering
  const renderComponentTitle = useCallback((component: Component) => (
    <span>
      {component.componentLabel}
      <span style={{ color: '#888', marginLeft: '8px', fontSize: '12px' }}>
        ({component.dataType}{component.unit ? ` - ${component.unit}` : ''})
      </span>
    </span>
  ), []);

  // Generate unique key for each node
  const getNodeKey = useCallback((type: NodeType, id: string, context: string = '') => {
    const sanitizedId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedContext = context.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${type}-${sanitizedId}${sanitizedContext ? `-${sanitizedContext}` : ''}`;
  }, []);

  // Memoize the tree data generation
  const treeData = useMemo(() => {
    const processedNodes = new Map<string, TreeNode>();

    const getProcessedNode = (key: string): TreeNode | undefined => {
      return processedNodes.get(key);
    };

    const setProcessedNode = (key: string, node: TreeNode) => {
      processedNodes.set(key, node);
    };

    const createComponentNode = (
      component: Component,
      context: string = ''
    ): TreeNode => {
      const nodeKey = getNodeKey('component', component._id, context);
      const existingNode = getProcessedNode(nodeKey);
      
      if (existingNode) {
        return existingNode;
      }

      const newNode: TreeNode = {
        key: nodeKey,
        title: renderComponentTitle(component),
        nodeType: 'component',
        originalId: component._id
      };

      setProcessedNode(nodeKey, newNode);
      return newNode;
    };

    const createSectionNode = (
      section: Section,
      context: string = ''
    ): TreeNode => {
      const nodeKey = getNodeKey('section', section._id, context);
      const existingNode = getProcessedNode(nodeKey);
      
      if (existingNode) {
        return existingNode;
      }

      const children = section.components?.map(comp => 
        createComponentNode(comp, `${context}${section._id}`)
      ) || [];

      const newNode: TreeNode = {
        key: nodeKey,
        title: section.sectionLabel,
        children,
        nodeType: 'section',
        originalId: section._id
      };

      setProcessedNode(nodeKey, newNode);
      return newNode;
    };

    const createGroupNode = (
      group: Group,
      context: string = ''
    ): TreeNode => {
      const nodeKey = getNodeKey('group', group._id, context);
      const existingNode = getProcessedNode(nodeKey);
      
      if (existingNode) {
        return existingNode;
      }

      const children = group.sectionIds?.map(section => 
        createSectionNode(section, group._id)
      ) || [];

      const newNode: TreeNode = {
        key: nodeKey,
        title: group.groupLabel,
        children,
        nodeType: 'group',
        originalId: group._id
      };

      setProcessedNode(nodeKey, newNode);
      return newNode;
    };

    const rootNode: TreeNode = {
      key: "root",
      title: "Template Structure",
      children: [],
      nodeType: 'root',
      originalId: 'root'
    };

    if (!Array.isArray(selectedGroups) || selectedGroups.length === 0) {
      return [rootNode];
    }

    // Process items in the order they appear in selectedGroups
    const children = selectedGroups.map((item: Group | Section | Component): TreeNode => {
      if ('groupLabel' in item) {
        return createGroupNode(item);
      } else if ('sectionLabel' in item) {
        return createSectionNode(item);
      } else if ('componentLabel' in item) {
        return createComponentNode(item);
      }
      throw new Error('Unknown item type');
    });

    // Filter out any undefined or duplicate nodes
    rootNode.children = children.filter((node, index, self) => 
      node && self.findIndex(n => n.key === node.key) === index
    );

    return [rootNode];
  }, [selectedGroups, renderComponentTitle, getNodeKey]);

  // Get all keys for expansion
  const getAllKeys = useCallback((data: TreeNode[]): Key[] => {
    const keys = new Set<Key>();

    const traverse = (node: TreeNode) => {
      keys.add(node.key);
      node.children?.forEach(traverse);
    };

    data.forEach(traverse);
    return Array.from(keys);
  }, []);

  // Update expanded keys when selectedGroups changes
  useEffect(() => {
    if (Array.isArray(selectedGroups) && selectedGroups.length > 0) {
      const allKeys = getAllKeys(treeData);
      setExpandedKeys(allKeys);
    } else {
      setExpandedKeys([]);
    }
  }, [selectedGroups, getAllKeys, treeData]);

  // Handle expand/collapse all
  const handleExpandAll = useCallback(() => {
    setExpandedKeys(prev => 
      prev.length > 0 ? [] : getAllKeys(treeData)
    );
  }, [treeData, getAllKeys]);

  return (
    <div>
      <div
        style={{
          fontWeight: 500,
          marginBottom: "16px",
          display: "flex",
          justifyContent: "flex-end",
          // alignItems: "center",
        }}
      >
        {/* <span>Template Structure</span> */}
        {selectedGroups.length > 0 && (
          <LuListTree
            onClick={handleExpandAll}
            style={{
              cursor: "pointer",
              color: "var(--button-color)",
              fontSize: "16px",
            }}
            title={expandedKeys.length > 0 ? "Collapse All" : "Expand All"}
          />
        )}
      </div>

      {selectedGroups.length > 0 && (
        <Tree
          showLine
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          treeData={treeData}
          style={{
            padding: "12px",
            maxHeight: "calc(100vh - 210px)",
            overflowY: "auto",
          }}
          switcherIcon={<PlusSquareOutlined />}
        />
      )}
    </div>
  );
};
