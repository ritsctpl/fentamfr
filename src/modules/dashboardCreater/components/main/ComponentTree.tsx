import React from 'react';
import { Tree, Button, Tooltip } from 'antd';
import { DeleteOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { DashboardWidget } from '../../types';
import type { DataNode } from 'antd/es/tree';

interface ComponentTreeProps {
    widgets: Record<string, DashboardWidget>;
    selectedWidget: string | null;
    onSelect: (widgetId: string) => void;
    onDelete: (widgetId: string) => void;
    onDuplicate: (widgetId: string) => void;
    onToggleVisibility: (widgetId: string) => void;
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
    widgets,
    selectedWidget,
    onSelect,
    onDelete,
    onDuplicate,
    onToggleVisibility
}) => {
    const buildTreeData = (parentId: string | null = null): DataNode[] => {
        return Object.values(widgets)
            .filter(widget => widget.parentId === parentId)
            .map(widget => ({
                key: widget.id,
                title: (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                        <span>{`${widget.type} ${widget.props?.text ? `(${widget.props.text})` : ''}`}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Tooltip title="Toggle Visibility">
                                <Button 
                                    type="text" 
                                    size="small"
                                    icon={widget.props?.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleVisibility(widget.id);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="Duplicate">
                                <Button 
                                    type="text" 
                                    size="small"
                                    icon={<CopyOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicate(widget.id);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="Delete">
                                <Button 
                                    type="text" 
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(widget.id);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                ),
                children: buildTreeData(widget.id)
            }));
    };

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Component Tree
            </div>
            <Tree
                treeData={buildTreeData()}
                selectedKeys={selectedWidget ? [selectedWidget] : []}
                onSelect={(selectedKeys) => {
                    if (selectedKeys[0]) {
                        onSelect(selectedKeys[0].toString());
                    }
                }}
                draggable
                blockNode
            />
        </div>
    );
}; 