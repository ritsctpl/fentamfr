import React, { useEffect, useState } from 'react';
import { Form, Input, Checkbox, DatePicker, Select, Modal, Table, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { LogNCContext } from '../hooks/logNCContext';
import dayjs from 'dayjs';
import { retrieveDataField } from '@services/logNCService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from "react-icons/gr";

interface DataFieldProps {
  sequence: string;
  dataField: string;
  required: boolean;
  description: string;
  dataType: 'Text' | 'DatePicker' | 'CheckBox' | 'Number' | 'List' | 'Textarea';
  list?: { value: string; label: string }[];
}

const DataFields: React.FC<{ fields: DataFieldProps[] }> = ({ fields }) => {
  const [form] = Form.useForm();
  const { showDataFields, setDataFieldsValue, setTranformDataFields } = React.useContext(LogNCContext);
  const [listOptions, setListOptions] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');

  const { t } = useTranslation();

  console.log("fields", fields);

  const handleFormChange = (changedValues: any, allValues: any) => {
    // console.log('Changed values:', changedValues);
    // console.log('All values:', allValues);
  };

  useEffect(() => {
    setDataFieldsValue(form.getFieldsValue());
  }, []);

  const handleFieldChange = (fieldName: string, value: any) => {
    // debugger
    console.log(`Field ${fieldName} changed to:`, value);
    form.setFieldValue(fieldName, value);
    setDataFieldsValue(form.getFieldsValue());
    // setTranformDataFields(form.getFieldsValue());
  };


  // Add useEffect to fetch list data
  useEffect(() => {
    const cookies = parseCookies();
    const site = cookies.site;
    const fetchListData = async (field: DataFieldProps) => {
      if (field.dataType == 'List') {
        try {
          const request = {
            site,
            dataField: field.dataField
          }

          const response = await retrieveDataField(request);
          console.log("DataField Response", response);
          if (!response.errorCode) {
            setListOptions(response?.listDetails);
          }
          else{
            setListOptions([]);
          }

        } catch (error) {
          console.error(`Error fetching list data for ${field.dataField}:`, error);
        }
      }
    };

    fields.forEach(field => {
      fetchListData(field);
    });
  }, [fields]);

  const handleRowDoubleClick = (record: any) => {
    handleFieldChange(selectedField, record.fieldValue);
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: t('labelValue'),
      dataIndex: 'labelValue',
      key: 'labelValue',
    },
    {
      title: t('fieldValue'),
      dataIndex: 'fieldValue',
      key: 'fieldValue',
    },
  ];

  const renderField = (field: DataFieldProps) => {
    switch (field.dataType) {
      case 'Text':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            required={field.required}
          >
            <Input onChange={(e) => handleFieldChange(field.dataField, e.target.value)} />
          </Form.Item>
        );

      case 'DatePicker':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            required={field.required}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : null
            })}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DDTHH:mm:ss"
              onChange={(date) => handleFieldChange(
                field.dataField,
                dayjs.isDayjs(date) ? date.format("YYYY-MM-DDTHH:mm:ss") : null
              )}
            />
          </Form.Item>
        );

      case 'CheckBox':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            valuePropName="checked"
            required={field.required}
          >
            <Checkbox
              onChange={(e) => handleFieldChange(field.dataField, e.target.checked)}
            >
              {/* {field.description} */}
            </Checkbox>
          </Form.Item>
        );

      case 'Number':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            required={field.required}
          >
            <Input
              type="number"
              onKeyPress={(e) => {
                const charCode = e.which ? e.which : e.keyCode;
                // Allow numbers, decimal point, and backspace
                if (
                  charCode !== 46 && // decimal point
                  charCode > 31 &&
                  (charCode < 48 || charCode > 57)
                ) {
                  e.preventDefault();
                }
                // Prevent multiple decimal points
                if (charCode === 46 && e.currentTarget.value.includes('.')) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = value.split('.');
                const sanitizedValue = parts.length > 2
                  ? `${parts[0]}.${parts.slice(1).join('')}`
                  : value;
                handleFieldChange(field.dataField, sanitizedValue);
              }}
            />
          </Form.Item>
        );

      case 'Textarea':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            required={field.required}
          >
            <Input.TextArea
              rows={2}
              onChange={(e) => handleFieldChange(field.dataField, e.target.value)}
            />
          </Form.Item>
        );

      case 'List':
        return (
          <Form.Item
            key={field.sequence}
            name={field.dataField}
            label={field.description}
            required={field.required}
          >
            <Input
             
              value={form.getFieldValue(field.dataField)}
              onChange={(e) => handleFieldChange(field.dataField, e.target.value)}
              suffix={
                <GrChapterAdd 
                  onClick={() => {
                    setIsModalOpen(true);
                    setSelectedField(field.dataField);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              }
            />
            <Modal
              title={field.description}
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              width={600}
            >
              <Table
                columns={columns}
                dataSource={listOptions}
                onRow={(record) => ({
                  onDoubleClick: () => handleRowDoubleClick(record),
                })}
                pagination={false}
                rowKey="fieldValue"
                size="small"
                bordered
                scroll={{ y: 300 }}
                style={{fontSize: '12px'}}
              />
            </Modal>
          </Form.Item>
        );


      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 400 }}
      onValuesChange={handleFormChange}
    >
      {fields?.map((field) => renderField(field))}
    </Form>
  );
};

export default DataFields;
