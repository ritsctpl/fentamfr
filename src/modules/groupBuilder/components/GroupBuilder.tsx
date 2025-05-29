'use client'
import CommonTable from '@components/CommonTable';
import { Button, Input, List, Form, Tree, Tooltip, message, Modal, Tabs, Breadcrumb, Empty } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { PlusOutlined, PullRequestOutlined, SearchOutlined, ArrowLeftOutlined, EyeFilled, GroupOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
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
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SectionPreview from './sectionPreview';
import { FaLayerGroup } from "react-icons/fa";
import { CiBoxList } from 'react-icons/ci';

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
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [addGroup, setAddGroup] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showSections, setShowSections] = useState(false);
    const [previewSections, setPreviewSections] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

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
                setIsCreating(false);
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
        setIsCreating(false);
        setAddGroup(true);
        setIsFullScreen(true);
        setSelectedGroup(null);
        setShowSections(false);
        setPreviewSections(false);
    };

    const handleSelectGroup = (row: any) => {
        try {
            if (!row || !row.handle) return;
            const selectedGroupItem = Array.isArray(filteredGroups) ?
                filteredGroups.find((item) => item.handle === row.handle) : null;
            if (selectedGroupItem) {
                setSelectedGroup(selectedGroupItem);
                setIsEdit(true);
                setShowSections(true);
                form.setFieldsValue({
                    groupLabel: selectedGroupItem.groupLabel,
                });

                // Map sections with their original handles and find matching section data
                const mappedSections = Array.isArray(selectedGroupItem.sectionIds) ?
                    selectedGroupItem.sectionIds.map(sectionId => {
                        const originalSection = Array.isArray(sections) ?
                            sections.find(s => s.sectionLabel === sectionId.sectionLabel) : null;

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

    const handleBackToGroups = () => {
        setShowSections(false);
        setSelectedGroup(null);
        setPreviewSections(false);
        setIsCreating(false);
        setIsEdit(false);
        setOrderedSections([]);
        form.resetFields();
    };

    const handleNewGroup = () => {
        setAddGroup(true);
        setIsFullScreen(true);
        setIsEdit(false);
        setIsCreating(true);
        setSelectedGroup(null);
        setShowSections(true);
        setPreviewSections(false);
        setOrderedSections([]);
        form.resetFields();
    };

    const handlePreviewToggle = () => {
        setPreviewSections(!previewSections);
    };

    const handleCopyGroup = () => {
        if (!selectedGroup) return;

        // Create a copy of the selected group with a new name
        const newGroupLabel = `${selectedGroup.groupLabel} (Copy)`;
        form.setFieldsValue({
            groupLabel: newGroupLabel,
        });

        // Keep the same sections but with new instance IDs
        const copiedSections = orderedSections.map(section => ({
            ...section,
            instanceId: `${section.handle}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        setOrderedSections(copiedSections);
        setIsEdit(false);
        setSelectedGroup(null);
    };

    return (
            <div style={{ width: '100%', height: '100%', display: 'flex', }}>
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
                        padding: '10px',
                        borderBottom: '1px solid #efefef',
                        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        boxSizing: 'border-box',
                        height: '6%',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
                            <Breadcrumb>
                                <Breadcrumb.Item><div style={{ color: '#666', fontWeight: isEdit ? '400' : '500' }}>Group Builder</div></Breadcrumb.Item>
                                {isEdit && (
                                    <Breadcrumb.Item><div style={{ color: '#666', fontWeight: '500' }}>{selectedGroup?.groupLabel}</div></Breadcrumb.Item>
                                )}
                            </Breadcrumb>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            {orderedSections.length > 0 && (
                                <Tooltip title={orderedSections.length === 0 ? "Select at least one section to preview" : "Preview"}>
                                    <Button
                                        type="text"
                                        icon={previewSections ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                                        onClick={handlePreviewToggle}
                                        style={{ color: previewSections ? '#1890ff' : 'inherit' }}
                                        disabled={orderedSections.length === 0}
                                    />
                                </Tooltip>
                            )}
                            {(isEdit || isCreating) && (
                                <>
                                    {isEdit && (
                                        <>
                                            <Tooltip title="Copy">
                                                <Button
                                                    type="text"
                                                    icon={<CopyIcon />}
                                                    onClick={handleCopyGroup}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <Button
                                                    type="text"
                                                    icon={<DeleteIcon />}
                                                    onClick={handleDeleteGroup}
                                                />
                                            </Tooltip>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main content area */}
                    <div style={{
                        height: isEdit || isCreating ? '87%' : '100%',
                        width: '100%',
                        display: 'flex',
                        gap: '5px',
                    }}>
                        {/* Groups/Sections list */}
                        <div style={{
                            height: '100%',
                            width: '330px',
                            minWidth: '330px',
                            padding: '10px',
                            boxSizing: 'border-box',
                            overflowY: 'auto'
                        }}>
                            {!showSections ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ fontWeight: 500, fontSize: '14px' }}>List of Groups ({filteredGroups.length})</div>
                                        <Button
                                            type='text'
                                            icon={<PlusOutlined />}
                                            onClick={handleNewGroup}
                                        >
                                        </Button>
                                    </div>
                                    <Input.Search
                                        placeholder="Search groups..."
                                        style={{ marginBottom: '16px' }}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        value={searchTerm}
                                    />
                                    <List
                                        dataSource={filteredGroups}
                                        renderItem={(item) => (
                                            <List.Item
                                                key={item.handle}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#fff',
                                                    marginBottom: '8px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    border: '1px solid rgba(0, 0, 0, 0.16)',
                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                                    transition: "all 0.3s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f0f7ff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(24,144,255,0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                                }}
                                                onClick={() => handleSelectGroup(item)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <FaLayerGroup style={{ fontSize: '14px', color: '#666' }} />
                                                    <div style={{ fontWeight: '450', fontSize: item.groupLabel.length > 30 ? "0.8em" : "0.8em" }}>{item.groupLabel}</div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
                                        <Button type='text' icon={<ArrowLeftOutlined />} onClick={handleBackToGroups} />
                                        <div style={{ fontWeight: 500, fontSize: '14px' }}>List of Sections ({filteredSections.length})</div>
                                    </div>
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
                                                    padding: '8px 12px',
                                                    backgroundColor: '#fff',
                                                    marginBottom: '8px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: "all 0.3s ease",
                                                    border: '1px solid rgba(0, 0, 0, 0.16)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f0f7ff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(24,144,255,0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                                }}
                                                onClick={() => handleAddSection(section)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <CiBoxList style={{ fontSize: '16px', color: '#666' }} />
                                                    <div style={{ fontWeight: '450', fontSize: section.sectionLabel.length > 30 ? "0.8em" : "0.8em" }}>{section.sectionLabel}</div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        {/* Form and Table */}
                        <div style={{
                            height: '100%',
                            width: isEdit || isCreating ? 'calc(100% - 630px)' : 'calc(100% - 330px)',
                            minWidth: isEdit || isCreating ? 'calc(100% - 630px)' : 'calc(100% - 330px)',
                            borderLeft: '1px solid #e8e8e8',
                            borderRight: '1px solid #e8e8e8',
                            padding: '16px',
                            boxSizing: 'border-box',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                        }}>
                            {!selectedGroup && !isCreating && !showSections ? (
                                <div style={{
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#666',
                                    gap: '16px'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                        <Empty style={{ fontSize: '14px', color: '#888' }} description="Please select a group or create a new one from the list of groups" />
                                        <Button type='default' icon={<PlusOutlined />} onClick={handleNewGroup} style={{ marginTop: '10px' }}>
                                            Create New Group
                                        </Button>
                                    </div>
                                </div>
                            ) : !previewSections ? (
                                <>
                                    <Form
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
                                                <Input
                                                    disabled={isEdit && !isCreating}
                                                    placeholder='Enter group name'
                                                />
                                            </Form.Item>
                                        </div>
                                    </Form>
                                    {showSections && (
                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ fontWeight: 500 }}>Selected Sections</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                                                    <Button
                                                        title='Clear'
                                                        type='text'
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
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                                    <SectionPreview sections={orderedSections} />
                                </div>
                            )}
                        </div>

                        {/* Tree View */}
                        {showSections && (
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
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>
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
                        )}
                    </div>

                    {/* Action Buttons */}
                    {
                        (isEdit || isCreating) && (
                            <div style={{
                                height: '7%',
                                width: '100%',
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                padding: '10px',
                                boxSizing: 'border-box',
                                borderTop: '1px solid #efefef'
                            }}>
                                {showSections && (
                                    <>
                                        {isCreating ? (
                                            <Button type='default' icon={<PlusOutlined />} onClick={handleSaveGroup}>Create</Button>
                                        ) : isEdit ? (
                                            <Button type='default' icon={<SaveOutlined />} onClick={handleUpdateGroup}>Save</Button>
                                        ) : null}
                                        <Button type='default' onClick={resetForm} icon={<CloseOutlined />}>Cancel</Button>
                                    </>
                                )}
                            </div>
                        )
                    }

                </div>
            </div>
    );
};

export default GroupBuilder;