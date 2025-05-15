import React, { useState } from 'react';
import { Button, Card, Collapse, Form, Input, Radio, Select, Space, Tag, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Title from 'antd/es/typography/Title';
import { IoArrowBack } from 'react-icons/io5';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import BuilderTable from '../builder_components/BuilderTable';
import BuilderForm from '../builder_components/BuilderForm';
import { BILL_OF_MATERIAL_PROPS, PRODUCT_DETAILS_PROPS } from '../../constants/builderConstants';

interface ComponentBuilderProps {
    config: {
        isVisible: boolean;
        setVisible: (visible: boolean) => void;
        data?: any;
        onSave?: (componentData: any) => void;
        onDelete?: (componentId: number) => void;
        permitive?: 'edit' | 'view';
    };
}

const ComponentBuilder: React.FC<ComponentBuilderProps> = ({ config }) => {
    const [form] = Form.useForm();
    const [copyForm] = Form.useForm();
    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [componentType, setComponentType] = useState<'Table' | 'Form' | 'Section'>(config?.data?.type || 'Table');
    const [componentConfig, setComponentConfig] = useState({
        title: config?.data?.config?.title || 'Sample Component',
        metaData: config?.data?.config?.metaData || BILL_OF_MATERIAL_PROPS.metaData,
        data: config?.data?.config?.data || BILL_OF_MATERIAL_PROPS.data,
        style: {
            heading: {
                titleAlign: config?.data?.config?.style?.heading?.titleAlign || 'center'
            },
            table: {
                column: config?.data?.config?.style?.table?.column || 1
            },
            form: {
                column: config?.data?.config?.style?.form?.column || 1
            }
        }
    });

    // Initialize with existing data if editing
    React.useEffect(() => {
        if (config.data) {
            form.setFieldsValue({
                componentName: config.data.componentName,
                description: config.data.description
            });
            setComponentType(config.data.type);
            if (config.data.config) {
                setComponentConfig({
                    title: config.data.config.title || '',
                    metaData: config.data.config.metaData || [],
                    data: config.data.config.data || [],
                    style: config.data.config.style || {
                        heading: {
                            titleAlign: 'center'
                        },
                        table: {
                            column: 1
                        },
                        form: {
                            column: 1
                        }
                    }
                });
            }
        }
    }, [config.data]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const componentData = {
                ...values,
                type: componentType,
                config: componentConfig
            };
            config.onSave?.(componentData);
            config.setVisible(true);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCopyComponent = async () => {
        try {
            const values = await copyForm.validateFields();
            
            // Create a deep copy of the current component data
            const copiedComponent = {
                ...config.data,
                id: Date.now(),
                componentName: values.componentName,
                description: values.description,
                updatedDate: new Date().toLocaleDateString(),
                config: {
                    ...config.data.config,
                    title: values.componentName
                }
            };

            // Call the parent's onSave with a special flag to indicate this is a copy
            config.onSave?.({ ...copiedComponent, isCopy: true });
            setCopyModalVisible(false);
            copyForm.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleAddField = () => {
        setComponentConfig(prev => ({
            ...prev,
            metaData: [...prev.metaData, { 
                title: '', 
                dataIndex: `field${prev.metaData.length}`,
                ...(componentType === 'Form' && { required: true, type: 'input' })
            }]
        }));
    };

    const handleFieldChange = (index: number, field: string, value: string) => {
        setComponentConfig(prev => {
            const newMetaData = [...prev.metaData];
            newMetaData[index] = { 
                ...newMetaData[index], 
                [field]: value,
                dataIndex: field === 'title' ? value.toLowerCase().replace(/\s+/g, '_') : newMetaData[index].dataIndex
            };
            return { ...prev, metaData: newMetaData };
        });
    };

    const handleDeleteField = (index: number) => {
        setComponentConfig(prev => ({
            ...prev,
            metaData: prev.metaData.filter((_, i) => i !== index)
        }));
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Component',
            content: 'Are you sure you want to delete this component? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No, Cancel',
            onOk() {
                if (config.data?.id) {
                    config.onDelete?.(config.data.id);
                    config.setVisible(true);
                }
            },
        });
    };

    const renderPreview = () => {
        switch (componentType) {
            case 'Table':
                return (
                    <BuilderTable
                        props={{
                            title: componentConfig.title,
                            metaData: componentConfig.metaData,
                            data: componentConfig.data || BILL_OF_MATERIAL_PROPS.data,
                            style: componentConfig.style
                        }}
                    />
                );
            case 'Form':
                return (
                    <BuilderForm
                        props={{
                            title: componentConfig.title,
                            metaData: componentConfig.metaData,
                            data: componentConfig.data || PRODUCT_DETAILS_PROPS.data,
                            style: componentConfig.style
                        }}
                    />
                );
            default:
                return <></>;
        }
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <header style={{
                width: '100%',
                height: '8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button style={{ padding: 5 }} size="small" onClick={() => config.setVisible(true)}><IoArrowBack size={15} /></Button>
                    <Title level={3} style={{ margin: 0 }}>{config?.data ? config.data.componentName : 'New Component'}</Title>
                    <Tag color='gold'>Component Editor</Tag>
                </div>
                <Space>
                    <Button type="text" onClick={() => setCopyModalVisible(true)}><CopyOutlined style={{ fontSize: '20px', color: '#000' }} /></Button>
                    {config.data && (
                        <Button type="text" onClick={handleDelete}><DeleteOutlined style={{ fontSize: '20px', color: '#000' }} /></Button>
                    )}
                    <Button>Preview</Button>
                    <Button>Save Draft</Button>
                    <Button type="primary" onClick={handleSave}>Save Component</Button>
                </Space>
            </header>
            <main style={{ display: 'flex', height: '92%' }}>
                <div style={{ width: '30%', height: '100%', borderRight: '1px solid #eee', padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
                    <Collapse
                        collapsible="header"
                        expandIconPosition="end"
                        defaultActiveKey={['1']}
                        style={{ border: '1px solid #eee', height: 'max-content' }}
                        items={[
                            {
                                key: '1',
                                label: 'Component Details',
                                styles: {
                                    header: {
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#333'
                                    },
                                },
                                children: (
                                    <Form form={form} layout="vertical">
                                        <Form.Item
                                            name="componentName"
                                            label="Component Name"
                                            rules={[{ required: true, message: 'Please enter component name' }]}
                                        >
                                            <Input disabled={config?.data} size="large" placeholder="e.g., Bill Of Material" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Component Type"
                                            rules={[{ required: true, message: 'Please select component type' }]}
                                        >
                                            <Radio.Group
                                                value={componentType}
                                                size="large"
                                                onChange={(e) => {
                                                    setComponentType(e.target.value);
                                                    // Set default data based on type
                                                    setComponentConfig(prev => ({
                                                        ...prev,
                                                        metaData: e.target.value === 'Table' ? 
                                                            BILL_OF_MATERIAL_PROPS.metaData : 
                                                            PRODUCT_DETAILS_PROPS.metaData,
                                                        data: e.target.value === 'Table' ? 
                                                            BILL_OF_MATERIAL_PROPS.data : 
                                                            PRODUCT_DETAILS_PROPS.data
                                                    }));
                                                }}
                                            >
                                                <Radio.Button value="Table">Table</Radio.Button>
                                                <Radio.Button value="Form">Form</Radio.Button>
                                                <Radio.Button value="Section">Section</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            name="description"
                                            label="Description"
                                            rules={[{ required: true, message: 'Please enter description' }]}
                                        >
                                            <TextArea
                                                size="large"
                                                placeholder="Brief description of this component"
                                            />
                                        </Form.Item>
                                    </Form>
                                ),
                            },
                        ]}
                    />

                    <Collapse
                        collapsible="header"
                        expandIconPosition="end"
                        defaultActiveKey={['1']}
                        style={{ border: '1px solid #eee', height: 'max-content' }}
                        items={[
                            {
                                key: '1',
                                label: 'Component Configuration',
                                styles: {
                                    header: {
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#333'
                                    },
                                },
                                children: (
                                    <Form layout="vertical">
                                        <Form.Item label="Title">
                                            <Input
                                                size='large'
                                                value={componentConfig.title}
                                                onChange={(e) => setComponentConfig(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Enter component title"
                                            />
                                        </Form.Item>

                                        {componentType === 'Form' && (
                                            <Form.Item label="Layout">
                                                <Input
                                                    size='large'
                                                    type="number"
                                                    min={1}
                                                    max={4}
                                                    value={componentConfig.style.form.column}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        setComponentConfig(prev => ({
                                                            ...prev,
                                                            style: {
                                                                ...prev.style,
                                                                form: {
                                                                    ...prev.style.form,
                                                                    column: value
                                                                }
                                                            }
                                                        }));
                                                    }}
                                                    placeholder="Number of columns"
                                                />
                                            </Form.Item>
                                        )}

                                        <Form.Item label="Fields">
                                            {componentConfig.metaData.map((field, index) => (
                                                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                    <Input
                                                        placeholder="Field Title"
                                                        value={field.title}
                                                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                                                    />
                                                    {componentType === 'Form' && (
                                                        <Select
                                                            style={{ width: 120 }}
                                                            value={field.type}
                                                            onChange={(value) => handleFieldChange(index, 'type', value)}
                                                            options={[
                                                                { label: 'Input', value: 'input' },
                                                                { label: 'TextArea', value: 'textarea' },
                                                                { label: 'Number', value: 'number' },
                                                                { label: 'Date', value: 'date' }
                                                            ]}
                                                        />
                                                    )}
                                                    <Button danger onClick={() => handleDeleteField(index)}>Delete</Button>
                                                </div>
                                            ))}
                                            <Button type="dashed" onClick={handleAddField} style={{ width: '100%' }}>
                                                Add Field
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                ),
                            },
                        ]}
                    />
                </div>

                <div style={{ width: '70%', height: '100%', borderRight: '1px solid #eee', padding: 10, boxSizing: 'border-box', overflow: 'auto' }}>
                    <Card title="Preview" style={{ height: '100%' }}>
                        {renderPreview()}
                    </Card>
                </div>
            </main>

            {/* Copy Component Modal */}
            <Modal
                title="Copy Component"
                open={copyModalVisible}
                onOk={handleCopyComponent}
                onCancel={() => {
                    setCopyModalVisible(false);
                    copyForm.resetFields();
                }}
                okText="Copy"
                cancelText="Cancel"
            >
                <Form
                    form={copyForm}
                    layout="vertical"
                    style={{ marginTop: 20 }}
                >
                    <Form.Item
                        name="componentName"
                        label="Component Name"
                        rules={[
                            { required: true, message: 'Please enter component name' },
                            { min: 3, message: 'Component name must be at least 3 characters' }
                        ]}
                        initialValue={config.data?.componentName ? `Copy of ${config.data.componentName}` : ''}
                    >
                        <Input placeholder="Enter component name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: 'Please enter component description' },
                            { min: 10, message: 'Description must be at least 10 characters' }
                        ]}
                        initialValue={config.data?.description || ''}
                    >
                        <TextArea
                            placeholder="Enter component description"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ComponentBuilder; 