import React, { useState } from 'react';
import { Card, Typography, Tree, Tooltip, Tabs } from 'antd';
import { BranchesOutlined, BuildOutlined, BgColorsOutlined } from '@ant-design/icons';
import StyleEditor from './StyleEditor';

const { Text } = Typography;
const { DirectoryTree } = Tree;
const { TabPane } = Tabs;

interface Row {
  id: number;
  section: string;
  type: string;
  heading: string;
  component?: any;
}

interface TemplateTreeViewProps {
  rows: Row[];
  previewMode: boolean;
  onApplyStyles?: (styles: any) => void;
}

const generateTreeData = (rows: Row[]) => {
  if (!rows.length) return [];

  return [
    {
      title: 'Template Structure',
      key: 'template',
      icon: <BranchesOutlined />,
      children: rows.map((row, idx) => {
        const type = row.type || 'Unknown';
        
        return {
          title: (
            <Tooltip title={row.section || row.heading}>
              {row.heading || row.section}
              <Text type="secondary" style={{ marginLeft: 6, fontSize: '12px' }}>
                ({type})
              </Text>
            </Tooltip>
          ),
          key: `${type.toLowerCase()}-${row.id}`,
          isLeaf: true,
          icon: type === 'Section' ? <BranchesOutlined /> : 
                type === 'Group' ? <BgColorsOutlined /> : 
                <BuildOutlined />
        };
      }),
    },
  ];
};

const TemplateTreeView: React.FC<TemplateTreeViewProps> = ({ rows, previewMode, onApplyStyles }) => {
  const treeData = generateTreeData(rows);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['template']);
  const [activeTab, setActiveTab] = useState<string>('structure');
  const onExpand = (expandedKeysValue: string[]) => setExpandedKeys(expandedKeysValue);
  const isEmpty = !rows.length;

  const handleApplyStyles = (styles: any) => {
    console.log('Applied template styles:', styles);
    // Pass the styles to the parent component through the callback
    if (onApplyStyles) {
      onApplyStyles(styles);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        defaultActiveKey="structure"
      >
        <TabPane
          tab={
            <span>
              <BranchesOutlined style={{ fontSize: 16, marginRight: 4, color: '#1976d2' }} />
              Template Structure
            </span>
          }
          key="structure"
        >
          <Card style={{ marginBottom: 16, border: 'none' }}>
            {isEmpty ? (
              <Text type="secondary">Add template elements to see the structure.</Text>
            ) : (
              <DirectoryTree
                showLine
                defaultExpandAll
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                treeData={treeData}
              />
            )}
          </Card>
        </TabPane>
        {previewMode && (
          <TabPane
            tab={
              <span>
                <BgColorsOutlined style={{ fontSize: 16, marginRight: 4, color: '#1976d2' }} />
                Style
              </span>
            }
            key="style"
          >
            <StyleEditor onApplyStyles={handleApplyStyles} />
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default TemplateTreeView; 