import React, { useState, useEffect, useContext, useTransition } from 'react';
import { Form, Input, Select, Modal, Table } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import { ServiceExtensionContext } from '../hooks/serviceExtension';
import { useTranslation } from 'react-i18next';
import { fetchAllUsers, fetchServiceActivity, fetchTop50Operation, fetchTop50Sites, fetchTop50Users, retrieveAllOperation } from '@services/serviceExtensionServices';
import { parseCookies } from 'nookies';

const { Option } = Select;

const hookTypes = [
  'Pre Start',
  'Pre Batch Start',
  'Pre Validate Start',
  'Post Start',
  'Pre Complete',
  'Pre Batch Complete',
  'Post Complete',
  'Post Batch Complete',
  'Pre SignOff',
  'Post SignOff'
];

interface HookFormProps {
  onFinish: (values: any) => void;
}

interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
}

const HookForm: React.FC<HookFormProps> = ({ onFinish = () => { } }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const { payloadData, setPayloadData, setShowAlert } = useContext(ServiceExtensionContext);
  const { t } = useTranslation();

  useEffect(() => {
    form?.setFieldsValue(payloadData);
  }, [payloadData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // debugger
    // Fields that need uppercase and special formatting
    const formatFields = ['activityHookId', 'operation', 'operationVersion', 'workCenter', 'resource', 'site'];
    const specialFormatFields = ['hookClass', 'hookMethod', 'targetClass', 'targetMethod']; // New fields

    let formattedValue = value;
    if (formatFields.includes(name)) {
      formattedValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9_*]/g, ''); // Only allow uppercase letters, numbers, underscore and asterisk
    } else if (specialFormatFields.includes(name)) { // New condition for special fields
      if (name === 'hookMethod' || name === 'targetMethod') {
        formattedValue = value.replace(/[^A-Za-z0-9._]/g, ''); // Allow only alphabets, numbers, ., _ and no spaces
      } else {
        formattedValue = value.replace(/[^A-Za-z0-9._$\/]/g, ''); // Allow only alphabets, numbers, ., _, $, / and no spaces
      }
    }

    form.setFieldValue(name, formattedValue);
    setPayloadData((prevData) => ({
      ...prevData,
      [name]: formattedValue
    }));
    setShowAlert(true);
  };

  const handleSelect = (field: string, value: any) => {
    // debugger
    form.setFieldValue(field, value);
    setIsModalOpen(false);
    setPayloadData((prevData) => ({
      ...prevData,
      [field]: value
    }));
    setShowAlert(true);
  };

  const handleTableRowClick = (record: any) => {
    // debugger
    form?.setFieldsValue({
      "extensionActivity": record?.[activeField]
    })

    setPayloadData((prevData) => ({
      ...prevData,
      [activeField]: record?.[activeField]
    }));

    if(activeField == "operation"){
      form?.setFieldsValue({
        operationVersion: record?.revision
      })

      setPayloadData((prevData) => ({
        ...prevData,
        operationVersion: record?.revision
      }));
    }

    setIsModalOpen(false);
    setShowAlert(true);
  };

  const handleClick = async (fieldName) => {
    // debugger
    const cookies = parseCookies()
    const site = cookies?.site;

    if (fieldName == "activity") {
      try {
        let oList;
        if (form?.getFieldsValue()?.user){
          const request = {
            type: "Service"
          }
          oList = await fetchServiceActivity(request);
        } 

        else{
          const request ={
            type: "Service",
            activity: form?.getFieldsValue()?.extensionActivity
          }
          oList = await fetchServiceActivity(request);

}
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        const oTableColumns = [
          { title: t('activityId'), dataIndex: 'activityId', key: 'activityId' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
          { title: t('type'), dataIndex: 'type', key: 'type' },
        ]

        setTableColumns(oTableColumns);
        setTableData(oList || []);
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    }

    else if (fieldName == "site") {
      try {
        // debugger
        let oList;
        oList = await fetchTop50Sites();
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        const oTableColumns = [
          { title: t('site'), dataIndex: 'site', key: 'site' },
          { title: t('description'), dataIndex: 'description', key: 'description' },
        ]
        setTableColumns(oTableColumns);
        setTableData(oList || []);


      } catch (error) {
        console.error("Error fetching site list:", error);
      }
    }

    else if (fieldName == "user") {

      try {
        let oList;
        const oTableColumns = [
          { title: t('user'), dataIndex: 'user', key: 'user' },
          // { title: t('firstName'), dataIndex: 'firstName', key: 'firstName' },
          { title: t('lastName'), dataIndex: 'lastName', key: 'lastName' },
          { title: t('status'), dataIndex: 'status', key: 'status' },
        ]
        setTableColumns(oTableColumns);
        if (form?.getFieldsValue()?.user) {
          oList = await fetchAllUsers({ user: form?.getFieldsValue()?.user });
        }
        else {
          oList = await fetchTop50Users({ site: site });
        }
        oList = oList.map((item, index) => ({
          ...item,
          key: index
        }));
        setTableData(oList || []);


      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    }


  }

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 10 },
  };

  return (
    <>
      <Form
        {...formLayout}
        form={form}
        onFinish={onFinish}
        layout="horizontal"

      >
        <Form.Item
          label={t('executionPointId')}
          name="activityHookId"
          required
        >
          <Input
            onChange={handleInputChange}
            name="activityHookId"
          />
        </Form.Item>

        <Form.Item
          label={t('description')}
          name="description"
        >
          <Input
            onChange={handleInputChange}
            name="description"
          />
        </Form.Item>

        <Form.Item
          label={t('targetClass')}
          name="targetClass"
          required
        >
          <Input
            onChange={handleInputChange}
            name="targetClass"
          />
        </Form.Item>

        <Form.Item
          label={t('targetMethod')}
          name="targetMethod"
          required
        >
          <Input
            onChange={handleInputChange}
            name="targetMethod"
          />
        </Form.Item>

        <Form.Item
          label={t('executionPoint')}
          name="hookPoint"
        >
          <Select
            defaultValue="Pre Start"
            onChange={(value) => handleSelect("hookPoint", value)}
          >
            {hookTypes.map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t('extensionActivity')}
          name="extensionActivity"
        >
          <Input
            onChange={handleInputChange}
            name="extensionActivity"
            suffix={
              <GrChapterAdd
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveField('activity');
                  setIsModalOpen(true);
                  handleClick("activity");
                }}
              />
            } />
        </Form.Item>

        {/* <Form.Item
          label={t('hookType')}
          name="hookType"
        >
          <Input
            onChange={handleInputChange}
            name="hookType"
          />
        </Form.Item> */}

        {/* <Form.Item
          label={t('hookClass')}
          name="hookClass"
          required
        >
          <Input
            onChange={handleInputChange}
            name="hookClass"
          />
        </Form.Item>

        <Form.Item
          label={t('hookMethod')}
          name="hookMethod"
         required
        >
          <Input
            onChange={handleInputChange}
            name="hookMethod"
          />
        </Form.Item> */}

        <Form.Item
          label={t('executionMode')}
          name="executionMode"
        >
          <Select
            defaultValue="Async"
            onChange={(value) => handleSelect("executionMode", value)}
          >
            <Option value="Async">Async</Option>
            <Option value="Sync">Sync</Option>
          </Select>
        </Form.Item>

        {/* <Form.Item
          label={t('operation')}
          name="operation"
        >
          <Input
            onChange={handleInputChange}
            name="operation"
            suffix={
              <GrChapterAdd
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveField('operation');
                  setIsModalOpen(true);
                  handleClick("operation");
                }}
              />
            } />
        </Form.Item>

        <Form.Item
          label={t('version')}
          name="operationVersion"
        >
          <Input
            onChange={handleInputChange}
            name="operationVersion"
          />
        </Form.Item>

        <Form.Item
          label={t('workCenter')}
          name="workCenter"
        >
          <Input
            onChange={handleInputChange}
            name="workCenter"
            suffix={
              <GrChapterAdd
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveField('workCenter');
                  setIsModalOpen(true);
                  handleClick("workCenter");
                }}
              />
            } />
        </Form.Item>

        <Form.Item
          label={t('resource')}
          name="resource"
        >
          <Input
            name="resource"
            onChange={handleInputChange}
            suffix={
              <GrChapterAdd
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveField('resource');
                  setIsModalOpen(true);
                  handleClick("resource");
                }}
              />
            } />
        </Form.Item>

        <Form.Item
          label={t('site')}
          name="site"
        >
          <Input
            onChange={handleInputChange}
            name="site"
            suffix={
              <GrChapterAdd
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveField('site');
                  setIsModalOpen(true);
                  handleClick("site");
                }}
              />
            } />
        </Form.Item> */}

      </Form>

      <Modal
        title={t('select') + ' ' + t(activeField)}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={tableColumns}
          dataSource={tableData}
          pagination={false}
          scroll={{ y: 'calc(100vh - 445px)' }}
          bordered
          size='small'
          onRow={(record) => ({
            onClick: () => handleTableRowClick(record)
          })}
        />
      </Modal>
    </>
  );
};

export default HookForm;
