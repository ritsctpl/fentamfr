import React from 'react';
import { Form, Input, DatePicker, InputNumber, Table, Card, Divider } from 'antd';
import moment from 'moment';

interface Component {
  _id: string;
  site?: string;
  componentLabel: string;
  dataType: string;
  unit?: string;
  defaultValue?: string;
  required: boolean;
  validation?: string;
  apiUrl?: string;
  active?: number;
  userId?: string;
  createdDateTime?: string;
  _class?: string;
  handle?: string;
  tableConfig?: {
    isTable?: boolean;
    columns?: any[];
    data?: any[];
  };
}

interface Section {
  _id: string;
  site?: string;
  sectionLabel: string;
  instructions?: string;
  effectiveDateTime?: string;
  componentIds?: Component;
  active?: number;
  createdDateTime?: string;
  modifiedDateTime?: string;
  _class?: string;
  components: Component[];
  isTable?: boolean;
}

interface Group {
  _id: string;
  site?: string;
  groupLabel: string;
  sectionIds: Section[];
  userId?: string;
  active?: number;
  createdDateTime?: string;
  modifiedDateTime?: string;
  createdBy?: string;
  modifiedBy?: string;
  _class?: string;
}

interface PreviewContentProps {
  previewData: (Group | Section | Component)[];
}

const PreviewContent: React.FC<PreviewContentProps> = ({ previewData }) => {
  const [form] = Form.useForm();

  const renderTableComponent = (component: Component) => {
    if (!component.tableConfig?.columns || !component.tableConfig?.data) {
      return null;
    }

    return (
      <div key={component._id} style={{ marginBottom: 16 }}>
        <h3>{component.componentLabel}</h3>
        <Table
          columns={component.tableConfig.columns}
          dataSource={component.tableConfig.data}
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  const renderFormComponent = (component: Component) => {
    const { componentLabel, dataType, unit, defaultValue, required } = component;
    const label = unit ? `${componentLabel} (${unit})` : componentLabel;

    switch (dataType) {
      case 'Input':
        return (
          <Form.Item
            key={component._id}
            label={label}
            name={component._id}
            rules={[{ required: required }]}
            initialValue={defaultValue}
          >
            <Input placeholder={`Enter ${componentLabel}`} />
          </Form.Item>
        );
      case 'Decimal':
        return (
          <Form.Item
            key={component._id}
            label={label}
            name={component._id}
            rules={[{ required: required }]}
            initialValue={defaultValue ? parseFloat(defaultValue) : null}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`Enter ${componentLabel}`}
              step="0.01"
            />
          </Form.Item>
        );
      case 'Integer':
        return (
          <Form.Item
            key={component._id}
            label={label}
            name={component._id}
            rules={[{ required: required }]}
            initialValue={defaultValue ? parseInt(defaultValue) : null}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`Enter ${componentLabel}`}
              precision={0}
            />
          </Form.Item>
        );
      case 'DatePicker':
        return (
          <Form.Item
            key={component._id}
            label={label}
            name={component._id}
            rules={[{ required: required }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              showTime={false}
            />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            key={component._id}
            label={label}
            name={component._id}
            rules={[{ required: required }]}
            initialValue={defaultValue}
          >
            <Input placeholder={`Enter ${componentLabel}`} />
          </Form.Item>
        );
    }
  };

  const renderComponent = (component: Component) => {
    if (component.tableConfig?.isTable) {
      return renderTableComponent(component);
    }
    return renderFormComponent(component);
  };

  const renderSection = (section: Section) => {
    const isTableSection = section.components.some(comp => comp.tableConfig?.isTable);

    if (isTableSection) {
      return (
        <Card
          key={section._id}
          title={section.sectionLabel}
          style={{ marginBottom: 16 }}
          extra={section.effectiveDateTime && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              Effective: {moment(section.effectiveDateTime).format('YYYY-MM-DD')}
            </span>
          )}
        >
          {section.instructions && (
            <div style={{ marginBottom: 16, color: '#666' }}>
              <strong>Instructions:</strong> {section.instructions}
            </div>
          )}
          {section.components.map(component => renderTableComponent(component))}
        </Card>
      );
    }

    return (
      <Card
        key={section._id}
        title={section.sectionLabel}
        style={{ marginBottom: 16 }}
        extra={section.effectiveDateTime && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            Effective: {moment(section.effectiveDateTime).format('YYYY-MM-DD')}
          </span>
        )}
      >
        {section.instructions && (
          <div style={{ marginBottom: 16, color: '#666' }}>
            <strong>Instructions:</strong> {section.instructions}
          </div>
        )}
        {section.components.map(component => renderFormComponent(component))}
      </Card>
    );
  };

  const renderGroup = (group: Group) => {
    return (
      <div key={group._id}>
        {group.sectionIds?.map((section) => renderSection(section))}
      </div>
    );
  };

  const renderItem = (item: Group | Section | Component) => {
    if ('groupLabel' in item && 'sectionIds' in item) {
      return renderGroup(item as Group);
    } else if ('sectionLabel' in item && 'components' in item) {
      return renderSection(item as Section);
    } else if ('componentLabel' in item && 'dataType' in item) {
      return renderComponent(item as Component);
    }
    return null;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: '100%' }}
      >
        {previewData?.map((item, index) => (
          <React.Fragment key={`${item._id}-${index}`}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </Form>
    </div>
  );
};

export default PreviewContent; 