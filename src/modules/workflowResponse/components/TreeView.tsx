import React, { useState } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { JsonView } from 'react-json-view-lite';

interface TreeViewProps {
  data: any;
}

const convertToTreeData = (obj: any, key = '0'): DataNode[] => {
  if (typeof obj !== 'object' || obj === null) {
    return [{
      key,
      title: <JsonView data={obj} />,
      isLeaf: true,
    }];
  }

  return Object.entries(obj).map(([k, v], index) => ({
    key: `${key}-${index}`,
    title: k,
    children: convertToTreeData(v, `${key}-${index}`),
  }));
};

export const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const treeData = convertToTreeData(data);

  return (
    <Tree
      defaultExpandAll
      treeData={treeData}
    />
  );
};