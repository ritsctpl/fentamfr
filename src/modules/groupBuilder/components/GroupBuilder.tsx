'use client'
import CommonTable from '@components/CommonTable';
import { Button, Input, List, Form, Tree, Tooltip, message, Modal, Tabs } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { PlusOutlined, PullRequestOutlined, SearchOutlined } from '@ant-design/icons';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from '@mui/icons-material/Delete';
import type { DataNode } from 'antd/es/tree';
import CommonAppBar from '@components/CommonAppBar';
import DndTable from './DndTable';
import { FiPlus } from "react-icons/fi";
import { VscPreview } from "react-icons/vsc";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineClear } from "react-icons/ai";
import { createGroup, deleteGroup, getSections, getTop50Groups, updateGroup } from '@services/groupBuilderService';
import '../styles/group.css';
import Preview from './Preview';

// Define our types
type Section = {
    id: number;
    sectionLabel: string;
    handle: string;
    componentIds: Array<{
        handle: string;
        label: string;
        dataType: string;
    }>;
};

type OrderedSection = Section & {
    instanceId: string;
};

type Group = {
    handle: string;
    site: string;
    groupLabel: string;
    sectionIds: {
        handle: string;
        sectionLabel: string;
    }[];
    userId: string;
    active: number;
    createdDateTime?: string;
    modifiedDateTime?: string;
    createdBy?: string;
    modifiedBy?: string;
};

const GroupBuilder = () => {
    // Core states
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [addGroup, setAddGroup] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Form
    const [form] = Form.useForm();

    // Data states
    const [groups, setGroups] = useState<Group[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [orderedSections, setOrderedSections] = useState<OrderedSection[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sectionSearchTerm, setSectionSearchTerm] = useState('');
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>(['0']);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [previewSections, setPreviewSections] = useState(false);

    // Derived states (computed values) with null checks and type checking
    const filteredGroups = Array.isArray(groups) ? groups.filter(group =>
        group.groupLabel.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const filteredSections = Array.isArray(sections) ? sections.filter(section =>
        section.sectionLabel.toLowerCase().includes(sectionSearchTerm.toLowerCase())
    ) : [];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [groupsData, sectionsData] = await Promise.all([
                    getTop50Groups(),
                    getSections({ site: '1004', sectionLabel: sectionSearchTerm })
                ]);
                // Ensure we're setting arrays
                setGroups(Array.isArray(groupsData) ? groupsData : []);
                setSections(Array.isArray(sectionsData) ? sectionsData : []);
            } catch (error) {
                message.error('Failed to load initial data');
                console.error('Error fetching initial data:', error);
                setGroups([]);
                setSections([]);
            }
        };
        fetchInitialData();
    }, []);

    // Update tree data when sections order or group name changes
    useEffect(() => {
        const groupLabel = form.getFieldValue('groupLabel') || 'New Group';
        const newTreeData: DataNode[] = [{
            title: groupLabel,
            key: '0',
            children: Array.isArray(orderedSections) ? orderedSections.map((section, index) => ({
                title: section.sectionLabel,
                key: `0-${index}`,
                children: Array.isArray(section?.componentIds) ? section.componentIds.map((component, cIndex) => ({
                    title: component.label,
                    key: `0-${index}-${cIndex}`,
                    isLeaf: true,
                })) : [],
            })) : [],
        }];
        setTreeData(newTreeData);
        // Update expanded keys to include all parent nodes
        const allKeys = ['0', ...(Array.isArray(orderedSections) ? orderedSections.map((_, index) => `0-${index}`) : [])];
        setExpandedKeys(allKeys);
    }, [orderedSections, form]);

    // Handlers
    const handleDeleteSection = (instanceId: string) => {
        if (!instanceId) return;
        setOrderedSections(prev => Array.isArray(prev) ? prev.filter(section => section.instanceId !== instanceId) : []);
    };

    const handleSectionOrderChange = (newOrder: OrderedSection[]) => {
        setOrderedSections(Array.isArray(newOrder) ? newOrder : []);
    };

    const handleAddSection = (section: Section) => {
        if (!section) return;
        const uniqueId = `${section.handle}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setOrderedSections(prev => {
            const prevArray = Array.isArray(prev) ? prev : [];
            return [...prevArray, {
                ...section,
                instanceId: uniqueId,
                handle: section.handle,
                componentIds: Array.isArray(section.componentIds) ? section.componentIds : []
            }];
        });
    };

    const handleSaveGroup = async () => {
        try {
            const groupLabel = form.getFieldValue('groupLabel');

            if (!groupLabel || groupLabel.trim() === '') {
                message.error('Please enter a group name');
                return;
            }

            const groupData = {
                site: '1004',
                groupLabel: groupLabel,
                sectionIds: (orderedSections || []).map(section => ({
                    handle: section.handle,
                    sectionLabel: section.sectionLabel
                })),
                userId: "senthil",
                active: 1
            };

            const response = await createGroup(groupData);
            if (response) {
                const updatedGroups = await getTop50Groups();
                setGroups(updatedGroups || []);
                resetForm();
                message.success(response.message_details.msg);
            }
        } catch (error) {
            message.error('Failed to create group');
            console.error('Error creating group:', error);
        }
    };

    const handleUpdateGroup = async () => {
        try {
            const groupData = {
                site: '1004',
                groupLabel: form.getFieldValue('groupLabel'),
                sectionIds: (orderedSections || []).map(section => ({
                    handle: section.handle,
                    sectionLabel: section.sectionLabel
                })),
                userId: "senthil",
                active: 1
            };

            const response = await updateGroup(groupData);
            if (response) {
                const updatedGroups = await getTop50Groups();
                setGroups(updatedGroups || []);
                resetForm();
                message.success(response.message_details.msg);
            }
        } catch (error) {
            message.error('Failed to update group');
            console.error('Error updating group:', error);
        }
    };

    const handleDeleteGroup = async () => {
        try {
            if (!selectedGroup) return;

            Modal.confirm({
                title: 'Delete Group',
                content: 'Are you sure you want to delete this group?',
                onOk: async () => {
                    const response = await deleteGroup(selectedGroup);
                    if (response) {
                        setGroups(groups.filter(group => group.handle !== selectedGroup.handle));
                        resetForm();
                        message.success(response.message_details.msg);
                    }
                }
            });
        } catch (error) {
            message.error('Failed to delete group');
            console.error('Error deleting group:', error);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setOrderedSections([]);
        setIsEdit(false);
        setAddGroup(false);
        setIsFullScreen(false);
        setSelectedGroup(null);
    };

    const handleSelectGroup = (row: any) => {
        try {
            if (!row || !row.handle) return;
            const selectedGroupItem = Array.isArray(filteredGroups) ?
                filteredGroups.find((item) => item.handle === row.handle) : null;
            if (selectedGroupItem) {
                setSelectedGroup(selectedGroupItem);
                setIsEdit(true);
                form.setFieldsValue({
                    groupLabel: selectedGroupItem.groupLabel,
                });

                // Map sections with their original handles and find matching section data
                const mappedSections = Array.isArray(selectedGroupItem.sectionIds) ?
                    selectedGroupItem.sectionIds.map(sectionId => {
                        // Find the original section data that matches the handle pattern
                        const originalSection = Array.isArray(sections) ?
                            sections.find(s => {
                                const sectionName = sectionId.sectionLabel;
                                return s.sectionLabel === sectionName;
                            }) : null;

                        // Generate a unique instanceId for each section
                        const uniqueId = `${sectionId.handle}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                        return {
                            id: originalSection?.id || 0,
                            handle: sectionId.handle,
                            instanceId: uniqueId,
                            sectionLabel: sectionId.sectionLabel,
                            componentIds: Array.isArray(originalSection?.componentIds) ? originalSection.componentIds : []
                        };
                    }) : [];

                setOrderedSections(mappedSections);
                setIsFullScreen(true);
            }
        } catch (error) {
            message.error('Failed to load group details');
            console.error('Error selecting group:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setOrderedSections([]);
        setAddGroup(false);
        setIsEdit(false);
        setIsFullScreen(false);
    };

    return (
        <>
            <CommonAppBar appTitle='Group Builder' />
            <div style={{ width: '100%', height: 'calc(100vh - 50px)', display: 'flex', }}>
                {/* Left side - Groups List */}
                <div style={{
                    width: addGroup || isEdit ? isFullScreen ? '0%' : '50%' : '100%',
                    height: '100%',
                    visibility: isFullScreen ? 'hidden' : 'visible',
                    opacity: isFullScreen ? 0 : 1,
                    transform: isFullScreen ? 'translateX(-100%)' : 'translateX(0)',
                    transition: 'all 0.3s ease-in-out',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '8%',
                        width: '100%',
                        display: 'flex',
                        padding: '20px',
                        boxSizing: 'border-box',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease-in-out',
                        transform: isFullScreen ? 'translateX(-20px)' : 'translateX(0)',
                    }}>
                        <Input
                            placeholder='Search templates...'
                            style={{ width: 250 }}
                            suffix={<SearchOutlined />}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                        <Button type='primary' onClick={() => setSearchTerm('')}>Go</Button>
                    </div>
                    <div style={{
                        height: '8%',
                        width: '100%',
                        display: 'flex',
                        padding: '20px',
                        boxSizing: 'border-box',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        Groups ({filteredGroups.length})
                        <Button
                            onClick={() => {
                                setAddGroup(true);
                                setIsFullScreen(true);
                            }}
                            type='text'
                            shape='circle'
                        >
                            <PlusOutlined style={{ fontSize: '20px', color: '#000' }} />
                        </Button>
                    </div>
                    <CommonTable
                        data={filteredGroups.map(item => ({
                            groupLabel: item.groupLabel,
                            handle: item.handle
                        }))}
                        onRowSelect={handleSelectGroup}
                    />
                </div>

                {/* Right side - Group Editor */}
                <div style={{
                    width: addGroup || isEdit ? isFullScreen ? '100%' : '50%' : '0%',
                    height: '100%',
                    visibility: isEdit || addGroup ? 'visible' : 'hidden',
                    opacity: isEdit || addGroup ? 1 : 0,
                    transform: isEdit || addGroup ? 'translateX(0)' : 'translateX(20px)',
                    transition: 'all 0.3s ease-in-out',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #efefef',
                        display: 'flex',
                        boxSizing: 'border-box',
                        height: '15%',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                                {isEdit ? selectedGroup?.groupLabel : 'Create Group'}
                            </h2>
                            {isEdit && selectedGroup && (
                                <div style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
                                    {/* <div>Description: {selectedGroup.description}</div> */}
                                    <div>Created On: {new Date(selectedGroup.createdDateTime).toLocaleString()}</div>
                                    <div>Modified On: {new Date(selectedGroup.modifiedDateTime).toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            {/* <Button type="text" icon={isFullScreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />} onClick={() => setIsFullScreen(!isFullScreen)} /> */}
                            {isEdit && (
                                <>
                                    <Tooltip title="Copy">
                                        <Button type="text" icon={<CopyIcon />} />
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <Button type="text" icon={<DeleteIcon />} onClick={handleDeleteGroup} />
                                    </Tooltip>
                                </>
                            )}
                            <Tooltip title="Close">
                                <Button type="text" icon={<CloseIcon />} onClick={() => {
                                    setAddGroup(false);
                                    setIsEdit(false);
                                    setIsFullScreen(false);
                                    form.resetFields();
                                    setOrderedSections([]);
                                }} />
                            </Tooltip>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div style={{
                        height: '78%',
                        width: '100%',
                        padding: '5px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        gap: '5px',
                    }}>
                        {/* Sections list */}
                        <div style={{
                            height: '100%',
                            width: '300px',
                            minWidth: '300px',
                            backgroundColor: '#f5f5f5',
                            padding: '16px',
                            boxSizing: 'border-box',
                            overflowY: 'auto'
                        }}>
                            <div style={{ fontWeight: 500, marginBottom: '16px' }}>Sections</div>
                            <Input.Search
                                placeholder="Search sections..."
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setSectionSearchTerm(e.target.value)}
                                value={sectionSearchTerm}
                            />
                            <List
                                dataSource={filteredSections}
                                renderItem={(section) => (
                                    <List.Item
                                        key={section.id}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#fff',
                                            marginBottom: '8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleAddSection(section)}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 400 }}>{section.sectionLabel}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiPlus />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>

                        {/* Form and Table */}

                        <div style={{
                            height: '100%',
                            width: activeTab === '2' ? 'calc(100% - 900px)' : 'calc(100% - 600px)',
                            minWidth: activeTab === '2' ? 'calc(100% - 900px)' : 'calc(100% - 600px)',
                            borderLeft: '1px solid #e8e8e8',
                            borderRight: '1px solid #e8e8e8',
                            backgroundColor: '#fff',
                            padding: '16px',
                            boxSizing: 'border-box',
                            transition: 'all 0.3s ease-in-out',
                            transform: activeTab === '2' ? 'translateX(0)' : 'translateX(0)',
                            opacity: 1,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 600 }}>Group Builder</span>
                                <Button onClick={() => setPreviewSections(!previewSections)} type='text' style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500, }}>
                                    <AiOutlineEye size={18} />
                                    Preview
                                </Button>
                            </div>
                            {!previewSections && <Form
                                form={form}
                                layout="vertical"
                                wrapperCol={{ flex: 1 }}
                                style={{ width: '60%' }}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${2}, 1fr)`,
                                    gap: '16px',
                                    width: '100%'
                                }}>
                                    <Form.Item
                                        label="Group Name :"
                                        name="groupLabel"
                                        required={true}
                                        rules={[{ required: true, message: 'Group name is required' }]}
                                    >
                                        <Input disabled={isEdit} placeholder='Enter group name' />
                                    </Form.Item>
                                </div>
                            </Form>}
                            {!previewSections && <div style={{ marginTop: '20px' }}>
                                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 500 }}>Selected Sections</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                                        <Button title='Clear' type='text'
                                            onClick={() => setOrderedSections([])}
                                        >
                                            <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Clear</span>
                                            <AiOutlineClear size={18} />
                                        </Button>
                                    </div>
                                </div>
                                <DndTable
                                    data={orderedSections}
                                    onOrderChange={handleSectionOrderChange}
                                    onDelete={handleDeleteSection}
                                />
                            </div>}
                            {previewSections && <div>
                                <Preview sections={orderedSections} />
                            </div>}
                        </div>

                        {/* Tree View */}
                        <div style={{
                            height: '100%',
                            width: activeTab === '2' ? '600px' : '300px',
                            minWidth: activeTab === '2' ? '600px' : '300px',
                            padding: '12px',
                            boxSizing: 'border-box',
                            transition: 'all 0.3s ease-in-out',
                            transform: activeTab === '2' ? 'translateX(0)' : 'translateX(0)',
                            opacity: 1,
                        }}>
                            <div style={{ fontWeight: 500, }}>
                                <PullRequestOutlined style={{ marginRight: '8px' }} />
                                Group Structure
                            </div>
                            <Tree
                                treeData={treeData}
                                defaultExpandAll
                                expandedKeys={expandedKeys}
                                onExpand={(keys) => setExpandedKeys(keys as string[])}
                                selectable={false}
                                showIcon
                                showLine
                                style={{
                                    padding: '10px',
                                    boxSizing: 'border-box',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            />
                        </div>

                    </div>
                    <div style={{ height: '10%', width: '10%', display: 'flex', gap: '10px', float: 'right', padding: '10px' }}>
                        {isEdit ? <Button type='primary' style={{ width: '100%' }} onClick={handleUpdateGroup}>Save</Button> : <Button type='primary' style={{ width: '100%' }} onClick={handleSaveGroup}>Create</Button>}
                        <Button type='default' style={{ width: '100%' }} onClick={handleCancel}>Cancel</Button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default GroupBuilder;