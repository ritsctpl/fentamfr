import React, { useState } from 'react';
import { Card, Typography, Tree, Tooltip } from 'antd';
import { 
  BranchesOutlined, 
  FormOutlined, 
  AppstoreOutlined, 
  FileTextOutlined,
  DownOutlined,
  LayoutOutlined,
  FileTextTwoTone,
  BuildOutlined,
  EditOutlined,
  FontSizeOutlined,
  CheckSquareOutlined,
  PictureOutlined,
  TableOutlined,
  SendOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

interface TemplateTreeViewProps {
  templateData: any;
}

const emptyTemplate = {
  template: {}
};

// Get appropriate icon for component type
const getComponentIcon = (type: string) => {
  // Check if type is undefined or null
  if (!type) return <BuildOutlined />;
  
  switch (type.toLowerCase()) {
    case 'text':
      return <FileTextTwoTone />;
    case 'input':
      return <EditOutlined />;
    case 'textarea':
      return <FontSizeOutlined />;
    case 'checkbox':
      return <CheckSquareOutlined />;
    case 'image':
      return <PictureOutlined />;
    case 'button':
      return <SendOutlined />;
    case 'table':
      return <TableOutlined />;
    default:
      return <BuildOutlined />;
  }
};

// Process individual section
const processSection = (section: any, key: string) => {
  const isGroup = section.type === 'SectionGroup';
  const isTextSection = section.type === 'Text Section';
  
  const nodeData = {
    title: (
      <Tooltip title={section.id}>
        {section.heading || section.section || 'Unnamed Section'}
      </Tooltip>
    ),
    key,
    icon: isGroup ? <AppstoreOutlined /> : isTextSection ? <FileTextTwoTone /> : <FileTextOutlined />,
    children: []
  };

  // Process components if present
  if (section.component) {
    nodeData.children = Object.entries(section.component).map(([compKey, comp]: [string, any], index: number) => {
      // Ensure comp is an object
      if (!comp || typeof comp !== 'object') {
        comp = { type: 'unknown' };
      }
      
      // Safely extract content
      const content = comp.content || '';
      
      return {
        title: (
          <span>
            {comp.label || comp.type || `Component ${index + 1}`}
            {content && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {typeof content === 'string' && content.length > 15 
                  ? `${content.substring(0, 15)}...` 
                  : content}
              </Text>
            )}
          </span>
        ),
        key: `${key}-comp-${index}`,
        icon: getComponentIcon(comp.type),
        isLeaf: true,
      };
    });
  }

  // Process content for text sections
  if (section.content !== undefined) {
    const content = section.content || '';
    nodeData.children.push({
      title: (
        <span>
          Text Content
          <Text type="secondary" style={{ marginLeft: 8 }}>
            {content.length > 20 
              ? `${content.substring(0, 20)}...` 
              : content}
          </Text>
        </span>
      ),
      key: `${key}-content`,
      icon: <FileTextTwoTone />,
      isLeaf: true,
    });
  }

  // Process nested sections if this is a group
  if (isGroup && section.sections) {
    const nestedSections = section.sections.map((nestedSection: any, index: number) => {
      return processSection(nestedSection, `${key}-nested-${index}`);
    });
    nodeData.children = [...nodeData.children, ...nestedSections];
  }

  return nodeData;
};

// Generate tree data from template
const generateTreeData = (template: any) => {
  if (!template || Object.keys(template).length === 0) {
    return [];
  }

  // Root node
  const rootNode = {
    title: 'Template Structure',
    key: 'template',
    icon: <FormOutlined />,
    children: []
  };

  // Process all keys in the template
  Object.entries(template).forEach(([key, section]: [string, any]) => {
    // Skip non-object values
    if (typeof section !== 'object' || section === null) return;
    
    // Create node based on the section type
    const nodeKey = `section-${key}`;
    rootNode.children.push(processSection(section, nodeKey));
  });

  return [rootNode];
};

const TemplateTreeView: React.FC<TemplateTreeViewProps> = ({ templateData }) => {
  const displayData = templateData && Object.keys(templateData).length > 0 
    ? templateData 
    : emptyTemplate;

  const isEmpty = displayData === emptyTemplate || 
    (displayData.template && Object.keys(displayData.template).length === 0);
    
  const treeData = generateTreeData(displayData.template);
  
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['template']);

  const onExpand = (expandedKeysValue: string[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <BranchesOutlined style={{ fontSize: 16, marginRight: 8, color: '#1976d2' }} />
        <Title level={5} style={{ margin: 0 }}>Template Structure</Title>
      </div>
      
      <Card
        style={{ 
          marginBottom: 16,
          border:'none'
          // boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {isEmpty ? (
          <Text type="secondary">Add template elements to see the structure.</Text>
        ) : (
          <DirectoryTree
            showIcon
            showLine
            defaultExpandAll
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            switcherIcon={<DownOutlined />}
            treeData={treeData}
          />
        )}
      </Card>
    </div>
  );
};

export default TemplateTreeView; 