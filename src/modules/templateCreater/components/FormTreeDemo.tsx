import React, { useState } from 'react';
import { Row, Col, Card, Form, Input, Select, Checkbox, DatePicker, Button, Divider } from 'antd';
import FormTreeView from './FormTreeData';

const { Option } = Select;
const { TextArea } = Input;

const FormTreeDemo: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 24, fontWeight: 600 }}>Form Builder with Tree Structure</h2>
      
      <Row gutter={24}>
        {/* Left column - Tree View */}
        <Col span={8}>
          <FormTreeView formData={{
            sections: [
              {
                id: 'personalInfo',
                title: 'Personal Information',
                fields: [
                  {
                    id: 'name',
                    type: 'text',
                    label: 'Full Name',
                    placeholder: 'Enter your full name',
                    required: true
                  },
                  {
                    id: 'email',
                    type: 'email',
                    label: 'Email Address',
                    placeholder: 'example@domain.com',
                    required: true,
                    validation: {
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    }
                  },
                  {
                    id: 'phone',
                    type: 'phone',
                    label: 'Phone Number',
                    placeholder: '+1 (555) 123-4567',
                    required: false
                  }
                ]
              },
              {
                id: 'addressGroup',
                title: 'Address Information',
                sections: [
                  {
                    id: 'homeAddress',
                    title: 'Home Address',
                    fields: [
                      {
                        id: 'street',
                        type: 'text',
                        label: 'Street Address',
                        placeholder: '123 Main St',
                        required: true
                      },
                      {
                        id: 'city',
                        type: 'text',
                        label: 'City',
                        required: true
                      },
                      {
                        id: 'state',
                        type: 'select',
                        label: 'State/Province',
                        required: true,
                        options: [
                          { label: 'California', value: 'CA' },
                          { label: 'New York', value: 'NY' },
                          { label: 'Texas', value: 'TX' }
                        ]
                      },
                      {
                        id: 'zip',
                        type: 'text',
                        label: 'ZIP/Postal Code',
                        required: true
                      }
                    ]
                  }
                ]
              },
              {
                id: 'preferences',
                title: 'User Preferences',
                fields: [
                  {
                    id: 'notifications',
                    type: 'checkbox',
                    label: 'Receive email notifications',
                    defaultValue: true
                  },
                  {
                    id: 'theme',
                    type: 'select',
                    label: 'UI Theme',
                    options: [
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' },
                      { label: 'System Default', value: 'system' }
                    ],
                    defaultValue: 'system'
                  }
                ]
              }
            ]
          }} />
        </Col>
        
        {/* Right column - Actual Form */}
        <Col span={16}>
          <Card
            title="Rendered Form"
            style={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              height: '100%'
            }}
          >
            <Form
              form={form}
              name="user_form"
              layout="vertical"
              initialValues={{
                notifications: true,
                theme: 'system'
              }}
              onFinish={onFinish}
            >
              {/* Personal Information */}
              <h3>Personal Information</h3>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="example@domain.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input placeholder="+1 (555) 123-4567" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Address Information - Home Address */}
              <h3>Home Address</h3>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="street"
                    label="Street Address"
                    rules={[{ required: true, message: 'Please enter your street address' }]}
                  >
                    <Input placeholder="123 Main St" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter your city' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="state"
                    label="State/Province"
                    rules={[{ required: true, message: 'Please select your state' }]}
                  >
                    <Select placeholder="Select state">
                      <Option value="CA">California</Option>
                      <Option value="NY">New York</Option>
                      <Option value="TX">Texas</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="zip"
                    label="ZIP/Postal Code"
                    rules={[{ required: true, message: 'Please enter your ZIP code' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* User Preferences */}
              <h3>User Preferences</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="notifications"
                    valuePropName="checked"
                  >
                    <Checkbox>Receive email notifications</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="theme"
                    label="UI Theme"
                  >
                    <Select>
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="system">System Default</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Submit Button */}
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ minWidth: 120 }}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FormTreeDemo; 