import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, DatePicker, message, Tooltip, Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { BomContext } from '@modules/bom/hooks/useContext';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { fetchAllAssyDataType, fetchAllAssyOperation, fetchAllComponent, fetchTop50AssyDataType, fetchTop50AssyOperation, fetchTop50Component } from '@services/BomService';

interface FormValues {
  [key: string]: any;
  bom?: string;
  revision?: string;
  description?: string;
  bomType?: string;
  validFrom?: string;
  validTo?: string;
  status?: string;
  designCost?: string;
  currentVersion?: boolean;
  bomTemplate?: boolean;
  assySequence?: number;
  component?: string;
  componentVersion?: string;
  componentType?: string;
  componentDescription?: string;
  assyOperation?: string;
  assyQty?: string;
  assemblyDataTypeBo?: string;
  storageLocationBo?: string;
  maxUsage?: string;
  maxNc?: string;
}

interface AssyOperationData {
  id: number;
  operation: string;
  revision: string;
  description: string;
  status: string;
  operationType: string;
  currentVersion: string;
}

interface ComponentData {
  id: number;
  item: string;
  revision: string;
  description: string;
  status: string;
  procurementType: string;
  lotSize: string;
  dataType: string;
  category: string;
}

interface DataTypeData {
  id: number;
  dataType: string;
  category: string;
  description: string;
}

interface DynamicFormProps {
  data: any;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
}

const { Option } = Select;
const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Releasable', label: 'Releasable' },
  { value: 'Frozen', label: 'Frozen' },
  { value: 'Hold', label: 'Hold' },
  { value: 'Hold Consec NC', label: 'Hold Consec NC' },
  { value: 'Hold spec viol', label: 'Hold spec viol' },
  { value: 'Hold SPC Warn', label: 'Hold SPC Warn' },
  { value: 'Hold Yield Rate', label: 'Hold Yield Rate' },
  { value: 'Obsolete', label: 'Obsolete' },
];

const componentTypeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Test', label: 'Test' },
  { value: 'Co-product', label: 'Co-product' },
  { value: 'By-product', label: 'By-product' },
  { value: 'By-phantom', label: 'By-phantom' },
];

const bomTypeOptions = [
  { value: 'master', label: 'Master' },
  { value: 'shoporder', label: 'Shop Order' },
  { value: 'sfc', label: 'SFC' },
  { value: 'configurable', label: 'Configurable' }
];

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange }) => {

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { sequence, setSequence } = useContext(BomContext);
  const { mainForm, setMainForm } = useContext(BomContext);


  const [operationVisible, setOperationVisible] = useState(false);
  const [assyOperationData, setAssyOperationData] = useState<AssyOperationData[]>([]);

  const [componentVisible, setComponentVisible] = useState(false);
  const [componentData, setComponentData] = useState<ComponentData[]>([]);

  const [dataTypeVisible, setDataTypeVisible] = useState(false);
  const [dataTypeData, setDataTypeData] = useState<DataTypeData[]>([]);

  console.log("mainFormssss: ", mainForm);
  



  useEffect(() => {
    if (data || mainForm) {
      form.setFieldsValue({
        ...data,
        validFrom: data.validFrom ? dayjs(data.validFrom, 'DD-MM-YYYY') : null,
        validTo: data.validTo ? dayjs(data.validTo, 'DD-MM-YYYY') : null,
        componentVersion: data.componentVersion || '',
        assySequence: data.assySequence ? data.assySequence : sequence,
        assemblyDataTypeBo: data?.assemblyDataTypeBo,
        component: data?.component
      });
    }
  }, [data, sequence, form]);

  let hasShownError = false;

  const validateDates = () => {
    const validFrom = form.getFieldValue('validFrom');
    const validTo = form.getFieldValue('validTo');

    if (validFrom && validTo) {
      const fromDate = dayjs(validFrom, 'DD-MM-YYYY');
      const toDate = dayjs(validTo, 'DD-MM-YYYY');

      if (toDate.isBefore(fromDate)) {
        if (!hasShownError) {
          message.error('Valid To date must be after Valid From date.');
          hasShownError = true;
        }
        return;
      }
    }

    hasShownError = false;
    return;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value;

    if (key === 'component') {
      form.setFieldsValue({
        componentVersion: '',
        componentDescription: '',
      });
      onValuesChange({
        componentVersion: '',
        componentDescription: '',
      });
    }

    const patterns: { [key: string]: RegExp } = {
      bom: /^[A-Z0-9_]*$/,
      revision: /^[A-Z0-9_]*$/,
      description: /.*/,
      designCost: /^\d*\.?\d*$/,
      assySequence: /.*/,
      component: /^[A-Z0-9_]*$/,
      componentVersion: /^[A-Z0-9_]*$/,
      assyOperation: /^[A-Z0-9_]*$/,
      assemblyDataTypeBo: /^[A-Z0-9_]*$/,
      componentType: /.*/,
      componentDescription: /.*/,
      assyQty: /^\d+$/,
      storageLocationBo: /.*/, 
      maxUsage: /^\d+$/,
      maxNc: /^\d+$/,
    };

    if (key === 'bom' || key === 'revision' || key === 'component' || key === 'componentVersion' || key === 'componentDescription' || key === 'assyOperation' || key === 'assemblyDataTypeBo') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    }

    if (patterns[key]?.test(newValue)) {
      if (['designCost', 'assyQty', 'assySequence', 'maxUsage', 'maxNc'].includes(key)) {
        newValue = Math.max(0, parseFloat(newValue)).toString();
      }
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
      return false; // Disable dates if "From" date is not set
    }
    const fromDate = dayjs(validFrom, 'DD-MM-YYYY');
    return current && current.isBefore(fromDate, 'day');
  };

  const handleSwitchChange = (checked: boolean, key: string) => {
    form.setFieldsValue({ [key]: checked });
    onValuesChange({ [key]: checked });
  };

  const handleSubmit = (values: any) => {
    if (!validateDates) {
      return;
    }
    setMainForm(values);
  };

  const handleComponentClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('component');
    const newValue = {
      item: typedValue
    }

    try {
      let response;
      if (typedValue) {
        response = await fetchAllComponent(site, newValue);
      } else {
        response = await fetchTop50Component(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.itemList.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setComponentData(formattedData);
      } else {
        setComponentData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setComponentVisible(true);
  };

  const handleOperationClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('assyOperation');
    const newValue = {
      operation: typedValue
    }

    try {
      let response;
      if (typedValue) {
        response = await fetchAllAssyOperation(site, newValue);

      } else {
        response = await fetchTop50AssyOperation(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.operationList.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setAssyOperationData(formattedData);
      } else {
        setAssyOperationData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setOperationVisible(true);
  };

  const handleDataTypeClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('assemblyDataTypeBo');
    const category = form.getFieldValue('category');

    const newValue = {
      dataType: typedValue,
      category: 'Assembly'
    }

    try {
      let response;
      if (typedValue) {
        response = await fetchAllAssyDataType(site, newValue);

      } else {
        response = await fetchTop50AssyDataType(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.dataTypeList.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setDataTypeData(formattedData);
      } else {
        setDataTypeData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setDataTypeVisible(true);
  };

  const handleComponentInputChange = (fieldName: string, value: string) => {

    let convertedValue = value;
    if (fieldName != 'description') {
      convertedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    }
    form.setFieldsValue({ [fieldName]: convertedValue });

  };

  // const handleBrowseInputChange = (fieldName: string, value: string) => {
  //   if (fieldName != 'description') {
  //   const convertedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
  //   form.setFieldsValue({ [fieldName]: convertedValue });
  //   }
  // };

  // const handleDataTypeInputChange = (fieldName: string, value: string) => {
  //   let convertedValue = value;
  //   if (fieldName != 'description') {
  //     convertedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
  //   }
  //   form.setFieldsValue({ [fieldName]: convertedValue });

  // };

  const handleOperationOk = (selectedRow: AssyOperationData | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        assyOperation: selectedRow.operation,
      });
      onValuesChange({
        assyOperation: selectedRow.operation.toUpperCase(),
      });
    }

    setOperationVisible(false);
  };

  const handleComponentOk = (selectedRow: ComponentData | undefined) => {
    if (selectedRow) {
      const isDuplicate = mainForm?.bomComponentList?.some(
        (item) => item.component === selectedRow.item.toUpperCase()
      );

      if (isDuplicate) {
        message.error('This component is already added to the BOM');
        return;
      }

      form.setFieldsValue({
        component: selectedRow.item,
        componentVersion: selectedRow.revision,
        componentDescription: selectedRow.description,
      });
      onValuesChange({
        component: selectedRow.item.toUpperCase(),
        componentVersion: selectedRow.revision,
        componentDescription: selectedRow.description,
      });
    }

    setComponentVisible(false);
  };

  const handleDataTypeOk = (selectedRow: ComponentData | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        assemblyDataTypeBo: selectedRow.dataType,
        category: selectedRow.category,
      });
      onValuesChange({
        assemblyDataTypeBo: selectedRow.dataType.toUpperCase(),
      });
    }

    setDataTypeVisible(false);
  };

  const handleCancel = () => {
    setOperationVisible(false);
    setComponentVisible(false);
    setDataTypeVisible(false);
  };

  const componentColumn = [
    {
      title: t("item"),
      dataIndex: "item",
      key: "item",
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
      title: t("procurementType"),
      dataIndex: "procurementType",
      key: "procurementType",
    },
    {
      title: t("lotSize"),
      dataIndex: "lotSize",
      key: "lotSize",
    },
  ]

  const assyOperationColumn = [
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
    {
      title: t("currentVersion"),
      dataIndex: "currentVersion",
      key: "currentVersion",
    },
  ]

  const assyDataTypeColumn = [
    {
      title: t("dataType"),
      dataIndex: "dataType",
      key: "dataType",
    },
    {
      title: t("category"),
      dataIndex: "category",
      key: "category",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    }
  ]

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={handleSubmit}
      onValuesChange={(changedValues) => {
        if (changedValues.validFrom || changedValues.validTo) {
          validateDates();
        }

        onValuesChange({
          ...changedValues,
        });
      }}
      style={{ width: '100%' }}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) {
          return null;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

        if (key === 'bomType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please select ${formattedKey}` }]}
            >
              <Select defaultValue={value || 'master'}>
                {bomTypeOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'status') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please select ${formattedKey}` }]}
            >
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
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <DatePicker
                format="DD-MM-YYYY"
                onChange={(date) => handleDateChange(date, key)}
                disabledDate={key === 'validTo' ? disabledDate : undefined}
              />
            </Form.Item>
          );
        }

        if (key === 'currentVersion' || key === 'bomTemplate') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              valuePropName="checked"
            >
              <Switch
                defaultChecked={value}
                onChange={(checked) => handleSwitchChange(checked, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'component') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please input ${formattedKey}` }]}
            >
              <Input
                suffix={
                  <GrChapterAdd
                    onClick={() =>
                      handleComponentClick()
                    }
                  />
                }
                onChange={(e) => handleInputChange(e, key)}
              />

            </Form.Item>
          );
        }

        if (key === 'assyOperation') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                suffix={
                  <GrChapterAdd
                    onClick={() =>
                      handleOperationClick()
                    }
                  />
                }
                onChange={(e) => handleInputChange(e, key)}
              />

            </Form.Item>
          );
        }

        if (key === 'assemblyDataTypeBo') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                suffix={
                  <GrChapterAdd
                    onClick={() =>
                      handleDataTypeClick()
                    }
                  />
                }
                onChange={(e) => handleInputChange(e, key)}
              />

            </Form.Item>
          );
        }

        if (key === 'componentVersion') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please input ${formattedKey}` }]}
            >
              <Input
                value={data.componentVersion}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'description') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                value={data.description}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'designCost') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                type='number'
                min={0}
                value={data.designCost}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'assyQty') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please input ${formattedKey}` }]}
            >
              <Input
                type='number'
                min={0}
                value={data.designCost}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'assySequence') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `Please input ${formattedKey}` }]}
            >
              <Input
                type='number'
                min={0}
                value={sequence}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'componentDescription') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                value={data.designCost}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'maxNc') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                min={0}
                type='number'
                value={data.maxNc}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'maxUsage') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                type='number'
                min={0}
                value={data.maxUsage}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (key === 'componentType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {componentTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'storageLocationBo') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                value={data.storageLocationBo}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        return (
          <Form.Item
            key={key}
            name={key}
            label={t(`${key}`)}
            rules={[{ required: true, message: `Please input ${formattedKey}` }]}
          >
            <Input
              value={value}
              onChange={(e) => handleInputChange(e, key)}
            />
          </Form.Item>
        );
      })}

      <Modal
        title={t("selectAssemblyOperation")}
        open={operationVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record: any) => ({
            onDoubleClick: () => handleOperationOk(record),
          })}
          columns={assyOperationColumn}
          dataSource={assyOperationData}
          rowKey="assyOpeartion"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

      <Modal
        title={t("selectComponent")}
        open={componentVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record: any) => ({
            onDoubleClick: () => handleComponentOk(record),
          })}
          columns={componentColumn}
          dataSource={componentData}
          rowKey="assyOpeartion"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

      <Modal
        title={t("selectAssemblyDataType")}
        open={dataTypeVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record: any) => ({
            onDoubleClick: () => handleDataTypeOk(record),
          })}
          columns={assyDataTypeColumn}
          dataSource={dataTypeData}
          rowKey="assyOpeartion"
          pagination={{ pageSize: 6 }}
        />
      </Modal>
    </Form>
  );
};

export default DynamicForm;
