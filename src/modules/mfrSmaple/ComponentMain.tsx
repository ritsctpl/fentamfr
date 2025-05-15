'use client'
import { Button, Input, message, Modal, Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import CommonTable from '@modules/buyOff/components/CommonTable';
import ComponentBuilder from './components/builder/ComponentBuilder';
import CommonAppBar from '@components/CommonAppBar';
import { BILL_OF_MATERIAL_PROPS, PRODUCT_DETAILS_PROPS } from './constants/builderConstants';

interface Component {
  id: number;
  componentName: string;
  description: string;
  type: 'Table' | 'Form' | 'Section';
  updatedDate: string;
  config: {
    title: string;
    metaData: any[];
    data: any[];
    style: {
      heading: {
        titleAlign: 'left' | 'center' | 'right';
      };
      table?: {
        column?: number;
      };
      form?: {
        column: number;
      };
    };
  };
}

function ComponentMain() {
  const [components, setComponents] = useState<Component[]>([]);
  const [addComponent, setAddComponent] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [data, setData] = useState<Component | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [createForm] = Form.useForm();
  const [call, setCall] = useState(0);

  // Sample dummy data using constants
  const DUMMY_COMPONENTS: Component[] = [
    // {
    //   id: 1,
    //   componentName: "Bill Of Material",
    //   description: "A table component for bill of materials",
    //   type: "Table",
    //   updatedDate: new Date().toLocaleDateString(),
    //   config: BILL_OF_MATERIAL_PROPS
    // },
    // {
    //   id: 2,
    //   componentName: "Product Details",
    //   description: "A form component for product details",
    //   type: "Form",
    //   updatedDate: new Date().toLocaleDateString(),
    //   config: PRODUCT_DETAILS_PROPS
    // }
  ];

  useEffect(() => {
    const savedComponents = localStorage.getItem('components');
    if (savedComponents) {
      setComponents(JSON.parse(savedComponents));
    } else {
      // Load dummy data if no saved components
      setComponents(DUMMY_COMPONENTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('components', JSON.stringify(components));
  }, [components]);

  const handleCreateComponent = async () => {
    try {
      const values = await createForm.validateFields();
      const newComponent: Component = {
        id: Date.now(),
        componentName: values.componentName,
        description: values.description,
        type: values.type,
        updatedDate: new Date().toLocaleDateString(),
        config: {
          title: values.componentName,
          metaData: [],
          data: [],
          style: {
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
        }
      };

      setComponents(prev => [...prev, newComponent]);
      setData(newComponent);
      setCreateModalVisible(false);
      setAddComponent(true);
      createForm.resetFields();
      message.success('Component created successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSaveComponent = (componentData: any) => {
    if (!data) return;

    // Check if this is a copy operation
    if (componentData.isCopy) {
        // For copy, add as a new component
        const newComponent: Component = {
            ...componentData,
            id: Date.now() // Ensure unique ID
        };
        setComponents(prev => [...prev, newComponent]);
        message.success('Component copied successfully!');
    } else {
        // For regular save, update existing component
        const updatedComponent: Component = {
            ...data,
            ...componentData
        };
        setComponents(prev => prev.map(c => c.id === data.id ? updatedComponent : c));
        message.success('Component updated successfully!');
    }
    
    setAddComponent(false);
    setData(null);
  };

  const handleDeleteComponent = (componentId: number) => {
    setComponents(prev => prev.filter(c => c.id !== componentId));
    setAddComponent(false);
    setData(null);
    message.success('Component deleted successfully!');
  };

  const handleCloseBuilder = () => {
    setAddComponent(false);
    setData(null);
  };

  const filteredComponents = components.filter(component =>
    component.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CommonAppBar
        onSearchChange={() => { }}
        allActivities={[]}
        username={'test'}
        site={null}
        appTitle={'Component Builder'}
        onSiteChange={() => setCall(call + 1)}
      />
      <div style={{ width: '100%', height: 'calc(100vh - 50px)', display: 'flex' }}>
        <div style={{
          width: addComponent ? '0%' : '100%',
          height: '100%',
          transition: 'width 0.3s ease-in-out',
          display: addComponent ? 'none' : 'block'
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
              placeholder='Search components...'
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
            Components ({filteredComponents.length})
            <Button
              onClick={() => setCreateModalVisible(true)}
              type='text'
              shape='circle'
            >
              <PlusOutlined style={{ fontSize: '20px', color: '#000' }} />
            </Button>
          </div>
          <CommonTable
            data={filteredComponents.map((component) => ({
              title: component.componentName,
              description: component.description,
              type: component.type,
              id: component.id
            }))}
            onRowSelect={(row) => {
              const selectedComponent = components.find((component) => component.id === row.id);
              setData(selectedComponent || null);
              setAddComponent(true);
            }}
          />
        </div>
        <div style={{
          width: addComponent ? '100%' : '0%',
          height: '100%',
          transition: 'width 0.3s ease-in-out',
          display: addComponent ? 'block' : 'none'
        }}>
          <ComponentBuilder
            config={{
              isVisible: addComponent,
              setVisible: handleCloseBuilder,
              data,
              onSave: handleSaveComponent,
              onDelete: handleDeleteComponent,
              permitive: 'edit'
            }}
          />
        </div>

        {/* Create Component Modal */}
        <Modal
          title="Create New Component"
          open={createModalVisible}
          onOk={handleCreateComponent}
          onCancel={() => {
            setCreateModalVisible(false);
            createForm.resetFields();
          }}
          okText="Create"
          cancelText="Cancel"
        >
          <Form
            form={createForm}
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
            >
              <Input placeholder="Enter component name" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[
                { required: true, message: 'Please select component type' }
              ]}
            >
              <Select
                placeholder="Select component type"
                options={[
                  { label: 'Table', value: 'Table' },
                  { label: 'Form', value: 'Form' },
                  { label: 'Section', value: 'Section' }
                ]}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter component description' },
                { min: 10, message: 'Description must be at least 10 characters' }
              ]}
            >
              <Input.TextArea
                placeholder="Enter component description"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default ComponentMain;
