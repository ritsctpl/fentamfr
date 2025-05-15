import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, message, Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { ListContext } from '../hooks/ListContext';
import { fetchListAllbyType, fetchListTop50 } from '@services/listServices';

interface FormValues {
  [key: string]: any;
  list: string;
  category: string;
  description: string;
  maximumNumberOfRow: number;
  type: string;
  allowOperatorToChangeColumnSequence: boolean;
  allowOperatorToSortRows: boolean;
  allowMultipleSelection: boolean;
  showAllActiveSfcsToOperator: boolean;
}

interface OperationData {
  list: string;
  description: string;
  category: string;
}

interface listDynamicFormProps {
  data: any;
  fields: string[];
  onValuesChange: (changedValues: any) => void;
}

const { Option } = Select;
const categoryOptions = [
  { value: 'Browse Work List', label: 'Browse Work List' },
  { value: 'Assembly', label: 'Assembly' },
  // { value: 'Browse Results', label: 'Browse Results' },
  { value: 'DC Collect', label: 'DC Collect' },
  { value: 'POD Work List', label: 'POD Work List' },
  { value: 'DC Entry', label: 'DC Entry' },
  { value: 'Mobile Status', label: 'Mobile Status' },
  { value: 'NC Tree', label: 'NC Tree' },
  { value: 'Sub Step', label: 'Sub Step' },
  { value: 'Tool', label: 'Tool' },
  { value: 'Work Instruction', label: 'Work Instruction' },
];

const typeOptions = [
  { value: 'PCU', label: 'PCU' },
  { value: 'Shop Order', label: 'Shop Order' },
  { value: 'Process Lot', label: 'Process Lot' },
  { value: 'Material', label: 'Material' },
  { value: 'Material / Version', label: 'Material / Version' }
];

const ListDynamicForm: React.FC<listDynamicFormProps> = ({ data, fields, onValuesChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { formData, setFormData } = useContext(ListContext);
  const [operationVisible, setOperationVisible] = useState(false);
  const [OperationData, setOperationData] = useState<OperationData[]>([]);

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value;
    if (key === 'list') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    }
    form.setFieldsValue({ [key]: newValue });
    onValuesChange({ [key]: newValue });
  };

  const handleSwitchChange = (checked: boolean, key: string) => {
    form.setFieldsValue({ [key]: checked });
    onValuesChange({ [key]: checked });
  };

  const handleSubmit = async (values: FormValues) => {
    setFormData(values);
  };

  const handleOperationClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('list');
    console.log(typedValue,'typedValue');
    try {
      let response;
      if (typedValue) {
        response = await fetchListAllbyType(site, { list: typedValue });
        if (response.err) {
          response = [];
        }
      } else {
        response = await fetchListTop50(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.map((item: any, index: number) => ({
          id: index,
          list: item.list,
          description: item.description,
          category: item.category,
        }));
        setOperationData(formattedData);
      } else {
        setOperationData([]);
      }
    } catch (error) {
      console.error('Error', error);
      message.error('Failed to fetch operation data');
    }

    setOperationVisible(true);
  };

  const handleOperationOk = (selectedRow: OperationData | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        list: selectedRow.list,
        description: selectedRow.description,
      });
      onValuesChange({
        list: selectedRow.list,
        description: selectedRow.description,
      });
    }
    setOperationVisible(false);
  };

  const handleCancel = () => {
    setOperationVisible(false);
  };

  const operationColumn = [
    {
      title: t("List"),
      dataIndex: "list",
      key: "list",
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("Category"),
      dataIndex: "category",
      key: "category",
    },
  ];

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={handleSubmit}
      onValuesChange={onValuesChange}
      style={{ width: '100%' }}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 14 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) return null;

        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

        if (key === 'category') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Select>                
                {categoryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'type') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} >
              <Select>
                {typeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'list') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} rules={[{ required: true, message: `Please input ${formattedKey}` }]}>
              <Input
                suffix={<GrChapterAdd onClick={handleOperationClick} />}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'description') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)}>
              <Input
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'maximumNumberOfRow') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[
                {
                  validator: (_, value) => {
                    if (value === undefined || value === '') {
                      return Promise.resolve();
                    }
                    const num = Number(value);
                    if (isNaN(num)) {
                      return Promise.reject(`Please enter a valid number for ${formattedKey}`);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }

        if (key === 'allowOperatorToChangeColumnSequence' || 
            key === 'allowOperatorToSortRows' || 
            key === 'allowMultipleSelection' || 
            key === 'showAllActiveSfcsToOperator') {
          return (
            <Form.Item key={key} name={key} label={t(`${key}`)} valuePropName="checked">
              <Switch onChange={(checked) => handleSwitchChange(checked, key)} />
            </Form.Item>
          );
        }

        return (
          <Form.Item key={key} name={key} label={t(`${key}`)}>
            <Input onChange={(e) => handleInputChange(e, key)} />
          </Form.Item>
        );
      })}

      <Modal
        title={t("selectList")}
        open={operationVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table
          columns={operationColumn}
          dataSource={OperationData}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          onRow={(record) => ({
            onDoubleClick: () => handleOperationOk(record),
          })}
        />
      </Modal>
    </Form>
  );
};

export default ListDynamicForm;