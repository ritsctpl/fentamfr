import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Modal, Tooltip, Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { IntervalSchedulerConfig } from '../types/schedulerTypes';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment'; // Import moment
import CronExpressionBuilder from './cronParser';

interface SchedulerFormProps {
  form: any;
  editStepMode: boolean;
  editingStep: IntervalSchedulerConfig | null;
  onSave: (values: IntervalSchedulerConfig) => void;
  onCancel: () => void;
  disableTab: boolean;
}

const SchedulerForm: React.FC<SchedulerFormProps> = ({
  form,
  editStepMode,
  editingStep,
  onSave,
  onCancel,
  disableTab,
}) => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [cronExpression, setCronExpression] = useState('');
  const [entityType, setEntityType] = useState(''); // State for entityType
  const [loading, setLoading] = useState(false);

  // Initialize cronExpression when form or editingStep changes
  useEffect(() => {
    if (editingStep) {
      form.setFieldsValue(editingStep);
      setCronExpression(editingStep.cronExpression || '');
      setEntityType(editingStep.entityType || '');
    }
  }, [editingStep]);

  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values); // Pass the validated form values back to the parent component
    } catch (error) {
      message.error(t('Failed to save step. Please try again.'));
    }
  };

  // Modal visibility toggle
  const showModal = () => {
    setVisible(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };
  const handleCancel = () => setVisible(false);

  // Handle values change in the form (entityType change)
  const handleValuesChange = (changedValues: any) => {
    if (changedValues.entityType) {
      setEntityType(changedValues.entityType);
    }
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      initialValues={editingStep || {}}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        name="entityName"
        label={t('Entity Name')}
        rules={[{ required: true, message: t('Please input the entity name!') }]}
      >
        <Input 
          disabled={disableTab}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
            e.target.value = value;
            form.setFieldsValue({ entityName: value });
          }}
        />
      </Form.Item>

      <Form.Item
        name="entityType"
        label={t('Entity Type')}
        rules={[{ required: true, message: t('Please input the entity type!') }]}
      >
        <Select disabled={disableTab} placeholder={t('Please select an entity type')}>
          <Select.Option value="CRONO">{t('Crono')}</Select.Option>
          <Select.Option value="INTERVAL">{t('Interval')}</Select.Option>
        </Select>
      </Form.Item>
  

      {/* Conditionally render Event Interval Seconds if entityType is INTERVAL */}
      {entityType === 'INTERVAL' && (
        <Form.Item
          name="eventIntervalSeconds"
          label={t('Event Interval Seconds')}
          rules={[{ required: true, message: t('Please input the event interval seconds!') }]}
        >
          <InputNumber
            disabled={disableTab}
            min={1}
            type="number"
            style={{ width: '100%' }}
            onChange={(value) => form.setFieldsValue({ eventIntervalSeconds: value || 0 })}
          />
        </Form.Item>
      )}

      {/* Conditionally render Cron Expression if entityType is CRONO */}
      {entityType === 'CRONO' && (
        <Form.Item
          label={t('Cron Expression')}
          name="cronExpression"
          rules={[{
            required: entityType === "CRONO" && !cronExpression,
            message: t('Cron expression is required for CRONO with eventIntervalSeconds = 0.'),
          }]}
        >
          <Input
            disabled={disableTab}
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            placeholder={t('Enter cron expression')}
            suffix={
              <Tooltip title={t('Set Cron Expression')}>
                <Button
                  disabled={disableTab}
                  icon={<InfoCircleOutlined />}
                  onClick={showModal}
                  type="link"
                  style={{ padding: 0 }}
                />
              </Tooltip>
            }
          />
        </Form.Item>
      )}

      <Modal
        title={t('Set Cron Expression')}
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {t('Cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.setFieldsValue({ cronExpression });
              handleCancel();
            }}
          >
            {t('Set Cron')}
          </Button>,
        ]}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <CronExpressionBuilder setCronExpressions={setCronExpression} cronExpressions={cronExpression} visible={visible} />
        )}
      </Modal>
      <Form.Item name="enabled" label={t('Enabled')} valuePropName="checked">
        <Switch disabled={disableTab} />
      </Form.Item>

      <Form.Item name="includeRunTime" label={t('Include Run Time')} valuePropName="checked">
        <Switch disabled={disableTab} />
      </Form.Item>

      <Form.Item
        name="apiEndpoint"
        label={t('API Endpoint')}
        rules={[{
          required: true,
          message: t('API Endpoint'),
        }]}
      >
        <Input disabled={disableTab} />
      </Form.Item>

      <Form.Item
        name="apiInput"
        label={t('API Input')}
        rules={[
          {
            required: true,
            message: t('API Input'),
          },
         
        ]}
      >
        <Input.TextArea 
          disabled={disableTab}
          rows={4}
          placeholder="{}"
          style={{ fontFamily: 'monospace' }}
          onBlur={(e) => {
            try {
              const formatted = JSON.stringify(JSON.parse(e.target.value), null, 2);
              form.setFieldsValue({ apiInput: formatted });
            } catch (error) {
              // If invalid JSON, leave as-is
            }
          }}
        />
      </Form.Item>

    </Form>
  );
};

export default SchedulerForm;
