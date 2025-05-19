'use client'
import CommonTable from '@components/CommonTable';
import { Button, Input, List, Form, Tree, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { PlusOutlined, PullRequestOutlined, SearchOutlined } from '@ant-design/icons';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DataNode } from 'antd/es/tree';
import CommonAppBar from '@components/CommonAppBar';
import DndTable from './DndTable';
import { FiPlus } from "react-icons/fi";
import { VscPreview } from "react-icons/vsc";
import { AiOutlineClear } from "react-icons/ai";
import { createGroup, deleteGroup, getSections, getTop50Groups, updateGroup } from '@services/groupBuilderService';


// Define our types
type Section = {
    id: number;
    sectionLabel: string;
    handle: string;
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

    // Derived states (computed values)
    const filteredGroups = groups.filter(group =>
        group.groupLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSections = sections.filter(section =>
        section.sectionLabel.toLowerCase().includes(sectionSearchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await getTop50Groups();
            setGroups(groups);
        };
        fetchGroups();
        const fetchSections = async () => {
            const sections = await getSections();
            setSections(sections);
        };
        fetchSections();
    }, []);

    // Update tree data when sections order or group name changes
    useEffect(() => {
        const groupLabel = form.getFieldValue('groupLabel');
        const newTreeData: DataNode[] = [{
            title: groupLabel || 'New Group',
            key: '0',
            children: orderedSections.map((section, index) => ({
                title: section.sectionLabel,
                key: `0-${index}`,
                isLeaf: true,
            })),
        }];
        setTreeData(newTreeData);
    }, [orderedSections, form]);

    // Handlers
    const handleDeleteSection = (instanceId: string) => {
        setOrderedSections(prev => prev.filter(section => section.instanceId !== instanceId));
    };

    const handleSectionOrderChange = (newOrder: OrderedSection[]) => {
        setOrderedSections(newOrder);
    };

    const handleAddSection = (section: Section) => {
        setOrderedSections(prev => [...prev, {
            ...section,
            instanceId: `${section.id}-${Date.now()}-${Math.random()}`
        }]);
    };

    const handleSaveGroup = async () => {
        const groupData = {
            site: '1004', // You might want to make this configurable
            groupLabel: form.getFieldValue('groupLabel'),
            sectionIds: orderedSections.map(section => ({
                handle: section.instanceId,
                sectionLabel: section.sectionLabel
            })),
            userId: "senthil", // You might want to make this configurable
            active: 1
        };

        try {
            const response = await createGroup(groupData);
            if (response) {
                // Refresh the groups list
                const updatedGroups = await getTop50Groups();
                setGroups(updatedGroups);

                // Reset form and close editor
                form.resetFields();
                setOrderedSections([]);
                setAddGroup(false);
                setIsFullScreen(false);
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleUpdateGroup = async () => {
        const groupData = {
            site: '1004',
            groupLabel: form.getFieldValue('groupLabel'),
            sectionIds: orderedSections.map(section => ({
                handle: section.instanceId,
                sectionLabel: section.sectionLabel
            })),
            userId: "senthil",
            active: 1
        };
        try {
            const response = await updateGroup(groupData);
            if (response) {
                // Refresh the groups list
                const updatedGroups = await getTop50Groups();
                setGroups(updatedGroups);
                setIsEdit(false);
                setAddGroup(false);
                setIsFullScreen(false);
            }
        } catch (error) {
            console.error('Error updating group:', error);
        }
    };

    const handleDeleteGroup = async () => {
        const response = await deleteGroup(selectedGroup);
        if (response) {
            setGroups(groups.filter(group => group.handle !== selectedGroup?.handle));
            setIsEdit(false);
            setAddGroup(false);
            setIsFullScreen(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setOrderedSections([]);
        setAddGroup(false);
        setIsFullScreen(false);
    };

    return (
        <>
            <CommonAppBar appTitle='Group Builder' />
            <div style={{ width: '100%', height: 'calc(100vh - 100px)', display: 'flex' }}>
                {/* Left side - Groups List */}
                <div style={{
                    width: addGroup || isEdit ? isFullScreen ? '0%' : '50%' : '100%',
                    height: '100%',
                    display: isFullScreen ? 'none' : 'block',
                }}>
                    <div style={{
                        height: '8%',
                        width: '100%',
                        display: 'flex',
                        padding: '20px',
                        boxSizing: 'border-box',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
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
                        onRowSelect={(row) => {
                            const selectedGroupItem = filteredGroups.find((item) => item.handle === row.handle);
                            if (selectedGroupItem) {
                                setSelectedGroup(selectedGroupItem);
                                setIsEdit(true);
                                form.setFieldsValue({
                                    groupLabel: selectedGroupItem.groupLabel,
                                });

                                const mappedSections: OrderedSection[] = selectedGroupItem.sectionIds.map(section => {
                                    const sectionId = parseInt(section.handle.split(',')[1]) || 0;
                                    return {
                                        id: sectionId,
                                        instanceId: section.handle,
                                        sectionLabel: section.sectionLabel,
                                        handle: section.handle,
                                    };
                                });

                                setOrderedSections(mappedSections);
                                setIsFullScreen(true);
                            }
                        }}
                    />
                </div>

                {/* Right side - Group Editor */}
                <div style={{
                    width: addGroup || isEdit ? isFullScreen ? '100%' : '50%' : '0%',
                    height: '100%',
                    display: isEdit || addGroup ? 'block' : 'none'
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
                        height: '85%',
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
                            width: 'calc(100% - 600px)',
                            minWidth: 'calc(100% - 600px)',
                            borderLeft: '1px solid #e8e8e8',
                            borderRight: '1px solid #e8e8e8',
                            backgroundColor: '#fff',
                            padding: '16px',
                            boxSizing: 'border-box',
                        }}>
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
                                        <Input disabled={isEdit} placeholder='Enter group name' />
                                    </Form.Item>
                                </div>
                            </Form>
                            <div style={{ marginTop: '20px' }}>
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
                            </div>
                        </div>

                        {/* Tree View */}
                        <div style={{
                            height: '100%',
                            width: '300px',
                            padding: '16px',
                            overflowY: 'auto'
                        }}>
                            <div style={{ fontWeight: 500, marginBottom: '16px' }}>
                                <PullRequestOutlined style={{ marginRight: '8px' }} />
                                Group Structure
                            </div>
                            <Tree
                                treeData={treeData}
                                defaultExpandAll
                                showIcon
                                showLine
                                style={{
                                    backgroundColor: 'white',
                                    padding: '12px',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ height: '5%', width: '10%', display: 'flex', gap: '10px', float: 'right', padding: '10px' }}>
                        {isEdit ? <Button type='primary' style={{ width: '100%' }} onClick={handleUpdateGroup}>Save</Button> : <Button type='primary' style={{ width: '100%' }} onClick={handleSaveGroup}>Create</Button>}
                        <Button type='default' style={{ width: '100%' }} onClick={handleCancel}>Cancel</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GroupBuilder;