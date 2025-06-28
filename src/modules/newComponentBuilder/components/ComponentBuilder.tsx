'use client'
import { Button, Input, List, Form, Tooltip, message, Modal, Tabs, Breadcrumb, Empty, Select, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { PlusOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from '@mui/icons-material/Delete';
import { createComponent, deleteComponent, getComponentById, getTop50Components, updateComponent } from '@services/groupBuilderService';
import '../styles/group.css';
import { FaLayerGroup } from "react-icons/fa";
import UniversalTable from './UniversalTable';

type Group = {
    handle: string;
    componentLabel: string;
    dataType: string;
    defaultValue: string;
    required?: boolean;
    modifiedDateTime?: string;
    createdBy?: string;
    modifiedBy?: string;
};

const ComponentBuilder = () => {
    // Core states
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [addGroup, setAddGroup] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showSections, setShowSections] = useState(false);
    const [previewSections, setPreviewSections] = useState(false);
    const [isCreating, setIsCreating] = useState(false)

    // Form
    const [form] = Form.useForm();

    const dataType = Form.useWatch('dataType', form) || '';

    // Data states
    const [groups, setGroups] = useState<Group[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<string>('components');
    const [isSectionTabDisabled, setIsSectionTabDisabled] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groupsData = await getTop50Components({ site: '1004' });
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch (error) {
                message.error('Failed to load groups');
                console.error('Error fetching groups:', error);
                setGroups([]);
            }
        };
        fetchGroups();
    }, [searchTerm]);

    const handleSaveGroup = async () => {
        try {
            const values = await form.validateFields();
            const response = await createComponent({ ...values, site: '1004', userId: "ajai" });
            if (!response.errorCode) {
                const updatedGroups = await getTop50Components({ site: '1004' });
                setGroups(updatedGroups || []);
                setIsCreating(false);
                setIsEdit(false)
                resetForm();
                message.success(response?.message_details.msg);
                handleBackToGroups()
            }
            else {
                throw new Error(response?.message || 'Something went wrong')
            }
        } catch (error) {
            if (error.errorFields) {
                message.warning('Please correct the highlighted fields.');
            } else {
                // Custom or server error
                message.error(error.message || 'Unexpected error occurred');
            }
        }
    };

    const handleUpdateGroup = async () => {
        try {
            const values = await form.validateFields();
            const response = await updateComponent({ ...values, site: '1004', userId: "ajai" });
            if (!response.errorCode) {
                const updatedGroups = await getTop50Components({ site: '1004' });
                setGroups(updatedGroups || []);
                message.success(response.message_details.msg);
                // handleBackToGroups()
            }
            else {
                throw new Error(response?.message || 'Something went wrong')
            }
        } catch (error) {
            if (error.errorFields) {
                message.warning('Please correct the highlighted fields.');
            } else {
                // Custom or server error
                message.error(error.message || 'Unexpected error occurred');
            }
        }
    };

    const handleDeleteGroup = async () => {
        try {
            if (!selectedGroup) return;

            Modal.confirm({
                title: 'Delete Group',
                content: 'Are you sure you want to delete this component?',
                onOk: async () => {
                    const response = await deleteComponent({ site: '1004', componentLabel: selectedGroup.componentLabel });
                    if (!response.errorCode) {
                        const updatedGroups = await getTop50Components({ site: '1004' });
                        setGroups(updatedGroups || []);
                        message.success(response.message_details.msg);
                        handleBackToGroups()
                    } else {
                        throw new Error(response?.message || 'Something went wrong')
                    }
                }
            });
        } catch (error) {
            message.error('Failed to delete component');
            console.error('Error deleting component:', error);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setIsEdit(false);
        setIsCreating(false);
        setAddGroup(true);
        setIsFullScreen(true);
        setSelectedGroup(null);
        setShowSections(false);
        setPreviewSections(false);
    };

    const handleSelectGroup = async (row: Group) => {
        try {
            if (!row || !row.handle) return;
            const selectedGroupItem = groups.find((item) => item.handle === row.handle);
            if (selectedGroupItem) {
                const component = await getComponentById({ site: '1004', componentLabel: selectedGroupItem.componentLabel })
                setSelectedGroup(component);
                setIsEdit(true);
                setShowSections(true);
                setIsSectionTabDisabled(false);
                setActiveTab('config');
                form.setFieldsValue({
                    ...selectedGroupItem,
                });
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
        setActiveTab('components');
        setIsSectionTabDisabled(true);
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
        setIsSectionTabDisabled(false);
        setActiveTab('config');
        form.resetFields();
    };

    const handleCopyGroup = () => {
        if (!selectedGroup) return;

        // Create a copy of the selected group with a new name
        const newGroupLabel = `${selectedGroup.componentLabel} (Copy)`;
        form.setFieldsValue({
            componentLabel: newGroupLabel,
        });

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
                            <Breadcrumb.Item><div style={{ color: '#666', fontWeight: isEdit || isCreating ? '400' : '500' }}>Component Builder</div></Breadcrumb.Item>
                            {(isEdit || isCreating) && (
                                <Breadcrumb.Item><div style={{ color: '#666', fontWeight: '500' }}>{selectedGroup?.componentLabel || 'Create Component'}</div></Breadcrumb.Item>
                            )}
                        </Breadcrumb>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
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
                        <Tabs
                            style={{
                                height: '100%',
                            }}
                            tabBarExtraContent={{
                                right: (
                                    // activeTab === 'groups' && (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Button type='text' icon={<PlusOutlined />} onClick={handleNewGroup} />
                                    </div>
                                    // )
                                )
                            }}
                            tabBarStyle={{
                                height: '40px',
                            }}
                            activeKey={activeTab}
                            onChange={(key) => {
                                if (key === 'components' || !isSectionTabDisabled) {
                                    setActiveTab(key);
                                }
                                if (key === 'components') {
                                    handleBackToGroups();
                                }
                            }}
                            items={[
                                {
                                    key: 'components',
                                    label: 'Components',
                                    style: {
                                        height: '100%'
                                    },
                                    children: (
                                        <div style={{ height: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '10px' }}>
                                                <div style={{ fontWeight: 500, fontSize: '14px' }}>List of Components ({groups.length})</div>
                                            </div>
                                            <Input.Search
                                                placeholder="Search components..."
                                                style={{ marginBottom: '16px' }}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                value={searchTerm}
                                            />
                                            <List
                                                dataSource={groups}
                                                renderItem={(item: Group) => (
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
                                                            <div style={{ fontWeight: '450', fontSize: item.componentLabel.length > 30 ? "0.8em" : "0.8em" }}>{item.componentLabel}</div>
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    key: 'config',
                                    label: 'Config',
                                    style: {
                                        height: '100%'
                                    },
                                    disabled: isSectionTabDisabled,
                                    children: (
                                        <div style={{ height: '100%', paddingTop: 15 }}>
                                            {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '10px' }}>
                                                <div style={{ fontWeight: 500, fontSize: '14px' }}>Component Fields</div>
                                            </div> */}
                                            <Form
                                                form={form}
                                                layout="vertical"
                                                wrapperCol={{ flex: 1 }}
                                                style={{ width: '100%' }}
                                                initialValues={{
                                                    componentLabel: '',
                                                    dataType: 'table',
                                                    unit: 'kg',
                                                    apiUrl: '',
                                                    bulletPointText: '',
                                                    dataIndex: '',
                                                    defaultValue: '',
                                                    isRequired: false,
                                                    validation: ''
                                                }}
                                            >
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: `repeat(${1}, 1fr)`,
                                                    width: '100%'
                                                }}>
                                                    <Form.Item
                                                        label="Component Label :"
                                                        name="componentLabel"
                                                        required={true}
                                                        rules={[{ required: true, message: 'Component label is required' }]}
                                                    >
                                                        <Input
                                                            disabled={isEdit && !isCreating}
                                                            placeholder='Enter component label'
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label="Data Type :"
                                                        name="dataType"
                                                        required={true}
                                                        rules={[{ required: true, message: 'Data type is required' }]}
                                                    >
                                                        <Select
                                                            placeholder='Select data type'
                                                            options={[
                                                                { value: 'input', label: 'Input' },
                                                                { value: 'integer', label: 'Integer' },
                                                                { value: 'select', label: 'Select' },
                                                                { value: 'textarea', label: 'Textarea' },
                                                                { value: 'checkbox', label: 'Checkbox' },
                                                                { value: 'table', label: 'Table' },
                                                                { value: 'form', label: 'Form' },
                                                                { value: 'switch', label: 'Switch' },
                                                                { value: 'datePicker', label: 'Date Picker' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                    {(() => {
                                                        switch (dataType) {
                                                            case 'input':
                                                            case 'integer':
                                                                return (<Form.Item
                                                                    label="Unit :"
                                                                    name="unit"
                                                                    required={false}
                                                                    rules={[{ required: false, message: 'unit is required' }]}
                                                                >
                                                                    <Select
                                                                        allowClear
                                                                        placeholder='Select unit'
                                                                        options={[
                                                                            { value: 'kg', label: 'kg' },
                                                                            { value: 'g', label: 'g' },
                                                                            { value: 'm', label: 'm' },
                                                                            { value: 'mg', label: 'mg' },
                                                                            { value: 'mg%', label: 'mg%' },
                                                                            { value: 'ml', label: 'ml' },
                                                                            { value: 'cm', label: 'cm' },
                                                                            { value: 'mm', label: 'mm' },
                                                                            { value: 's', label: 's' },
                                                                            { value: '°C', label: '°C' },
                                                                            { value: '°F', label: '°F' },
                                                                            { value: '%', label: '%' }
                                                                        ]}
                                                                    />
                                                                </Form.Item>);
                                                            case 'select':
                                                                return (<Form.Item
                                                                    label="Api url :"
                                                                    name="apiUrl"
                                                                    required={false}
                                                                    rules={[{ required: false, message: 'apiUrl  is required' }]}
                                                                >
                                                                    <Input
                                                                        placeholder='Enter default value label'
                                                                    />
                                                                </Form.Item>);
                                                            default:
                                                                return <div></div>;
                                                        }
                                                    })()}

                                                    {(() => {
                                                        switch (dataType) {
                                                            case 'textarea':
                                                                return (
                                                                <Form.Item
                                                                    label="Default value :"
                                                                    name="defaultValue"
                                                                    required={false}
                                                                    rules={[{ required: false, message: 'default value is required' }]}
                                                                >
                                                                    <Input.TextArea
                                                                        placeholder='Enter default value label'
                                                                    />
                                                                </Form.Item>
                                                                );
                                                            default:
                                                                return (
                                                                    <Form.Item
                                                                        label="Default value :"
                                                                        name="defaultValue"
                                                                        required={false}
                                                                        rules={[{ required: false, message: 'default value is required' }]}
                                                                    >
                                                                        <Input
                                                                            placeholder='Enter default value label'
                                                                        />
                                                                    </Form.Item>
                                                                );
                                                        }
                                                    })()}

                                                    <Form.Item
                                                        label="Required :"
                                                        name="required"
                                                        required={false}
                                                        rules={[{ required: false, message: 'required is required' }]}
                                                    >
                                                        <Switch />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label="Validation :"
                                                        name="validation"
                                                        required={false}
                                                        rules={[{ required: false, message: 'Validation is required' }]}
                                                    >
                                                        <Input.TextArea
                                                            placeholder='Enter validation'
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </Form>
                                        </div>
                                    )
                                }
                            ]}
                        />
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
                                        Create New Component
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#888' }}>{dataType.toUpperCase()} - PREVIEW</span>
                                {(() => {
                                    switch (dataType) {
                                        case 'table':
                                            return <UniversalTable />;
                                        case 'form':
                                            return <Form>Form preview</Form>;
                                        default:
                                            return <div>No preview available</div>;
                                    }
                                })()}
                            </div>
                        )
                        }
                    </div>
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

export default ComponentBuilder;
