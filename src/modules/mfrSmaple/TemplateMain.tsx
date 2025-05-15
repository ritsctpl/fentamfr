'use client'
import { Button, Input, message, Modal, Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import './TemplateMain.css';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import CommonTable from '@modules/buyOff/components/CommonTable';
import TemplateBuilder from './components/builder/TemplateBuilder';
import { TEMPLATE_TYPES } from './constants/builderConstants';
import CommonAppBar from '@components/CommonAppBar';

export interface Template {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  version: any;
  product: string;
  updatedDate: string;
  components: {
    header: any[];
    main: any[];
    footer: any[];
  };
  configurationState?: {
    [key: string]: {
      componentType: string;
      dataConnection: 'api' | 'database';
      config: any;
      isConfigured: boolean;
    };
  };
}

function TemplateMain() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [addTemplate, setAddTemplate] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [data, setData] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [createForm] = Form.useForm();
  const [call, setCall] = useState(0);
  const PRODUCTS = [
    { label: 'Baby Washes', value: 'Baby Washes' },
    { label: 'Baby Lotions', value: 'Baby Lotions' },
    { label: 'Baby Oils', value: 'Baby Oils' }
  ];
  const CATEGORIES = [
    { label: 'Liquid', value: 'Liquid' },
    { label: 'Pharmaceutical', value: 'Pharmaceutical' },
    { label: 'Gel', value: 'Gel' }
  ];

  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    // console.log(JSON.parse(savedTemplates), 'savedTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  const handleCreateTemplate = async () => {
    try {
      const values = await createForm.validateFields();
      const newTemplate: Template = {
        id: Date.now(),
        title: values.title,
        description: values.description,
        type: values.type,
        category: values.category,
        version: values.version,
        product: values.product,
        updatedDate: new Date().toLocaleDateString(),
        components: {
          header: [],
          main: [],
          footer: []
        },
        configurationState: {}
      };

      setTemplates(prev => [...prev, newTemplate]);
      setData(newTemplate);
      setCreateModalVisible(false);
      setAddTemplate(true);
      createForm.resetFields();
      message.success('Template created successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSaveTemplate = (templateData: any) => {
    if (!data) return;

    const updatedTemplate: Template = {
      ...data,
      components: templateData.components,
      configurationState: templateData.configurationState
    };

    setTemplates(prev => prev.map(t => t.id === data.id ? updatedTemplate : t));
    message.success('Template updated successfully!');
    setAddTemplate(false);
    setData(null);
  };

  const handleDeleteTemplate = (templateId: number) => {
    Modal.confirm({
      title: 'Delete Template',
      content: 'Are you sure you want to delete this template?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        setAddTemplate(false);
        setData(null);
        message.success('Template deleted successfully!');
      },
    });
  };

  const handleCloseBuilder = () => {
    setAddTemplate(false);
    setData(null);
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CommonAppBar
        onSearchChange={() => { }}
        allActivities={[]}
        username={'test'}
        site={null}
        appTitle={'Template Builder'} onSiteChange={function (newSite: string): void {
          setCall(call + 1);
        }} />
      <div style={{ width: '100%', height: 'calc(100vh - 50px)', display: 'flex' }}>

        <div style={{
          width: addTemplate ? '0%' : '100%',
          height: '100%',
          transition: 'width 0.3s ease-in-out',
          display: addTemplate ? 'none' : 'block'
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
            Templates ({filteredTemplates.length})
            <Button
              onClick={() => setCreateModalVisible(true)}
              type='text'
              shape='circle'
            >
              <PlusOutlined style={{ fontSize: '20px', color: '#000' }} />
            </Button>
          </div>
          <CommonTable
            data={filteredTemplates.map((template) => ({
              title: template.title,
              description: template.description,
              type: template.type,
              product: template.product,
              id: template.id
            }))}
            onRowSelect={(row) => {
              const selectedTemplate = templates.find((template) => template.id === row.id);
              setData(selectedTemplate || null);
              setAddTemplate(true);
            }}
          />
        </div>
        <div style={{
          width: addTemplate ? '100%' : '0%',
          height: '100%',
          transition: 'width 0.3s ease-in-out',
          display: addTemplate ? 'block' : 'none'
        }}>
          <TemplateBuilder
            config={{
              isVisible: addTemplate,
              setVisible: handleCloseBuilder,
              data,
              onSave: handleSaveTemplate,
              onDelete: handleDeleteTemplate
            }}
          />
        </div>

        {/* Create Template Modal */}
        <Modal
          title="Create New Template"
          open={createModalVisible}
          onOk={handleCreateTemplate}
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
              name="title"
              label="Template Name"
              rules={[
                { required: true, message: 'Please enter template name' },
                { min: 3, message: 'Template name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter template name" />
            </Form.Item>

            <Form.Item
              name="version"
              label="Version"
              rules={[
                { required: true, message: 'Please enter template name' },
                { message: 'version name must be' }
              ]}
            >
              <Input placeholder="Enter template name" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[
                { required: true, message: 'Please select template type' }
              ]}
            >
              <Select placeholder="Select template type" options={TEMPLATE_TYPES} />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[
                { required: true, message: 'Please select template category' }
              ]}
            >
              <Select placeholder="Select template category" options={CATEGORIES} />
            </Form.Item>

            <Form.Item
              name="product"
              label="Product"
              rules={[
                { required: true, message: 'Please enter product name' }
              ]}
            >
              <Select placeholder="Select product" options={PRODUCTS} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter template description' },
                { min: 10, message: 'Description must be at least 10 characters' }
              ]}
            >
              <Input.TextArea
                placeholder="Enter template description"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default TemplateMain;