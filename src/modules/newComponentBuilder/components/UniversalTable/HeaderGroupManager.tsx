import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Space, Radio, Card, List, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { HeaderStructure, Column } from './types';

const { Text } = Typography;

interface HeaderGroupManagerProps {
    headerStructure: HeaderStructure[];
    columns: Column[];
    onUpdate: (newStructure: HeaderStructure[]) => void;
    editingHeaderId?: string | null;
}

const GroupCard = styled(Card)`
    margin-bottom: 16px;
    .ant-card-body {
        padding: 12px;
    }
`;

const ColumnList = styled(List)`
    margin-top: 8px;
    .ant-list-item {
        padding: 4px 0;
    }
`;

const IndentedRadio = styled(Radio)<{ $level: number }>`
    padding-left: ${props => props.$level * 24}px !important;
`;

const generateUniqueId = (label?: string) => {
    if (!label) return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert label to snake_case
    const baseId = label
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_')    // Replace spaces with underscores
        .replace(/_+/g, '_');    // Replace multiple underscores with single one
    
    // Add a unique suffix to ensure uniqueness
    return `${baseId}_${Date.now().toString().slice(-4)}`;
};

const HeaderGroupManager: React.FC<HeaderGroupManagerProps> = ({
    headerStructure,
    columns,
    onUpdate,
    editingHeaderId
}) => {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [editingLabels, setEditingLabels] = useState<{ [key: string]: string }>({});

    // Memoize the startEditing function to avoid dependency issues
    const startEditing = useCallback((groupId: string, currentLabel: string) => {
        setEditingLabels(prev => ({
            ...prev,
            [groupId]: currentLabel
        }));
    }, []);

    // Helper function for finding a group by ID
    const findGroup = (groups: HeaderStructure[], id: string): HeaderStructure | null => {
        for (const group of groups) {
            if (group.id === id) return group;
            if (group.children) {
                const found = findGroup(group.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Focus on the editing header when it changes
    useEffect(() => {
        if (editingHeaderId) {
            setSelectedGroup(editingHeaderId);
            
            // Find the header to get its current label
            const header = findGroup(headerStructure, editingHeaderId);
            if (header) {
                startEditing(editingHeaderId, header.label);
            }
        }
    }, [editingHeaderId, headerStructure, startEditing]);

    // Flatten header structure for radio options
    const getAllGroups = (groups: HeaderStructure[], level = 0): { id: string; label: string; level: number }[] => {
        let result: { id: string; label: string; level: number }[] = [];
        groups.forEach(group => {
            result.push({ id: group.id, label: group.label, level });
            if (group.children && group.children.length > 0) {
                result = result.concat(getAllGroups(group.children, level + 1));
            }
        });
        return result;
    };

    const addGroup = (parentId?: string) => {
        const newGroupLabel = `New Group ${headerStructure.length + 1}`;
        const newGroup: HeaderStructure = {
            id: generateUniqueId(newGroupLabel),
            label: newGroupLabel,
            children: []
        };

        if (parentId) {
            // Add as child to existing group
            const updatedStructure = [...headerStructure];
            const parent = findGroup(updatedStructure, parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(newGroup);
                onUpdate(updatedStructure);
            }
        } else {
            // Add as top-level group
            onUpdate([...headerStructure, newGroup]);
        }
    };

    const deleteGroup = (groupId: string) => {
        const deleteFromArray = (groups: HeaderStructure[]): HeaderStructure[] => {
            return groups.filter(group => {
                if (group.id === groupId) return false;
                if (group.children) {
                    group.children = deleteFromArray(group.children);
                }
                return true;
            });
        };

        const updatedStructure = deleteFromArray([...headerStructure]);
        onUpdate(updatedStructure);
        // Clean up editing state
        const newEditingLabels = { ...editingLabels };
        delete newEditingLabels[groupId];
        setEditingLabels(newEditingLabels);
    };

    const handleInputChange = (groupId: string, value: string) => {
        setEditingLabels(prev => ({
            ...prev,
            [groupId]: value
        }));
    };

    const handleInputBlur = (groupId: string) => {
        const newLabel = editingLabels[groupId];
        if (newLabel && newLabel.trim()) {
            // Store column assignments before updating IDs
            const columnsForThisGroup = findColumnsForGroup(headerStructure, groupId);
            
            const updateInArray = (groups: HeaderStructure[]): HeaderStructure[] => {
                return groups.map(group => {
                    if (group.id === groupId) {
                        // Generate a new ID based on the new label
                        const newId = generateUniqueId(newLabel.trim());
                        
                        return { 
                            ...group, 
                            id: newId,
                            label: newLabel.trim(),
                            // Keep the same column assignments
                            columns: group.columns
                        };
                    }
                    if (group.children) {
                        return { ...group, children: updateInArray(group.children) };
                    }
                    return group;
                });
            };

            const updatedStructure = updateInArray([...headerStructure]);
            onUpdate(updatedStructure);
        }
        
        // Clean up editing state
        const newEditingLabels = { ...editingLabels };
        delete newEditingLabels[groupId];
        setEditingLabels(newEditingLabels);
    };
    
    // Helper function to find all columns assigned to a group
    const findColumnsForGroup = (groups: HeaderStructure[], groupId: string): string[] => {
        for (const group of groups) {
            if (group.id === groupId) {
                return group.columns || [];
            }
            if (group.children) {
                const found = findColumnsForGroup(group.children, groupId);
                if (found.length > 0) return found;
            }
        }
        return [];
    };

    const assignColumnToGroup = (columnId: string, groupId: string | null) => {
        // Remove column from any existing group
        const removeFromGroups = (groups: HeaderStructure[]): HeaderStructure[] => {
            return groups.map(group => {
                if (group.columns) {
                    group.columns = group.columns.filter(id => id !== columnId);
                }
                if (group.children) {
                    group.children = removeFromGroups(group.children);
                }
                return group;
            });
        };

        let updatedStructure = removeFromGroups([...headerStructure]);

        if (groupId) {
            // Add column to selected group
            const addToGroup = (groups: HeaderStructure[]): HeaderStructure[] => {
                return groups.map(group => {
                    if (group.id === groupId) {
                        return {
                            ...group,
                            columns: [...(group.columns || []), columnId]
                        };
                    }
                    if (group.children) {
                        return { ...group, children: addToGroup(group.children) };
                    }
                    return group;
                });
            };

            updatedStructure = addToGroup(updatedStructure);
        }

        onUpdate(updatedStructure);
    };

    const renderGroup = (group: HeaderStructure, level = 0) => {
        const assignedColumns = columns.filter(col => 
            group.columns?.includes(col.field_id)
        );

        const isEditing = group.id in editingLabels;

        return (
            <GroupCard key={group.id}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Input
                            value={isEditing ? editingLabels[group.id] : group.label}
                            onChange={e => handleInputChange(group.id, e.target.value)}
                            onFocus={() => !isEditing && startEditing(group.id, group.label)}
                            onBlur={() => handleInputBlur(group.id)}
                            style={{ width: 200 }}
                        />
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => addGroup(group.id)}
                        >
                            Add Subgroup
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteGroup(group.id)}
                        />
                    </Space>

                    {assignedColumns.length > 0 && (
                        <ColumnList
                            size="small"
                            dataSource={assignedColumns}
                            renderItem={(col: Column) => (
                                <List.Item>
                                    <Text>{col.field_name}</Text>
                                </List.Item>
                            )}
                        />
                    )}

                    {group.children?.map(child => renderGroup(child, level + 1))}
                </Space>
            </GroupCard>
        );
    };

    const allGroups = getAllGroups(headerStructure);

    return (
        <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => addGroup()}
                    >
                        Add Header Group
                    </Button>
                </div>
                {editingHeaderId ? 
                    // If editing a specific header, only show that one
                    (() => {
                        const header = findGroup(headerStructure, editingHeaderId);
                        return header ? renderGroup(header) : null;
                    })() :
                    // Otherwise show all headers
                    headerStructure.map(group => renderGroup(group))
                }
            </div>

            <div style={{ flex: 1 }}>
                <Card title="Assign Columns to Groups">
                    <List
                        dataSource={columns}
                        renderItem={column => (
                            <List.Item>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text>{column.field_name}</Text>
                                    <Radio.Group
                                        value={findColumnGroup(headerStructure, column.field_id)}
                                        onChange={e => assignColumnToGroup(column.field_id, e.target.value)}
                                    >
                                        {allGroups
                                            .filter(group => !editingHeaderId || group.id === editingHeaderId)
                                            .map(group => (
                                                <IndentedRadio 
                                                    key={group.id} 
                                                    value={group.id}
                                                    $level={group.level}
                                                >
                                                    {group.label}
                                                </IndentedRadio>
                                            ))
                                        }
                                        <Radio value={null}>No group</Radio>
                                    </Radio.Group>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </div>
    );
};

const findColumnGroup = (groups: HeaderStructure[], columnId: string): string | null => {
    for (const group of groups) {
        if (group.columns?.includes(columnId)) return group.id;
        if (group.children) {
            const found = findColumnGroup(group.children, columnId);
            if (found) return found;
        }
    }
    return null;
};

export default HeaderGroupManager; 