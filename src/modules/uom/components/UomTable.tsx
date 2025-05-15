import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Button, Form, Input, message, Select, Table, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
import { createUom, deleteUom, retrieveAllUom, updateUom } from '@services/uomService';
import { UomContext } from '../hooks/UomContext';


interface DataType {
  key: string; // Change key to string to accommodate UUIDs
  sequence: number;
  name: string;
  uomCode: string;
  description: string;
  site: string
  status: string;
}



const UomTable: React.FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { uomPayloadData, setUomPayloadData, username } = useContext<any>(UomContext);
  const { t } = useTranslation();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataType | null>(null);

  // Use useCallback for memoized functions
  const fetchAllUomData = useCallback(async () => {
    try {
      const { site } = parseCookies();
      const response = await retrieveAllUom(site);
      if (response && !response.errorCode && response.length > 0) {
        const formattedResponse = response.map((item, index) => ({
          ...item,
          id: index,
          key: index
        }));
        setDataSource(formattedResponse);
        console.log("fetchAllUomData response: ", formattedResponse);
      }
    } catch (error) {
      console.error("Error fetching UOM data:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllUomData();
  }, [fetchAllUomData]);

  // Memoize the columns array
  const columns = React.useMemo(() => [
    {
      title: t('uomCode'),
      dataIndex: 'uomCode',
      key: 'uomCode',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: any, record: DataType) =>
        record.uomCode.toString().toLowerCase().includes(value.toLowerCase()),
      render: (text: string) => <span>{text}</span>, // Change to plain text
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: any, record: DataType) =>
        record.description.toString().toLowerCase().includes(value.toLowerCase()),
      render: (text: string) => <span>{text}</span>, // Change to plain text
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value: any, record: DataType) =>
        record.status.toString().toLowerCase().includes(value.toLowerCase()),
      render: (text: string) => <span>{text}</span>,
    },
  ], [t]);

  // Optimize form handling
  const handleFormInputChange = useCallback((fieldName: string, value: string) => {
    setUomPayloadData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
    setIsFormDirty(true);
  }, [setUomPayloadData]);

  // Optimize CRUD operations
  const handleCrudOperation = useCallback(async (operation: 'create' | 'update' | 'delete') => {
    if (operation === 'delete' && !uomPayloadData.uomCode) {
      message.error('UOM Code cannot be empty');
      return;
    }

    if (operation !== 'delete') {
      if (!uomPayloadData.uomCode) {
        message.error('UOM Code cannot be empty');
        return;
      } else if (!uomPayloadData.description) {
        message.error('Description cannot be empty');
        return;
      }
    }

    try {
      const { site } = parseCookies();
      const payload = {
        ...uomPayloadData,
        site,
        userId: username,
        conversionFactor: "",
        status: form.getFieldValue('status')
      };

      if (operation === 'delete') {
        delete payload.userId;
        delete payload.conversionFactor;
        delete payload.status;
        delete payload.description;
      }

      const apiCall = operation === 'create' ? createUom :
        operation === 'update' ? updateUom : deleteUom;
      console.log(operation + " request: ", payload);
      const response = await apiCall(payload);
      console.log(operation + " response: ", response);
      if (response && !response.errorCode) {
        message.success(response.message_details.msg);
        await fetchAllUomData(); // Fetch updated data
        if (operation == "delete")
          handleClear();
        setIsFormDirty(false); // Reset form dirty state
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error(`Error ${operation}ing UOM:`, error);
    }
  }, [uomPayloadData, username, form, fetchAllUomData]);

  const handleSubmit = (values: any) => {
    // console.log('Form Data Submitted:', values);
    // Add your form submission logic here (e.g., API call)
  };

  const handleSelectChange = (field: string, value: string) => {
    setUomPayloadData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setIsFormDirty(true);
    console.log(`${field} changed to:`, value);
  };

  const handleClear = () => {
    form.setFieldsValue({
      sequence: "",
      uomCode: "",
      description: "",
      status: "Active"
    });
    setUomPayloadData({
      sequence: "",
      uomCode: "",
      description: "",
      status: "Active"
    });
    setIsFormDirty(false);
    setSelectedRowKeys([]);
  }

  const handleRowSelection = useCallback((record: DataType) => {
    if (isFormDirty) {
      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: () => {
          setSelectedRecord(record);
          updateFormWithRecord(record);
          setIsFormDirty(false);
        },
        onCancel: () => {
          // Do nothing, keep the current form state
        },
      });
    } else {
      setSelectedRecord(record);
      updateFormWithRecord(record);
    }
  }, [isFormDirty, t]);

  const updateFormWithRecord = (record: DataType) => {
    const newSelectedRowKeys = [record.key];
    setSelectedRowKeys(newSelectedRowKeys);
    form.setFieldsValue({
      uomCode: record.uomCode,
      description: record.description,
      status: record.status,
    });
    setUomPayloadData({
      uomCode: record.uomCode,
      description: record.description,
      status: record.status,
    });
    setIsFormDirty(false);
  };

  return (
    <div style={{ height: 'auto', position: "sticky" }}>
      <div style={{ marginBottom: '3%', marginTop: '2%' }}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 4 }}
        >
          <Form.Item
            label={t("uomCode")}
            name="uomCode"
            initialValue=""
            required={true}
          >
            <Input
              placeholder=""
              onKeyDown={(e) => {
                // Allow lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and specific keys
                if (!/^[a-zA-Z0-9_]$/.test(e.key) &&
                  !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}

              onChange={(e) => handleFormInputChange("uomCode", e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label={t("description")}
            name="description"
            initialValue=""
            required={true}
          >
            <Input
              placeholder=""
              onKeyDown={(e) => {
                // Allow lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and specific keys
                if (!/^[a-zA-Z0-9_]$/.test(e.key) &&
                  !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                  e.preventDefault();
                }
              }}

              onChange={(e) => {
                handleFormInputChange("description", e.target.value);
              }}
            />
          </Form.Item>

          <Form.Item
            label={t("status")}
            name="status"
            initialValue="Active"
            required={true}
          >
            <Select
              onChange={(value) => handleSelectChange("status", value)}
            >
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button type="primary" onClick={() => handleCrudOperation('create')}>
                {t('create')}
              </Button>
              <Button type="primary" onClick={() => handleCrudOperation('update')}>
                {t('update')}
              </Button>
              <Button type="primary" onClick={() => handleCrudOperation('delete')}>
                {t('delete')}
              </Button>
              <Button type="default" onClick={handleClear}>
                {t('clear')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>

      <Table
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys),
        }}
        onRow={(record) => ({
          onClick: () => handleRowSelection(record),
          style: { fontSize: '13.5px' }
        })}
        columns={columns}
        dataSource={dataSource}
        // pagination={{ pageSize: 5 }}
        pagination={false}
        rowKey="key"
        scroll={{ y: 'calc(100vh - 430px)' }}
        size="small"
      />
    </div>
  );
};

export default UomTable;
