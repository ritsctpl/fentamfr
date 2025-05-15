import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Row, Col, Space } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { OperationContext } from '../hooks/recipeContext';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';

const { TextArea } = Input;
const { Option } = Select;

const UppercaseInput: React.FC<any> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^A-Z0-9_]/g, '');
    onChange(newValue);
  };

  return <Input {...props} value={value} onChange={handleChange} />;
};

const uiResource: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Resoure',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'resource',
  tabledataApi: "resource-service"
};
const uiWorkCenterId: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select Work Center',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'workCenter',
  tabledataApi: "workcenter-service"
};
const WorkCentersTab: React.FC = () => {
  const { t } = useTranslation();
  const { formData, setIsHeaderShow, setIsTableShowInActive, setIsFullScreen, setFormData } = useContext(OperationContext);
  const [workCenters, setWorkCenters] = useState(formData?.workCenters || []);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [resource, setResource] = useState<string>("");
  const [workCenterId, setWorkCenterId] = useState<string>("");
  const [form] = Form.useForm();

  const cookies = parseCookies();
  const userId = cookies.rl_user_id;

  useEffect(() => {
    setWorkCenters(formData?.workCenters);
  }, [formData]);

  const generateWorkCenterId = () => {
    const timestamp = Date.now();
    return `WC_${timestamp}`;
  };

  const handleAddNew = () => {
    setFormVisible(true);
    form.resetFields();
    setIsFullScreen(true);
    setIsHeaderShow(true);
    form.setFieldsValue({ resource: "" });
    setResource("");
    setWorkCenterId("");
    const paddedNumber = (workCenters?.length || 0) * 10 + 10;
   
    form.setFieldsValue({
      sequence: paddedNumber
    });
  };
  const handleResourceChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setResource("");
      form.setFieldsValue({ resource: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resource;
      setResource(newValue);
      form.setFieldsValue({ resource: newValue });
    }
  };
  const handleWorkCenterIdChange = (newValues: any[]) => {
    if (newValues.length === 0) {
      setWorkCenterId("");
      form.setFieldsValue({ workCenterId: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].workCenter;
      setWorkCenterId(newValue);
      form.setFieldsValue({ workCenterId: newValue });
    }
  };  


  const handleFinish = (values: any) => {
    console.log("newWorkCenter");
    const newWorkCenter = {
      ...selectedWorkCenter,
      ...values,
    };

    if (selectedWorkCenter) {
      console.log("newWorkCenterIf");
      const updatedData = (workCenters || []).map((item) =>
        item.workCenterId === selectedWorkCenter.workCenterId ? newWorkCenter : item
      );

      // setWorkCenters(updatedData);
      setFormData((prevFormData) => ({
        ...prevFormData,
        workCenters: updatedData,
      }));
    } else {
      console.log("newWorkCenterIf");
      const currentWorkCenters = workCenters || [];
      setWorkCenters([...currentWorkCenters, newWorkCenter]);

      setFormData((prevFormData) => ({
        ...prevFormData,
        workCenters: [...currentWorkCenters, newWorkCenter],
      }));
    }

    form.resetFields();
    setFormVisible(false);
    setSelectedWorkCenter(null);
  };

  const handleRowClick = (record: any) => {
    setResource(record.resource);
    setWorkCenterId(record.workCenterId);
    setSelectedWorkCenter(record);
    form.setFieldsValue(record);
    setFormVisible(true);
    setIsFullScreen(true);
    setIsHeaderShow(true);
    setIsTableShowInActive(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedWorkCenter(null);
    // setIsFullScreen(false);
    setIsHeaderShow(false);
    form.resetFields();
  };

  const handleRemoveSelected = () => {
    const updatedData = workCenters.filter((item) => !selectedRowKeys.includes(item.workCenterId));
    setWorkCenters(updatedData);
    setSelectedRowKeys([]);
  };

  const handleRemoveAll = () => {
    setWorkCenters([]);
    setSelectedRowKeys([]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      workCenters: null,
    }));
  };

  const columns = [
    { title: 'Work Center', dataIndex: 'workCenterId', key: 'workCenterId'},
    { title: 'Resource', dataIndex: 'resource', key: 'resource' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    
    { title: 'System Status', dataIndex: 'systemStatus', key: 'systemStatus' },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: string[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <Row>
      <Col span={formVisible ? 12 : 24} style={{ transition: 'width 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}></h3>
          <Space style={{ marginBottom: 16, display: 'flex', marginRight: '20px' }}>
            <Button onClick={handleAddNew}>
              {t('insert')}
            </Button>
            <Button onClick={handleRemoveAll} style={{ marginLeft: '8px' }}>
            {t('removeAll')}
            </Button>
            <Button onClick={handleRemoveSelected} disabled={selectedRowKeys.length === 0} style={{ marginLeft: '8px' }}>
            {t('removeSelected')}
            </Button>
          </Space>
        </div>
        
        <Table
          dataSource={workCenters}
          columns={columns}
          bordered={true}
          rowKey="workCenterId"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          // pagination={{ pageSize: 5 }}
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
          rowSelection={rowSelection}
          style={{ width: '100%' }}
        />
      </Col>
      
      {formVisible && (
        <Col span={12} style={{ padding: '16px', borderLeft: '1px solid #d9d9d9', overflow: 'auto', height: '80vh', transition: 'width 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>{selectedWorkCenter ? "Edit Work Center" : "Add Work Center"}</h2>
            <Button onClick={handleCloseForm} type="link"><CloseIcon sx={{ color: '#1874CE' }}/></Button>
          </div>
          
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item name="workCenterId" label="Work Center ID" rules={[{ required: true }]}>
            <DynamicBrowse
                    uiConfig={uiWorkCenterId}
                    initial={workCenterId}
                    onSelectionChange={handleWorkCenterIdChange}
                  />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
            <Form.Item name="resource" label="Resource" rules={[{ required: true }]}>
            <DynamicBrowse
                    uiConfig={uiResource}
                    initial={resource}
                    onSelectionChange={handleResourceChange}
                  />
            </Form.Item>
            <Form.Item name="systemStatus" label="System Status">
              <Select defaultValue="Operational">
                <Option value="Operational">Operational</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
            <Form.Item name="sequence" label="Sequence" rules={[{ required: true }]}>
              <Input type="number" disabled={true} min={0} />
            </Form.Item>
            <Form.Item name="capacity" label="Capacity (L)" >
              <Input type="number" />
            </Form.Item>
            <Form.Item name="shiftDetails" label="Shift Details">
              <TextArea />
            </Form.Item>
            <Form.Item name="operatorId" label="Operator ID">
              <UppercaseInput />
            </Form.Item>
            <Form.Item name="maintenanceSchedule" label="Maintenance Schedule">
              <Input />
            </Form.Item>
            <Form.Item name="tooling" label="Tooling">
              <Select mode="multiple">
                <Option value="Wrench">Wrench</Option>
                <Option value="Screwdriver">Screwdriver</Option>
                <Option value="Drill">Drill</Option>
              </Select>
            </Form.Item>
            <Form.Item name="calibrationStatus" label="Calibration Status">
              <Input />
            </Form.Item>
            <Form.Item name="targetCycleTime" label="Target Cycle Time (h)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="locationId" label="Location ID">
              <UppercaseInput />
            </Form.Item>
            <Form.Item name="phasesHandled" label="Phases Handled">
              <Select mode="multiple">
                <Option value="PHASE001">PHASE001</Option>
                <Option value="PHASE002">PHASE002</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {selectedWorkCenter ? "Update Work Center" : "Add Work Center"}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      )}
    </Row>
  );
};

export default WorkCentersTab;
