import React, { useState, useEffect } from 'react';
import { Button, Select, Typography, Divider, Card, Form, Input, Space } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { getComponents, getGroups, getSections } from '@services/templateService';

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
  { id: 'group', name: 'Group', description: 'Container for multiple sections' },
  { id: 'component', name: 'Component', description: 'Reusable component' },
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
  const [type, setType] = useState('component'); // Default to Component
  const [sectionValue, setSectionValue] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [componentData, setComponentData] = useState<any>([]);
  const [groupData, setGroupData] = useState<any>([]);
  const [sectionData, setSectionData] = useState<any>([]);
  
  // Form to collect all data
  const [form] = Form.useForm();
  
  // On mount, if type is 'component', load components but do not auto-select
  useEffect(() => {
    if (type === 'component') {
      (async () => {
        const components = await getComponents();
        const componentData = components.map((component: any) => ({
          key: component.componentLabel,
          value: component.componentLabel,
        }));
        setComponentData(componentData);
        // Do not set sectionValue or form.setFieldsValue here
      })();
    }
    if (type === 'section') {
      (async () => {
        const sections = await getSections();
        const sectionData = sections.map((section: any) => ({
          key: section.sectionLabel,
          value: section.sectionLabel,
        }));
        setSectionData(sectionData);
      })();
    }
    if (type === 'group') {
      (async () => {
        const groups = await getGroups();
        const groupData = groups.map((group: any) => ({
          key: group.groupLabel,
          value: group.groupLabel,
        }));
        setGroupData(groupData);
      })();
    }
  }, [type]);
  
  // Update form when selected row changes
  useEffect(() => {
    if (selectedRow) {
      const matchingType = sectionTypes.find(t => t.name === selectedRow.type);
      const typeId = matchingType ? matchingType.id : 'component';
      setType(typeId);
      if (typeId === 'component') {
        setSectionValue(selectedRow.section);
        form.setFieldsValue({ component: selectedRow.section });
      } else if (typeId === 'section') {
        const options = sectionOptions.section;
        const matchingSection = options.find(s => s.name === selectedRow.section);
        const sectionId = matchingSection ? matchingSection.id : '';
        setSectionValue(sectionId);
        form.setFieldsValue({ section: sectionId });
      } else if (typeId === 'group') {
        setSectionValue(selectedRow.section);
        form.setFieldsValue({ group: selectedRow.section });
      }
      setShowConfig(true);
      setIsEditMode(true);
      form.setFieldsValue({ type: typeId });
    }
  }, [selectedRow, form]);
  
  // Reset section when type changes
  useEffect(() => {
    if (!selectedRow) {
      setSectionValue('');
      form.setFieldsValue({ section: '', component: '', group: '' });
    }
  }, [type, form, selectedRow]);
  
  const handleTypeChange = async (value: string) => {
    setType(value);
    setSectionValue('');
    form.setFieldsValue({ section: '', component: '', group: '' });
    // Loading of options is handled by useEffect above
  };

  const handleSave = () => {
    const selectedType = sectionTypes.find(option => option.id === type)?.name || '';
    let selectedSection = '';
    if (type === 'component') {
      selectedSection = sectionValue;
    } else if (type === 'section') {
      selectedSection = sectionOptions.section.find(option => option.id === sectionValue)?.name || '';
    } else {
      selectedSection = sectionOptions.sectionGroup.find(option => option.id === sectionValue)?.name || '';
    }
    onAddRow(selectedType, selectedSection);
    if (onSave) {
      onSave();
    }
    setShowConfig(false);
    setIsEditMode(false);
    setSectionValue('');
    setType('component');
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
              initialValues={{ type: 'component' }}
            >

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

              {type === 'component' && (
                <Form.Item 
                  label={'Component'}
                  name="component"
                >
                  <Select 
                    value={sectionValue}
                    onChange={value => setSectionValue(value)} 
                    style={{ width: '100%' }}
                    placeholder={'select component'}
                    loading={componentData.length === 0}
                  >
                    {componentData.map(option => (
                      <Option key={option.key} value={option.value}>{option.value}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {type === 'section' && (
                <Form.Item 
                  label={'Section'}
                  name="section"
                >
                  <Select 
                    onChange={value => setSectionValue(value)} 
                    style={{ width: '100%' }}
                    placeholder={'select section'}
                  >
                    {sectionData.map(option => (
                      <Option key={option.key} value={option.value}>{option.value}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {type === 'group' && (
                <Form.Item 
                  label={'Group'}
                  name="group"
                >
                  <Select 
                    onChange={value => setSectionValue(value)} 
                    style={{ width: '100%' }}
                    placeholder={'select group'}
                  >
                    {groupData.map(option => (
                      <Option key={option.key} value={option.value}>{option.value}</Option>
                    ))}
                  </Select> 
                </Form.Item>
              )}
            </Form>
          </Card>

          <div style={{ display: 'flex' }}>
            <Button 
              type="primary"
              onClick={handleSave}
              style={{ 
                flex: 1,
                height: 30,
                background: '#005A60',
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