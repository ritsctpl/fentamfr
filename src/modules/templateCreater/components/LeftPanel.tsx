import React, { useState, useEffect } from 'react';
import { Button, Select, Typography, Divider, Card, Form, Input, Space } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

interface LeftPanelProps {
  onAddRow: (type: string, heading: string) => void;
  onSave?: () => void;
  selectedRow?: {
    id: number;
    section: string;
    type: string;
    heading: string;
  };
}

const sectionTypes = [
  { id: 'section', name: 'Section', description: 'Basic content section' },
  { id: 'sectionGroup', name: 'SectionGroup', description: 'Container for multiple sections' },
];

// Dummy section options based on type
const sectionOptions = {
  section: [
    { id: 'introduction', name: 'Introduction' },
    { id: 'mainContent', name: 'Main Content' },
    { id: 'details', name: 'Details' },
    { id: 'conclusion', name: 'Conclusion' },
  ],
  sectionGroup: [
    { id: 'userDetails', name: 'User Details' },
    { id: 'contactInfo', name: 'Contact Information' },
    { id: 'paymentDetails', name: 'Payment Details' },
    { id: 'orderSummary', name: 'Order Summary' },
  ]
};

const LeftPanel: React.FC<LeftPanelProps> = ({ onAddRow, onSave, selectedRow }) => {
  const [type, setType] = useState('section'); // Default to Section
  const [sectionValue, setSectionValue] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form to collect all data
  const [form] = Form.useForm();
  
  // Update form when selected row changes
  useEffect(() => {
    if (selectedRow) {
      // Find matching type from sectionTypes
      const matchingType = sectionTypes.find(t => t.name === selectedRow.type);
      const typeId = matchingType ? matchingType.id : 'section';
      setType(typeId);
      
      // Find matching section value
      const options = typeId === 'section' ? sectionOptions.section : sectionOptions.sectionGroup;
      const matchingSection = options.find(s => s.name === selectedRow.section);
      const sectionId = matchingSection ? matchingSection.id : '';
      setSectionValue(sectionId);
      
      // Show in edit mode
      setShowConfig(true);
      setIsEditMode(true);
      
      // Update form values
      form.setFieldsValue({
        type: typeId,
        sectionValue: sectionId
      });
    }
  }, [selectedRow, form]);
  
  // Reset section when type changes
  useEffect(() => {
    if (!selectedRow) {
      setSectionValue('');
      form.setFieldsValue({ sectionValue: '' });
    }
  }, [type, form, selectedRow]);
  
  const handleTypeChange = (value: string) => {
    setType(value);
    setSectionValue('');
    form.setFieldsValue({ sectionValue: '' });
  };
  
  const handleAddRow = () => {
    // Reset form before showing
    form.resetFields();
    setType('section');
    setSectionValue('');
    
    // Show configuration fields
    setShowConfig(true);
    setIsEditMode(false);
  };

  const handleSave = () => {
    const selectedType = sectionTypes.find(option => option.id === type)?.name || '';
    const selectedSection = type === 'section' 
      ? sectionOptions.section.find(option => option.id === sectionValue)?.name || ''
      : sectionOptions.sectionGroup.find(option => option.id === sectionValue)?.name || '';
    
    // Create the row with collected data
    onAddRow(selectedType, selectedSection);
    
    // Call parent save if needed
    if (onSave) {
      onSave();
    }
    
    // Reset the form and hide config
    setShowConfig(false);
    setIsEditMode(false);
    setSectionValue('');
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px 16px' }}>
          <Card 
            title={isEditMode ? "Edit Row Configuration" : "New Row Configuration"}
            size="small"
            style={{ marginBottom: 20 }}
            headStyle={{ background: isEditMode ? '#e6f7ff' : '#f0f4f8' }}
            extra={isEditMode && <EditOutlined style={{ color: '#1976d2' }} />}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ type: 'section' }}
            >
              {/* <Form.Item label="Template Name" name="templateName">
                <Input placeholder="Enter template name" />
              </Form.Item>

              <Form.Item label="Version" name="version">
                <Input placeholder="Enter version number" />
              </Form.Item> */}

              <Form.Item label="Type" name="type">
                <Select 
                  value={type} 
                  onChange={handleTypeChange}
                  style={{ width: '100%' }}
                >
                  {sectionTypes.map(option => (
                    <Option key={option.id} value={option.id}>{option.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label={type === 'section' ? 'Section' : 'Section Group'} 
                name="sectionValue"
              >
                <Select 
                  value={sectionValue} 
                  onChange={value => setSectionValue(value)} 
                  style={{ width: '100%' }}
                  placeholder={`Select ${type === 'section' ? 'section' : 'section group'}`}
                >
                  {(type === 'section' ? sectionOptions.section : sectionOptions.sectionGroup).map(option => (
                    <Option key={option.id} value={option.id}>{option.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button 
              onClick={() => {
                setShowConfig(false);
                setIsEditMode(false);
              }}
              style={{
                flex: 1,
                height: 40,
              }}
            >
              Cancel
            </Button>
            
            <Button 
              type="primary"
              onClick={handleSave}
              style={{ 
                flex: 1,
                height: 40,
                background: '#005A60',
                // borderColor: '#43a047'
              }}
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
      <Divider style={{ margin: '16px 0' }} />
    </div>
  );
};

export default LeftPanel; 