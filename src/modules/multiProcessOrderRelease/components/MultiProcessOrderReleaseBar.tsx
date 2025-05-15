'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, Button, Space, Modal, Table, DatePicker } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { fetchProcessAllData, fetchProcessTop50 } from '@services/processOrderService';
import { fetchAllMaterial, fetchAllWorkCenter, fetchTop50Material, fetchTop50WorkCenter } from '@services/cycleTimeService';
import type { Dayjs } from 'dayjs';

interface MultiProcessOrderReleaseBarProps {
  onValuesChange: (values: any) => void;
}

const MultiProcessOrderReleaseBar: React.FC<MultiProcessOrderReleaseBarProps> = ({ onValuesChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [orderNumberVisible, setOrderNumberVisible] = useState(false);
  const [orderNumberData, setOrderNumberData] = useState([]);

  const [materialVisible, setMaterialVisible] = useState(false);
  const [materialData, setMaterialData] = useState([]);

  const [workCenterVisible, setWorkCenterVisible] = useState(false);
  const [workCenterData, setWorkCenterData] = useState([]);

  const handleClear = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    setOrderNumberVisible(false);
    setMaterialVisible(false);
    setWorkCenterVisible(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value;

    const patterns: { [key: string]: RegExp } = {
      orderNumber: /^[A-Z0-9_]*$/,
    };

    if (key === 'orderNumber') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    }

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
      onValuesChange({ [key]: newValue });
    }
  };

  // Order Number

  const handleOrderNumberClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const orderNumber = form.getFieldValue('orderNumber');

    try {
      let response;
      if (orderNumber) {
          const responses = await fetchProcessAllData(site, orderNumber);
          response = responses?.processOrderResponseList;

          console.log(response, 'response');
          

      } else {
          response = await fetchProcessTop50(site);
          console.log(response, 'response');
      }

      if (response && !response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
              id: index,
              ...item,
          }));
          setOrderNumberData(formattedData);
      } else {
          setOrderNumberData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setOrderNumberVisible(true);
  };

  const handleOrderNumberOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        orderNumber: selectedRow.orderNumber,
        orderType: selectedRow.orderType,
        status: selectedRow.status,
      });
      onValuesChange({
        orderNumber: selectedRow.orderNumber,
        orderType: selectedRow.orderType,
        status: selectedRow.status,
      });
    }

    setOrderNumberVisible(false);
  };

  const orderNumberColumn = [
    {
      title: t("orderNumber"),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: t("orderType"),
      dataIndex: "orderType",
      key: "orderType",
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
    },
  ]

  // Material

  const handleMaterialClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('material');

    const newValue = {
      item: typedValue,
    }

    try {
      let response;
      if (typedValue) {
          response = await fetchAllMaterial(site, newValue);

      } else {
          response = await fetchTop50Material(site);
      }

      if (response && !response.errorCode) {
          const formattedData = response.itemList.map((item: any, index: number) => ({
              id: index,
              ...item,
          }));
          setMaterialData(formattedData);
      } else {
          setMaterialData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setMaterialVisible(true);
  };

  const handleMaterialOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        material: selectedRow.item,
        materialVersion: selectedRow.revision,
      });
      onValuesChange({
        material: selectedRow.item,
        materialVersion: selectedRow.revision,
      });
    }

    setMaterialVisible(false);
  };

  const materialColumn = [
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
  ]

  // Work Center

  const handleWorkCenterClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('workCenter');

    const newValue = {
      workCenter: typedValue,
    }

    try {
      let response;
      if (typedValue) {
          response = await fetchAllWorkCenter(site, newValue);

      } else {
          response = await fetchTop50WorkCenter(site);
      }

      if (response && !response.errorCode) {
          const formattedData = response.workCenterList.map((item: any, index: number) => ({
              id: index,
              ...item,
          }));
          setWorkCenterData(formattedData);
      } else {
          setWorkCenterData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }

    setWorkCenterVisible(true);
  };

  const handleWorkCenterOk = (selectedRow: any | undefined) => {
    if (selectedRow) {
      form.setFieldsValue({
        workCenter: selectedRow.workCenter,
      });
      onValuesChange({
        workCenter: selectedRow.workCenter,
      });
    }

    setWorkCenterVisible(false);
  };

  const workCenterColumn = [
    {
      title: t("workCenter"),
      dataIndex: "workCenter",
      key: "workCenter",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
    },
  ]

  const handleDateChange = (date: Dayjs | null, fieldName: string) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD');

      form.setFieldsValue({ [fieldName]: formattedDate });
      onValuesChange({ [fieldName]: formattedDate });
    } else {
      form.setFieldsValue({ [fieldName]: null });
      onValuesChange({ [fieldName]: null });
    }
  };

  return (
    <div style={{ width: '100%', paddingLeft: '16px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', }}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={onValuesChange}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '16px',
          alignItems: 'center',
          margin: '16px 16px 16px 0px',
          height: '100px',
        }}
      >
        <Form.Item
          name="orderNumber"
          label={t("processOrder")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Input
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleOrderNumberClick()
                }
              />
            }
            onChange={(e) => handleInputChange(e, 'orderNumber')}
          />
        </Form.Item>

        <Form.Item
          name="select"
          label={t("orderType")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Select
            placeholder="Select Order Type"
            options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Inspection', label: 'Inspection' },
              { value: 'Rework', label: 'Rework' },
              { value: 'Production', label: 'Production' },
              { value: 'Repetitive', label: 'Repetitive' },
              { value: 'RMA', label: 'RMA' },
              { value: 'Tooling', label: 'Tooling' },
              { value: 'Spare', label: 'Spare' },
              { value: 'Installation', label: 'Installation' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="material"
          label={t("material")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Input
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleMaterialClick()
                }
              />
            }
            onChange={(e) => handleInputChange(e, 'material')}
          />
        </Form.Item>

        <Form.Item
          name="materialVersion"
          label={t("materialVersion")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="workCenter"
          label={t("workCenter")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
            <Input
            suffix={
              <GrChapterAdd
                onClick={() =>
                  handleWorkCenterClick()
                }
              />
            }
            onChange={(e) => handleInputChange(e, 'workCenter')}
          />
        </Form.Item>

        <Form.Item
          name="plannedStart"
          label={t("plannedStart")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <DatePicker 
            showTime
            style={{ width: '100%' }}
            // format="YYYY-MM-DD HH:mm:ss"
            onChange={(date) => handleDateChange(date, 'plannedStart')}
          />
        </Form.Item>

        <Form.Item
          name="plannedCompletion"
          label={t("plannedCompletion")}
          style={{
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <DatePicker 
            showTime
            style={{ width: '100%' }}
            // format="YYYY-MM-DD HH:mm:ss"
            onChange={(date) => handleDateChange(date, 'plannedCompletion')}
          />
        </Form.Item>

        <Form.Item
          style={{
            marginBottom: '-20px',
            width: '100%',
          }}
        >
          <Space size={16}>
            <Button onClick={handleClear}>
              {t('clear')}
            </Button>
            <Button type="primary" htmlType="submit">
              {t('go')}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        title={t("selectOrderNumber")}
        open={orderNumberVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
            onDoubleClick: () => handleOrderNumberOk(record),
          })}
          columns={orderNumberColumn}
          dataSource={orderNumberData}
          rowKey="orderNumber"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

      <Modal
        title={t("selectMaterial")}
        open={materialVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
              onDoubleClick: () => handleMaterialOk(record),
          })}
          columns={materialColumn}
          dataSource={materialData}
          rowKey="material"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

      <Modal
        title={t("selectWorkCenter")}
        open={workCenterVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record) => ({
              onDoubleClick: () => handleWorkCenterOk(record),
          })}
          columns={workCenterColumn}
          dataSource={workCenterData}
          rowKey="workCenter"
          pagination={{ pageSize: 6 }}
        />
      </Modal>
    </div>
  );
};

export default MultiProcessOrderReleaseBar;
