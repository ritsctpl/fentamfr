import React from 'react';
import { Card, Typography, Tree, Tooltip } from 'antd';
import { 
  FormOutlined, 
  EditOutlined,
  FileTextTwoTone,
  FontSizeOutlined,
  CheckSquareOutlined,
  SelectOutlined,
  NumberOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UserOutlined,
  DownOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { FormFieldNode, FormSection, FormGroupSection, FormTreeData, FormTreeViewProps } from '../types/formTreeTypes';

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

// Helper to get icon based on field type
const getFieldIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'text':
      return <EditOutlined />;
    case 'textarea':
      return <FontSizeOutlined />;
    case 'checkbox':
      return <CheckSquareOutlined />;
    case 'select':
      return <SelectOutlined />;
    case 'number':
      return <NumberOutlined />;
    case 'date':
      return <CalendarOutlined />;
    case 'email':
      return <MailOutlined />;
    case 'phone':
      return <PhoneOutlined />;
    case 'password':
      return <LockOutlined />;
    case 'user':
      return <UserOutlined />;
    default:
      return <BuildOutlined />;
  }
};

// Process field node to tree node
const processField = (field: FormFieldNode, parentKey: string): any => {
  const fieldKey = `${parentKey}-field-${field.id}`;
  
  // Field node
  const treeNode = {
    title: (
      <Tooltip title={field.required ? 'Required field' : 'Optional field'}>
        <span>
          {field.label}
          {field.required && <span style={{ color: '#ff4d4f', marginLeft: 5 }}>*</span>}
          {field.placeholder && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({field.placeholder})
            </Text>
          )}
        </span>
      </Tooltip>
    ),
    key: fieldKey,
    icon: getFieldIcon(field.type),
    isLeaf: !field.children || field.children.length === 0,
    children: []
  };

  // Process validation if exists
  if (field.validation) {
    treeNode.children.push({
      title: 'Validation Rules',
      key: `${fieldKey}-validation`,
      icon: <FileTextTwoTone twoToneColor="#52c41a" />,
      isLeaf: true,
    });
  }

  // Process options for select fields
  if (field.options && field.options.length > 0) {
    treeNode.children.push({
      title: `Options (${field.options.length})`,
      key: `${fieldKey}-options`,
      icon: <SelectOutlined />,
      children: field.options.map((option, idx) => ({
        title: `${option.label} (${option.value})`,
        key: `${fieldKey}-option-${idx}`,
        isLeaf: true,
      }))
    });
  }

  // Process nested fields if they exist
  if (field.children && field.children.length > 0) {
    field.children.forEach((child, index) => {
      treeNode.children.push(processField(child, `${fieldKey}-${index}`));
    });
  }

  return treeNode;
};

// Process section to tree node
const processSection = (section: FormSection, index: number): any => {
  const sectionKey = `section-${section.id}`;
  
  return {
    title: section.title,
    key: sectionKey,
    icon: <FileTextTwoTone />,
    children: section.fields.map((field, fieldIndex) => 
      processField(field, `${sectionKey}-${fieldIndex}`)
    )
  };
};

// Process group section
const processGroupSection = (groupSection: FormGroupSection, index: number): any => {
  const groupKey = `group-${groupSection.id}`;
  
  return {
    title: groupSection.title,
    key: groupKey,
    icon: <AppstoreOutlined />,
    children: groupSection.sections.map((section, sectionIndex) => {
      const sectionKey = `${groupKey}-section-${section.id}`;
      
      return {
        title: section.title,
        key: sectionKey,
        icon: <FileTextTwoTone />,
        children: section.fields.map((field, fieldIndex) => 
          processField(field, `${sectionKey}-${fieldIndex}`)
        )
      };
    })
  };
};

// Generate tree data
const generateFormTreeData = (formData: FormTreeData) => {
  if (!formData.sections || formData.sections.length === 0) {
    return [];
  }

  // Root node
  const rootNode = {
    title: 'Form Structure',
    key: 'form',
    icon: <FormOutlined />,
    children: []
  };

  // Process all sections
  formData.sections.forEach((section, index) => {
    if ('sections' in section) {
      // It's a group section
      rootNode.children.push(processGroupSection(section, index));
    } else {
      // It's a regular section
      rootNode.children.push(processSection(section, index));
    }
  });

  return [rootNode];
};

// Example data structure
const exampleFormData: FormTreeData = {
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
        },
        {
          id: 'workAddress',
          title: 'Work Address (Optional)',
          fields: [
            {
              id: 'workStreet',
              type: 'text',
              label: 'Street Address',
              required: false
            },
            {
              id: 'workCity',
              type: 'text',
              label: 'City',
              required: false
            },
            {
              id: 'workState',
              type: 'select',
              label: 'State/Province',
              required: false,
              options: [
                { label: 'California', value: 'CA' },
                { label: 'New York', value: 'NY' },
                { label: 'Texas', value: 'TX' }
              ]
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
        },
        {
          id: 'accountType',
          type: 'select',
          label: 'Account Type',
          required: true,
          options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' },
            { label: 'Education', value: 'education' }
          ]
        }
      ]
    }
  ]
};

const FormTreeView: React.FC<FormTreeViewProps> = ({ formData = exampleFormData }) => {
  const treeData = generateFormTreeData(formData);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>(['form']);

  const onExpand = (expandedKeysValue: string[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <BranchesOutlined style={{ fontSize: 16, marginRight: 8, color: '#1976d2' }} />
        <Title level={5} style={{ margin: 0 }}>Form Structure</Title>
      </div>
      
      <Card
        style={{ 
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <DirectoryTree
          showIcon
          defaultExpandAll
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          switcherIcon={<DownOutlined />}
          treeData={treeData}
        />
      </Card>
    </div>
  );
};

export default FormTreeView; 