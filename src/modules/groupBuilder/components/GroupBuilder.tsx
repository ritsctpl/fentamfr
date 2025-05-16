'use client'
import CommonTable from '@components/CommonTable';
import { Button, Input, List, Checkbox, Form, Tree, Tooltip } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { PlusOutlined, PullRequestOutlined, SearchOutlined } from '@ant-design/icons';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import type { DataNode } from 'antd/es/tree';
import CommonAppBar from '@components/CommonAppBar';
import DndTable from './DndTable';

const GroupBuilder = () => {
    const [addGroup, setAddGroup] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [groups, setGroups] = useState([{
        id: 1,
        groupName: 'Group 1',
        description: 'Description 1',
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    }, {
        id: 2,
        groupName: 'Group 2',
        description: 'Description 2',
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
    }]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [sections, setSections] = useState([{
        id: 1,
        sectionName: 'Section 1',
        description: 'Description 1',
    }, {
        id: 2,
        sectionName: 'Section 2',
        description: 'Description 2',
    }]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [form] = Form.useForm();
    const [sectionSearchTerm, setSectionSearchTerm] = useState('');
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    
    // Keep track of section order
    const [orderedSections, setOrderedSections] = useState<typeof selectedSectionsData>([]);

    // Filter sections based on search term
    const filteredSections = sections.filter(section => 
        section.sectionName.toLowerCase().includes(sectionSearchTerm.toLowerCase()) ||
        (section.description && section.description.toLowerCase().includes(sectionSearchTerm.toLowerCase()))
    );

    // Get selected sections data
    const selectedSectionsData = useMemo(() => 
        sections.filter(section => selectedSections.includes(section.id))
    , [sections, selectedSections]);

    // Update ordered sections when selection changes
    useEffect(() => {
        setOrderedSections(selectedSectionsData);
    }, [selectedSectionsData]);

    // Update tree data when sections order or group name changes
    useEffect(() => {
        const groupName = form.getFieldValue('groupName');
        const newTreeData: DataNode[] = [{
            title: groupName || 'New Group',
            key: '0',
            children: orderedSections.map((section, index) => ({
                title: section.sectionName,
                key: `0-${index}`,
                isLeaf: true,
            })),
        }];
        setTreeData(newTreeData);
    }, [orderedSections, form]);

    // Update filtered groups when search term changes
    useEffect(() => {
        setFilteredGroups(groups.filter((group) => 
            group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [searchTerm, groups]);

    const handleSectionOrderChange = (newOrder: typeof selectedSectionsData) => {
        setOrderedSections(newOrder);
    };

    // Watch for form value changes
    const handleFormValuesChange = () => {
        const groupName = form.getFieldValue('groupName');
        setTreeData(prev => [{
            ...prev[0],
            title: groupName || 'New Group',
            children: prev[0]?.children || [],
        }]);
    };

    const handleSectionSelect = (sectionId: number) => {
        setSelectedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            }
            return [...prev, sectionId];
        });
    };

    return (
        <>
            <CommonAppBar appTitle='Group Builder' />
            <div style={{ width: '100%', height: 'calc(100vh - 100px)', display: 'flex' }}>

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
                        data={filteredGroups}
                        onRowSelect={(row) => {
                            setSelectedGroup(row);
                            setIsEdit(true);
                            setIsFullScreen(true);
                        }}
                    />
                </div>
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
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{isEdit ? selectedGroup?.groupName : 'Create Group'} </h2>
                            {isEdit && (
                                <div style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
                                    <div>Description: {selectedGroup?.description}</div>
                                    <div>Created On: {new Date(selectedGroup?.createdAt).toLocaleString()}</div>
                                    <div>Modified On: {new Date(selectedGroup?.updatedAt).toLocaleString()}</div>
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
                                        <Button type="text" icon={<DeleteIcon />} />
                                    </Tooltip>
                                </>
                            )}
                            <Tooltip title="Close">
                                <Button type="text" icon={<CloseIcon />} onClick={() => {
                                    setAddGroup(false);
                                    setIsEdit(false);
                                    setIsFullScreen(false);
                                }} />
                            </Tooltip>
                        </div>
                    </div>
                    <div style={{
                        height: '85%',
                        width: '100%',
                        padding: '5px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        gap: '5px',
                    }}>
                        {/* left side sections list */}
                        <div style={{
                            height: '100%',
                            width: '300px',
                            backgroundColor: '#f5f5f5',
                            padding: '16px',
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
                                        onClick={() => handleSectionSelect(section.id)}
                                    >
                                        <Checkbox
                                            checked={selectedSections.includes(section.id)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 400 }}>{section.sectionName}</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                        {/* center form */}
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
                                onValuesChange={handleFormValuesChange}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${2}, 1fr)`,
                                    gap: '16px',
                                    width: '100%'
                                }}>
                                    <Form.Item label="Group Name :" name="groupName" required={true} rules={[{ required: true, message: 'Group name is required' }]}>
                                        <Input placeholder='Enter group name' />
                                    </Form.Item>
                                    <Form.Item label="Description :" name="description">
                                        <Input placeholder='Enter description' />
                                    </Form.Item>
                                </div>
                            </Form>
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ marginBottom: '16px' }}>Selected Sections</div>
                                <DndTable 
                                    data={orderedSections} 
                                    onOrderChange={handleSectionOrderChange}
                                />
                            </div>
                        </div>
                        {/* right side form */}
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

                </div>

            </div>
        </>
    );
};

export default GroupBuilder;