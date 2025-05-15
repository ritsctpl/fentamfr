import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Edge, Node } from '@xyflow/react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onScript?: (edge: Edge) => void;
  onSwap?: (nodeId: string) => void;
  type: 'edge' | 'node';
  element?: Edge | Node;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  onDelete, 
  onScript,
  onSwap,
  type,
  element 
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'delete',
      label: `Delete ${type}`,
      onClick: () => {
        onDelete();
        onClose();
      },
    },
  ];

  if (type === 'node' && onSwap && element) {
    items.push({
      key: 'swap',
      label: 'Swap Position',
      onClick: () => {
        onSwap(element.id);
        onClose();
      },
    });
  }

  if (type === 'edge' && onScript && element) {
    items.push({
      key: 'script',
      label: 'Edit Script',
      onClick: () => {
        onScript(element as Edge);
        onClose();
      },
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '4px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Menu items={items} />
    </div>
  );
};

export default ContextMenu; 