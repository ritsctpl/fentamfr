import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, DatePicker, message, Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';
import { fetchAllDefaultOperation, fetchTop50DefaultOperation } from '@services/podMaintenanceService';

interface FormValues {
  [key: string]: any;
  resource: string;
  description: string;
  status: string;
  defaultOperation: string;
  processResource: boolean;
  erpEquipmentNumber: string;
  erpPlantMaintenanceOrder: string;
  validFrom: string;
  validTo: string;
}

interface OperationData {
  id: number;
  operation: string;
  revision: string;
  description: string;
  status: string;
  operationType: string;
}

interface ResourceDynamicFormProps {
  data: any;
  fields: string[];
  onValuesChange: (changedValues: any) => void;
}

const { Option } = Select;
const statusOptions = [
  { value: 'Enabled', label: 'Enabled' },
  { value: 'Disabled', label: 'Disabled' }
];

const ResourceDynamicForm: React.FC<ResourceDynamicFormProps> = ({ data, fields, onValuesChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { formData, setFormData } = useContext(ResourceContext);
  const [operationVisible, setOperationVisible] = useState(false);
  const [OperationData, setOperationData] = useState<OperationData[]>([]);

  useEffect(() => {
    if (data || formData) {
      form.setFieldsValue({
        ...data,
        validFrom: data.validFrom ? dayjs(data.validFrom, 'DD-MM-YYYY') : null,
        validTo: data.validTo ? dayjs(data.validTo, 'DD-MM-YYYY') : null,
      });
    }
  }, [data, form]);

  const validateDates = () => {
    const validFrom = form.getFieldValue('validFrom');
    const validTo = form.getFieldValue('validTo');

    if (validFrom && validTo) {
      const fromDate = dayjs(validFrom, 'DD-MM-YYYY');
      const toDate = dayjs(validTo, 'DD-MM-YYYY');

      if (toDate.isBefore(fromDate)) {
        message.error('Valid To date must be after Valid From date.');
        return false; 
      }
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");
    
    const patterns: { [key: string]: RegExp } = {
      resource: /[^A-Z0-9_\-\(\)]*$/,
      defaultOperation: /[^A-Z0-9_\-\(\)]*$/,
    };

    if (key === 'resource' || key === 'defaultOperation') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, '');
    }

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
      onValuesChange({ [key]: newValue });
    }
  };

  const handleDateChange = (date: Dayjs | null, key: string) => {
    const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
    if (key === 'validFrom' || key === 'validTo') {
      validateDates();
    }
    onValuesChange({ [key]: formattedDate });
  };

  const disabledDate = (current) => {
    const validFrom = form.getFieldValue('validFrom');
    if (!validFrom) {
      return false; 
    }
    const fromDate = dayjs(validFrom, 'DD-MM-YYYY');
    return current && current.isBefore(fromDate, 'day');
  };

  const handleSwitchChange = (checked: boolean, key: string) => {
    form.setFieldsValue({ [key]: checked });
    onValuesChange({ [key]: checked });
  };

  const handleSubmit = async (values: FormValues) => {
    if (validateDates()) {
      setFormData(values);
    }
  };

  const handleOperationClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('defaultOperation');
    const newValue = { operation: typedValue };

    try {
      let response;
      if (typedValue) {
        response = await fetchAllDefaultOperation(site, newValue);
      } else {
        response = await fetchTop50DefaultOperation(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.operationList.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setOperationData(formattedData);
      } else {
        setOperationData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setOperationVisible(true);
  };

  const handleOperationOk = (selectedRow: OperationData | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        defaultOperation: selectedRow.operation,
      });
      onValuesChange({
        defaultOperation: selectedRow.operation,
      });
    }
    setOperationVisible(false);
  };

  const handleCancel = () => {
    setOperationVisible(false);
  };

  const operationColumn = [
    {
      title: t("operation"),
      dataIndex: "operation",
      key: "operation",
    },
    {
      title: t("revision"),
      dataIndex: "revision",
      key: "revision",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("operationType"),
      dataIndex: "operationType",
      key: "operationType",
    },
  ];

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={handleSubmit}
      onValuesChange={(changedValues) => {
        if (changedValues.validFrom || changedValues.validTo) {
          validateDates();
        }
        onValuesChange({ ...changedValues });
      }}
      style={{ width: '100%' }}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) return null;

        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

        if (key === 'status') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} rules={[{ required: true, message: `Please select ${formattedKey}` }]}>
              <Select defaultValue={value}>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'validFrom' || key === 'validTo') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <DatePicker
                format="DD-MM-YYYY"
                onChange={(date) => handleDateChange(date, key)}
                disabledDate={key === 'validTo' ? disabledDate : undefined}
              />
            </Form.Item>
          );
        }

        if (key === 'processResource') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} valuePropName="checked">
              <Switch defaultChecked={value} onChange={(checked) => handleSwitchChange(checked, key)} />
            </Form.Item>
          );
        }

        if (key === 'defaultOperation') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Input
                suffix={<GrChapterAdd onClick={handleOperationClick} />}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'resource' || key === 'description' || key === 'erpEquipmentNumber' || key === 'erpPlantMaintenanceOrder') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} rules={[{ required: key === 'resource', message: `Please input ${formattedKey}` }]}>
              <Input
                value={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        return (
          <Form.Item key={key} name={key} label={t(`${key}`)} rules={[{ required: true, message: `Please input ${formattedKey}` }]}>
            <Input value={value} onChange={(e) => handleInputChange(e, key)} />
          </Form.Item>
        );
      })}

      <Modal
        title={t("selectOperation")}
        open={operationVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table
          columns={operationColumn}
          dataSource={OperationData}
          rowKey="operation" 
          pagination={{ pageSize: 6 }}
          onRow={(record) => ({
            onDoubleClick: () => handleOperationOk(record),
          })}
        />
      </Modal>
    </Form>
  );
};

export default ResourceDynamicForm;
